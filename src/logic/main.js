module.exports = (self) => {
    const matrixSdk = require('matrix-js-sdk');
    const ContentRepo = matrixSdk.ContentRepo;
    const riot = require('riot');
    const route = require('riot-route');
    // Global access for the singleton dispatcher
    window.dis = require('./dispatcher.js');

    const { matrixReduce, wrapSyncingClient } = require('matrix-redux-wrap');

    let reduxState = {};

    // The redux store has been updated, map state to view state
    // XXX: When React is introduced, .update will be replaced
    // with .setState
    function updateView() {
        const STATUS_UNKNOWN = 'CONNECTION_STATUS_UNKNOWN';
        const STATUS_CONNECTED = 'CONNECTION_STATUS_CONNECTED';
        const STATUS_RECONNECTING = 'CONNECTION_STATUS_RECONNECTING';
        const STATUS_DISCONNECTED = 'CONNECTION_STATUS_DISCONNECTED';
        self.update({
            connectionStatus: {
                SYNCING: STATUS_CONNECTED,
                PREPARED: STATUS_CONNECTED,
                RECONNECTING: STATUS_RECONNECTING,
                ERROR: STATUS_DISCONNECTED,
            }[reduxState.mrw.wrapped_state.sync.state] || STATUS_UNKNOWN
        });

        self.update({
            roomList: trackedRooms.map(roomId => reduxState.mrw.wrapped_state.rooms[roomId]);
        });
    }

    // XXX: For now, register a listener to keep redux store state and call
    // `update` on the view.
    dis.registerStore({
        onAction: (action) => {
            reduxState = matrixReduce(action, reduxState);

            updateView();
        },
    });

    dis.registerStore(self);

    route.base('#/');
    route(
        '/journal/*',
        (path) => {
            if (!self.isLoggedIn) {
                return;
            }
            console.log('Now viewing', path);
            if (path[0] !== '!') {
                cli.resolveRoomAlias('#' + path).then(resp => {
                    currentRoomId = resp.room_id;
                    doViewBlog();
                });
                return;
            }
            currentRoomId = path;
            doViewBlog();
        }
    );
    route('/journal',   () => {route('/journal/journal:ldbco.de');});
    route('/',          () => {route('/journal/journal:ldbco.de');});

    self.update({
        noBlogsMsg : "---------------------no-blog-posts-yet---------------------"
    });

    let cli = null;

    let admins = []; // Authors of the current blog

    let currentRoomId = "";
    self.currentRoom = null;
    self.roomList = [];
    self.homeserverUrl = null;

    let creds = null;

    let access_token = null;
    let trackedRooms = JSON.parse(localStorage.getItem('mx_tracked_rooms')) || [];

    self.onAction = (action) => {
        if (!action) return;
        switch(action.type) {
            case 'login_password':
                doLoginWithPassword(
                    action.payload.homeserverUrl,
                    action.payload.userId,
                    action.payload.password,
                    action.payload.rememberMe
                );
            break;
            case 'login_guest':
                doLoginAsGuest(action.payload.homeserverUrl);
            break;
            case 'logout':
                doLogout();
            break;
            case 'alias_change':
                cli.createAlias(
                    action.payload.value, currentRoomId
                ).done(() => {
                    // Set canonical (main) alias
                    cli.sendStateEvent(
                        currentRoomId,
                        'm.room.canonical_alias', { alias: action.payload.value }, ''
                    );
                    dis.dispatch({
                        type: 'view_blog',
                        payload: {
                            addr: action.payload.value.slice(1), // remove #
                        }
                    });
                }, (err) => {
                    console.error(err);
                });
            case 'room_avatar_change':
                cli.uploadContent(action.payload.file).then(function(url) {
                    self.update({room_avatar_url: cli.mxcUrlToHttp(url)});
                    return cli.sendStateEvent(currentRoomId, 'm.room.avatar', {url: url}, '');
                });
            break;
            case 'topic_change':
                cli.setRoomTopic(currentRoomId, action.payload.value);
            break;
            case 'view_blog':
                route('/journal/' + action.payload.addr);
            break;
        }
    }

    // Init redux store
    dis.dispatch(undefined);

    // Initial loaded state
    self.update({
        entries: [],
        canCreateNewPost: false,
        isLoggedIn: false,
        showCreateRoomForm: false,
        showCreateBlogForm: false,
    });

    let ueDebounce = null;
    let updateEntriesDebounce = (delay) => {
        clearTimeout(ueDebounce);
        ueDebounce = setTimeout(
            updateEntries, delay
        );
    };

    let getCurrentTimeline = () => {
        const room = cli.getRoom(currentRoomId);
        if (!room) return null;
        return room.getLiveTimeline();
    }

    let scrollback = () => {
        const shouldPaginate =
            document.body.scrollTop >= document.body.scrollHeight - window.innerHeight * 2;
        if (shouldPaginate) {
            const room = cli.getRoom(currentRoomId);
            if (!room.oldState.paginationToken) {
                return;
            }
            const l = room.timeline.length;
            self.update({
                loadingStatus: "LOADING_STATUS_LOADING",
            });
            cli.scrollback(room).done(() => {
                if (room.timeline.length !== l) {
                    updateEntriesDebounce(200);
                }
            });
        }
    }

    window.addEventListener('scroll', () => {
        scrollback();
    });

    const getAuthor = (userId) => {
        const member = self.currentRoom.getMember(userId);
        if (!member) {
            return {};
        }
        const au = member.getAvatarUrl(self.homeserverUrl,
            250, 250, 'crop', false
        );
        return {
            display_name: member.name,
            avatar_url: au,
            is_guest: !member.name
        }
    };

    let updateEntries = () => {
        if (!getCurrentTimeline() || !getCurrentTimeline().getEvents()) {
            return; // No events yet
        }

        let allEntries = getCurrentTimeline().getEvents().sort((a, b) => b.getTs() - a.getTs());


        let seenByAcc = 0;
        allEntries.forEach((e) => {
            seenByAcc += self.currentRoom.getReceiptsForEvent(e).length;
            e.seenByAcc = seenByAcc;
        });

        entries = allEntries.filter((e) => e.event.type === 'j.blog.post');

        // Transform into view
        entries = entries.map((e) => {
            let comments = allEntries.filter(
                (e2) => e2.event.type === 'j.blog.comment'
                        && (e2.event.content.parent === e.getId() || e2.event.content.in_response_to === e.getId())
                        && e2.event.content.body.trim() !== ''
            ).sort(
                (a, b) => a.getTs() - b.getTs()
            ).map(
                (e2) => {
                    const commenter = getAuthor(e2.getSender());
                    return {
                        content : e2.event.content.body,
                        id : e2.getId(),
                        isMine : e2.getSender() === creds.user_id,
                        deleteEntry : () => {
                            doDeleteEntry(e2.getId());
                        },
                        sender : e2.getSender(),
                        author : commenter,
                        datetime : new Date(e2.getTs()).toLocaleString(),
                    };
                }
            );
            let author = getAuthor(e.getSender());

            return {
                id : e.getId(),
                isMine : e.event.sender === creds.user_id,
                // TODO: sanitise self
                html : e.event.content.body,
                comments : comments,
                deleteEntry : () => {
                    doDeleteEntry(e.getId());
                },
                comment : function (ev) {
                    doNewComment(
                        e.getId(),
                        // TODO: fix fun hack to get the input box
                        Array.from(ev.currentTarget.parentElement.children).find(
                            (e) => e.name==='comment_text'
                        ).value
                    );
                },
                author : author,
                datetime : new Date(e.getTs()).toLocaleString(),
                seenBy : e.seenByAcc,
            }
        });

        if (entries.length < 10) {
            scrollback();
        }

        const alias = self.currentRoom.getCanonicalAlias();
        self.update({
            entries: entries,
            aliasInputValue: alias ? alias.slice(1) : null,
            loadingStatus: "LOADING_STATUS_DONE",
        });
    }

    let updateCurrentRoom = (room) => {
        self.currentRoom = room;
        self.currentRoom.name = room.name;
        self.currentRoom.subscribers = room.getJoinedMembers().length;

        const topicEvent = room.currentState.getStateEvents('m.room.topic', '');
        self.currentRoom.topic = topicEvent ? topicEvent.getContent().topic : null;
    }

    doCreateBlog = () => {
        cli.createRoom({
            visibility: 'public',
            preset: self.refs.room_join_rule_input.value,
            name: self.refs.room_name_input.value
        }).then((resp) => {
            console.log("New room created: " + resp.room_id);
            route('/journal/' + resp.room_id);
            cli.sendStateEvent(
                resp.room_id, "m.room.power_levels", {
                    "state_default": 50,
                    "events_default": 0,
                    "users_default": 0,
                    "invite": 0,
                    "redact": 50,
                    "kick": 50,
                    "ban": 50,
                    "events": {
                        "m.room.power_levels": 100,
                        "m.room.history_visibility": 100,
                        "m.room.avatar": 50,
                        "m.room.name": 50,
                        "m.room.topic": 50,
                        "m.room.canonical_alias": 50,

                        // journal-specific
                        "j.blog.post": 50,
                        "j.blog.comment": 0,
                    },
                    "users": {
                        [cli.credentials.userId]: 100,
                    }
                  }
                ,  ""
            );
        }).catch(console.error);
    }

    doNewBlogPost = (body) => {
        return cli.sendEvent(currentRoomId, "j.blog.post", {body}).then(() => {
            self.update({
                showCreateBlogForm: false
            });
        });
    }

    doViewBlog = () => {
        if (!self.isLoggedIn) {
            throw new Error('Cannot view blog, not logged in');
        }
        console.log('Viewing ',currentRoomId);

        cli.joinRoom(currentRoomId).done((room) => {
            self.currentRoom = room;
            let trackedRoomsJSON = localStorage.getItem('mx_tracked_rooms');
            if (!trackedRoomsJSON) {
                trackedRooms = [room.roomId];
            } else {
                trackedRooms = JSON.parse(trackedRoomsJSON);
                if (trackedRooms.indexOf(room.roomId) === -1) {
                    trackedRooms.push(room.roomId);
                }
            }

            localStorage.setItem('mx_tracked_rooms', JSON.stringify(trackedRooms));

            // Fudge a filter into the syncApi
            let f = new matrixSdk.Filter(creds.user_id);
            f.setDefinition({
                "account_data": {
                    "not_types": [
                      "*"
                    ],
                },
                "room": {
                    "rooms": trackedRooms,
                    "account_data": {
                        "limit": 0,
                    },
                    "state": {
                        "types": [
                            "m.room.aliases",
                            "m.room.canonical_alias",
                            "m.room.member",
                            "m.room.name",
                            "m.room.topic",
                            "m.room.avatar",
                        ]
                    },
                    "timeline": {
                        "types": [
                            "j.blog.post",
                            "j.blog.comment",
                            "m.room.redaction",
                            "m.room.canonical_alias",
                        ],
                        "limit": 10
                    },
                    "ephemeral": {
                        "types": [
                            "m.receipt"
                        ]
                    }
                },
                "presence": {
                    "not_types": [
                        "*"
                    ]
                }
            });

            cli.stopClient();
            cli.store.setSyncToken(null);
            console.log('Using filter ', f.getDefinition());
            const storeStartupPromise = cli.store.startup();
            storeStartupPromise.catch((err) => { console.error(err); });
            storeStartupPromise.finally(() => {
                cli.startClient({
                    filter : f,
                    pollTimeout : 10000
                });
                updateCurrentRoom(room);

                // Update the view - we might not receive any events to trigger an update
                updateEntries();
            });
        });

        return cli.getStateEvent(currentRoomId, 'm.room.power_levels').then(
            (powerLevels) => {
                admins = Object.keys(powerLevels.users).filter((uid) => powerLevels.users[uid] >= 100
                );
                self.update({
                    isOwnerOfCurrentBlog: admins.indexOf(creds.user_id) !== -1
                });
                updateEntriesDebounce(1000);
            }
        ).catch(console.error);
    }

    doDeleteEntry = (id) => {
        console.log('Redacting...');
        return cli.redactEvent(currentRoomId, id).done(
            () => {
                getCurrentTimeline().removeEvent(id);
                console.log('Redacted');
                updateEntries();
            }
        );
    }

    doNewComment = (id, text) => {
        text = text.trim();
        if (!text) {
            return;
        }
        console.log('commenting...');
        return cli.sendEvent(currentRoomId, "j.blog.comment", {body: text, in_response_to: id});
    }

    createClient = (opts) => {
        if (window.indexedDB && localStorage) {
            Object.assign(opts, {
                store: new matrixSdk.IndexedDBStore({
                    indexedDB: window.indexedDB,
                }),
            });
        }
        return matrixSdk.createClient(opts);
    }

    let doLoginWithPassword = (homeserverUrl, userId, password, rememberMe) => {
        cli = matrixSdk.createClient({
           baseUrl: homeserverUrl
        });

        localStorage.setItem("auto_login", rememberMe);
        cli.loginWithPassword(
            userId, password
        ).done((resp) => {
            cli = createClient({
               baseUrl: homeserverUrl,
               accessToken: resp.access_token,
               userId: resp.user_id
            });
            loggedIn(resp, homeserverUrl);
        });
    };

    let doLoginAsGuest = (homeserverUrl) => {
        cli = createClient({
           baseUrl: homeserverUrl
        });

        cli.registerGuest().then(
            (resp) => {
                cli = createClient({
                   baseUrl: homeserverUrl,
                   accessToken: resp.access_token,
                   userId: resp.user_id
                });
                cli.setGuest(true);

                loggedIn(resp, homeserverUrl, true);
            }
        );
    };

    doLoginWithOpts = (opts, homeserverUrl) => {
        cli = createClient({
           baseUrl: homeserverUrl,
           accessToken: opts.access_token,
           userId: opts.user_id
        });

        let isGuest = localStorage.getItem("mx_is_guest") === 'true';
        cli.setGuest(isGuest);

        loggedIn(opts, homeserverUrl, isGuest);
    };

    let loggedIn = (loggedInCreds, homeserverUrl, isGuest) => {
        creds = loggedInCreds;
        self.homeserverUrl = homeserverUrl;
        if (localStorage.getItem("auto_login") || isGuest) {
            console.log('Storing access token and user id');
            localStorage.setItem("mx_access_token", creds.access_token);
            localStorage.setItem("mx_user_id", creds.user_id);
            localStorage.setItem("mx_is_guest", Boolean(isGuest));
            localStorage.setItem("mx_hs", homeserverUrl);
        } else {
            self.refs.user_id.value = "";
            self.refs.password.value = "";
        }

        wrapSyncingClient(cli, dis.dispatch);

        cli.on("event", (e) => {
            if (e.getRoomId() === currentRoomId) {
                if (e.getType() === 'm.room.avatar') {
                    // Force the state to be added
                    self.currentRoom.currentState.setStateEvents([e]);
                    // Update the room URL
                    self.update({
                        room_avatar_url : self.currentRoom.getAvatarUrl(
                            homeserverUrl, 250, 250, "crop", false
                        )
                    });
                }
                updateEntriesDebounce(1000);
            }
        });
        cli.on("Room.name", function(room) {
            if (room.roomId === currentRoomId) {
                updateCurrentRoom(room);
            }
        });

        self.update({
            isLoggedIn: true,
            isGuest: Boolean(isGuest),
            userId: creds.user_id,
            domain: cli.getDomain(),
            connectionStatus: "CONNECTION_STATUS_CONNECTED",
            loadingStatus: "LOADING_STATUS_LOADING",
        });
        console.log('Logged in as ' + creds.user_id);

        route.exec();
    }

    doLogout = () => {
        self.update({isLoggedIn: false});
        // Guests cannot logout and we need to keep guest creds
        // so that the guests don't pile up for a single user.
        if (localStorage.getItem("mx_is_guest")) {
            cli.stopClient();
            cli.store.deleteAllData();
            return;
        }
        if (!localStorage.getItem("auto_login")) {
            localStorage.removeItem("mx_access_token");
            localStorage.removeItem("mx_user_id");
            localStorage.removeItem("mx_tracked_rooms");
        }
        cli.logout();
        cli.stopClient();
        cli.store.deleteAllData();
        route('/journal/');
    }

    showTodo = false;

    console.log('Routing starting...');
    route.start();
    route.exec(true);

    function tryAutoLogin() {
        let accessToken = localStorage.getItem("mx_access_token") || "";
        let userId = localStorage.getItem("mx_user_id") || "";
        let homeserverUrl = localStorage.getItem("mx_hs") || "https://matrix.org";

        if (accessToken && userId) {
            doLoginWithOpts({
                access_token: accessToken,
                user_id: userId
            }, homeserverUrl);
        } else {
            console.info('Could not auto-login, user_id or access_token missing');
            dis.dispatch({
                type: 'login_guest',
                payload: {
                    homeserverUrl
                }
            });
        }
    }

    if (localStorage) {
        tryAutoLogin();
    }
}
