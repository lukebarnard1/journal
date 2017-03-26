module.exports = (self) => {
    const matrixSdk = require('matrix-js-sdk');
    const ContentRepo = matrixSdk.ContentRepo;
    const riot = require('riot');
    const route = require('riot-route');
    // Global access for the singleton dispatcher
    window.dis = require('./dispatcher.js');

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
    route('/journal',   () => {route('/journal/!qJXdPYrthkbuFjdrxj:matrix.org');});
    route('/',          () => {route('/journal/!qJXdPYrthkbuFjdrxj:matrix.org');});

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
                }
                );
            break;
            case 'view_blog':
                route('/journal/' + action.payload.addr);
            break;
        }
    }

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
        console.log('updateEntries');
        if (!getCurrentTimeline() || !getCurrentTimeline().getEvents()) {
            console.warn('No events received yet');
            return; // No events yet
        }

        let allEntries = getCurrentTimeline().getEvents();
        entries = allEntries.filter((e) => {
            return e.event.type === 'm.room.message'
                && e.event.content.is_blog
        }).sort((a, b) => b.getTs() - a.getTs());

        // Transform into view
        entries = entries.map((e) => {
            let comments = allEntries.filter(
                (e2) => (e2.event.content.parent === e.getId() ||
                        e2.event.content.in_response_to === e.getId())
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
                        author : commenter
                    };
                }
            );
            let author = getAuthor(e.getSender());

            return {
                id : e.getId(),
                isMine : e.event.sender === creds.user_id,
                // TODO: sanitise self
                html : e.event.content.formatted_body,
                text : e.event.content.body,
                comments : comments,
                deleteEntry : () => {
                    doDeleteEntry(e.getId());
                },
                comment : function (ev) {
                    doNewComment(
                        e.getId(),
                        // TODO: fix fun hack to get the input box
                        Array.from(ev.target.parentElement.children).find(
                            (e) => e.name==='comment_text'
                        ).value
                    );
                },
                author : author,
                datetime : new Date(e.getTs()).toLocaleString(),
                seenBy : self.currentRoom.getReceiptsForEvent(e).length,
            }
        });

        if (entries.length < 10) {
            scrollback();
        }

        const alias = self.currentRoom.getCanonicalAlias();
        self.update({
            entries: entries,
            aliasInputValue: alias ? alias.slice(1).slice(0, alias.indexOf(':') - 1) : null,
        });
    }

    let updateCurrentRoom = (room) => {
        // Assumes that things are loading when the room name is a room ID
        // When the m.room.name is received, it is assumed things are done loading
        self.currentRoom = room;
        self.currentRoom.name = room.name[0] === '!'?"loading...":room.name;
        self.currentRoom.subscribers = room.getJoinedMembers().length;
        self.update();
    }

    doCreateBlog = () => {
        cli.createRoom({
            visibility: 'public',
            preset: self.room_join_rule_input.value,
            name: self.room_name_input.value
        }).then((resp) => {
            console.log("New room created: " + resp.room_id);
            route('/journal/' + resp.room_id);
        }).catch(console.error);
    }

    doNewBlogPost = (body) => {
        return cli.sendMessage(
            currentRoomId,
            {
                msgtype: 'm.text',
                is_blog: true,
                body: 'no plaintext',
                format: 'org.matrix.custom.html',
                // TODO: sanitise self
                formatted_body: body,
            }
        ).then(() => {
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
                    "rooms": [currentRoomId],
                    "account_data": {
                        "limit": 0,
                    },
                    "state": {
                        "types": [
                            "m.room.aliases",
                            "m.room.canonical_alias",
                            "m.room.member",
                            "m.room.name",
                            "m.room.avatar",
                        ]
                    },
                    "timeline": {
                        "types": [
                            "m.room.message",
                            "m.room.canonical_alias",
                        ],
                        "limit": 10
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
        return cli.sendMessage(
            currentRoomId,
            {
                msgtype: 'm.text',
                body: text,
                in_response_to: id
            }
        );
    }

    createClient = (opts) => {
        if (window.indexedDB && localStorage) {
            Object.assign(opts, {
                store: new matrixSdk.IndexedDBStore(
                    new matrixSdk.IndexedDBStoreBackend(window.indexedDB),
                    new matrixSdk.SyncAccumulator(), {
                        localStorage: localStorage,
                    }
                ),
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

        cli.on("event", (e) => {
            console.log(e.event.type, 'in', e.event.room_id);

            if (e.getType() === 'm.room.avatar') {
                if (e.getRoomId() === self.currentRoom.roomId) {
                    // Force the state to be added
                    self.currentRoom.currentState.setStateEvents([e]);
                    // Update the room URL
                    self.update({
                        room_avatar_url : self.currentRoom.getAvatarUrl(
                            homeserverUrl, 250, 250, "crop", false
                        )
                    });
                }
            }

            if (e.getRoomId() === currentRoomId) {
                updateEntriesDebounce(1000);
            }
        });
        cli.on("Room", function(room) {
            self.roomList = cli.getRooms().filter(
                (r) => trackedRooms.indexOf(r.roomId) !== -1
            );
            self.update();
        });
        cli.on("Room.name", function(room) {
            if (room.roomId === currentRoomId) {
                updateCurrentRoom(room);
            }
        });
        cli.on("Room.redaction", function(e) {
            console.log('ignoring redaction');
        });

        self.update({
            isLoggedIn: true,
            isGuest: Boolean(isGuest),
            userId: creds.user_id,
            domain: cli.getDomain(),
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
        }
    }

    if (localStorage) {
        tryAutoLogin();
    }
}