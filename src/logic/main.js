module.exports = (self) => {
    const matrixSdk = require('matrix-js-sdk');
    const ContentRepo = matrixSdk.ContentRepo;
    const riot = require('riot');
    const route = require('riot-route');
    // Global access for the singleton dispatcher
    window.dis = require('./dispatcher.js');

    const { matrixReduce, wrapSyncingClient } = require('matrix-redux-wrap');

    let reduxState = {};

    function getStateEventContent(room, type, stateKey="") {
        if (!room.state[type]) return null;
        if (!room.state[type][stateKey]) return null;
        return room.state[type][stateKey].content;
    }

    function getAuthor(member) {
        const httpAvatarUrl = cli.mxcUrlToHttp(
            member.avatarUrl, 250, 250, 'crop', false
        );
        return {
            name: member.name,
            httpAvatarUrl,
        }
    }

    // The redux store has been updated, map state to view state
    // XXX: When React is introduced, .update will be replaced
    // with .setState
    function updateView() {
        const STATUS_UNKNOWN = 'CONNECTION_STATUS_UNKNOWN';
        const STATUS_CONNECTED = 'CONNECTION_STATUS_CONNECTED';
        const STATUS_RECONNECTING = 'CONNECTION_STATUS_RECONNECTING';
        const STATUS_DISCONNECTED = 'CONNECTION_STATUS_DISCONNECTED';

        const currentRoom = reduxState.mrw.wrapped_state.rooms[currentRoomId];

        let allEntries = currentRoom ?
            currentRoom.timeline
                .sort((a, b) => b.ts - a.ts)
                .filter(e => e.content.body && !e.redactedBecause) : [];

        let seenByAcc = 0;
        allEntries.forEach((e) => {
            const eventReceipts = currentRoom.receipts[e.id]
            if (!eventReceipts) return;
            const readReceipts = eventReceipts['m.read'];
            if (!readReceipts) return;

            seenByAcc += Object.keys(eventReceipts).length;
            e.seenByAcc = seenByAcc;
        });

        const entries = allEntries
            .filter((e) => e.type === 'j.blog.post')
            .map(
        (e) => {
            let comments = allEntries.filter(
                (e2) => {
                    return e2.type === 'j.blog.comment'
                        && (e2.content.parent === e.id || e2.content.in_response_to === e.id)
                        && e2.content.body.trim() !== ''
                }
            ).sort(
                (a, b) => a.ts - b.ts
            ).map(
                (e2) => {
                    const commenter = getAuthor(currentRoom.members[e2.sender]);
                    return {
                        content : e2.content.body,
                        id : e2.id,
                        isMine : e2.sender === creds.user_id,
                        deleteEntry : () => {
                            doDeleteEntry(e2.id);
                        },
                        sender : e2.sender,
                        author : commenter,
                        datetime : new Date(e2.ts).toLocaleString(),
                    };
                }
            );
            let author = getAuthor(currentRoom.members[e.sender]);

            return {
                id : e.id,
                isMine : e.sender === creds.user_id,
                // TODO: sanitise self
                html : e.content.body,
                comments : comments,
                deleteEntry : () => {
                    doDeleteEntry(e.id);
                },
                comment : function (ev) {
                    doNewComment(
                        e.id,
                        // TODO: fix fun hack to get the input box
                        Array.from(ev.currentTarget.parentElement.children).find(
                            (e) => e.name==='comment_text'
                        ).value
                    );
                },
                author : author,
                datetime : new Date(e.ts).toLocaleString(),
                seenBy : e.seenByAcc,
            }
        });

        const aliasContent = currentRoom ?
            getStateEventContent(currentRoom, 'm.room.canonical_alias') || {} : {};
        const topicContent = currentRoom ?
            getStateEventContent(currentRoom, 'm.room.topic') || {} : {};
        const nameContent = currentRoom ?
            getStateEventContent(currentRoom, 'm.room.name') || {} : {};
        const avatarContent = currentRoom ?
            getStateEventContent(currentRoom, 'm.room.avatar') || {} : {};

        self.update({
            noBlogsMsg : "---------------------no-blog-posts-yet---------------------",

            connectionStatus: {
                SYNCING: STATUS_CONNECTED,
                PREPARED: STATUS_CONNECTED,
                RECONNECTING: STATUS_RECONNECTING,
                ERROR: STATUS_DISCONNECTED,
            }[reduxState.mrw.wrapped_state.sync.state] || STATUS_UNKNOWN,

            isLoggedIn: Boolean(cli.credentials),

            roomList: trackedRooms
                .map(roomId => ({
                    roomId,
                    name: reduxState.mrw.wrapped_state.rooms[roomId] ?
                        reduxState.mrw.wrapped_state.rooms[roomId].name : null,
                })),

            aliasInputValue: aliasContent.alias ? aliasContent.alias.slice(1) : null,
            topicInputValue: topicContent.topic || null,

            roomHttpAvatar: avatarContent.url ? cli.mxcUrlToHttp(avatarContent.url) : null,
            roomName: nameContent.name || null,
            roomMemberCount: currentRoom ?
                Object.keys(currentRoom.members)
                .filter(
                    userId =>
                        currentRoom.members[userId].membership === 'join' &&
                        !(userId[1] >= '0' && userId[1] <= '9')
                ).length  : null,
            entries,
        });

        if (entries.length > 0) {
            self.update({
                loadingStatus: "LOADING_STATUS_DONE",
            });
        } else {
            scrollback();
        }
    }

    let updateDebounce;
    // XXX: For now, register a listener to keep redux store state and call
    // `update` on the view.
    dis.registerStore({
        onAction: (action) => {
            reduxState = matrixReduce(action, reduxState);

            if (updateDebounce) clearTimeout(updateDebounce);
            updateDebounce = setTimeout(
                () => updateView(),
                200
            );
        },
    });

    dis.registerStore(self);

    route.base('#/');
    route(
        '/journal/*',
        (path) => {
            if (!cli || !cli.credentials) {
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

    let cli = null;

    let admins = []; // Authors of the current blog

    let currentRoomId = "";

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
                const setCanonicalAlias = () => {
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
                };
                cli.createAlias(
                    action.payload.value, currentRoomId
                ).catch((err) => {
                    console.warn('Failed to set alias', err);
                    if (err.httpStatus === 409) {
                        setCanonicalAlias(action.payload.value);
                    }
                }).then(() => {
                    setCanonicalAlias(action.payload.value);
                });
            break;
            case 'room_avatar_change':
                cli.uploadContent(action.payload.file).then(function(url) {
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
        showCreateRoomForm: false,
        showCreateBlogForm: false,
        loadingStatus: "LOADING_STATUS_LOADING",
        connectionStatus: "CONNECTION_STATUS_UNKNOWN",
        scrollingStatus: "SCROLLING_STATUS_DONE",
    });

    let getCurrentTimeline = () => {
        const room = cli.getRoom(currentRoomId);
        if (!room) return null;
        return room.getLiveTimeline();
    }

    let scrollbackDoneDebounce;
    let scrollback = () => {
        const shouldPaginate =
            document.scrollingElement.scrollTop >= document.scrollingElement.scrollHeight - window.innerHeight * 2;
        if (shouldPaginate) {
            const room = cli.getRoom(currentRoomId);
            if (!room || !room.oldState.paginationToken) {
                return;
            }
            const l = room.timeline.length;
            self.update({
                scrollingStatus: "SCROLLING_STATUS_SCROLLING",
            });
            cli.scrollback(room).then(() => {
                if (scrollbackDoneDebounce) clearTimeout(scrollbackDoneDebounce);
                scrollbackDoneDebounce = setTimeout(() => {
                    self.update({
                        scrollingStatus: "SCROLLING_STATUS_DONE",
                    });
                }, 500);
            });
        }
    }

    window.addEventListener('scroll', () => {
        scrollback();
    });

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
        if (!cli.credentials) {
            throw new Error('Cannot view blog, not logged in');
        }
        console.log('Viewing ', currentRoomId);

        cli.joinRoom(currentRoomId).done((room) => {
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
            });
        });

        return cli.getStateEvent(currentRoomId, 'm.room.power_levels').then(
            (powerLevels) => {
                admins = Object.keys(powerLevels.users).filter((uid) => powerLevels.users[uid] >= 100
                );
                self.update({
                    isOwnerOfCurrentBlog: admins.indexOf(creds.user_id) !== -1,
                });
            }
        ).catch(console.error);
    }

    doDeleteEntry = (id) => {
        return cli.redactEvent(currentRoomId, id).done(
            () => {
                getCurrentTimeline().removeEvent(id);
            }
        );
    }

    doNewComment = (id, text) => {
        text = text.trim();
        if (!text) {
            return;
        }
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
        if (localStorage.getItem("auto_login") || isGuest) {
            localStorage.setItem("mx_access_token", creds.access_token);
            localStorage.setItem("mx_user_id", creds.user_id);
            localStorage.setItem("mx_is_guest", Boolean(isGuest));
            localStorage.setItem("mx_hs", homeserverUrl);
        } else {
            self.refs.user_id.value = "";
            self.refs.password.value = "";
        }

        wrapSyncingClient(cli, dis.dispatch);

        self.update({
            loggedIn: true,
            userId: creds.user_id,
            // Used by <aliasInput>
            domain: cli.getDomain(),
            connectionStatus: "CONNECTION_STATUS_CONNECTED",
            loadingStatus: "LOADING_STATUS_LOADING",
        });

        route.exec();
    }

    doLogout = () => {
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
