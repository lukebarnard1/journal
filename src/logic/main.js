module.exports = (self) => {
    const matrixSdk = require('matrix-js-sdk');
    const ContentRepo = matrixSdk.ContentRepo;
    const riot = require('riot');

    let l = riot.route.create();
    l(
        '/journal/*',
        (nroom_id) => {
            console.log('Now viewing ', nroom_id);
            self.view_room_id.value = nroom_id;
            if (self.isLoggedIn){
                doViewBlog();
            }
        }
    );

    self.update({
        noBlogsMsg : "---------------------no-blog-posts-yet---------------------"
    });

    let cli = matrixSdk.createClient({
       baseUrl: self.homeserver_url_input.value
    });

    let admins = []; // Authors of the current blog

    let currentRoom = null;
    let creds = null;

    let access_token = null;

    let trackedRooms = [];
    let roomList = [];
    let cachedMembers = {};

    // Initial loaded state
    self.update({
        entries: [],
        canCreateNewPost: false,
        isLoggedIn: false,
        showCreateRoomForm: false,
        roomList : roomList,
        showCreateBlogForm: false
    });

    let ueDebounce = null;
    let updateEntriesDebounce = (delay) => {
        clearTimeout(ueDebounce);
        ueDebounce = setTimeout(
            updateEntries, delay
        );
    };

    let getCurrentTimeline = () => {
        const room = cli.getRoom(self.view_room_id.value);
        if (!room) return null;
        return room.getLiveTimeline();
    }

    let scrollback = () => {
        if (document.body.scrollTop > document.body.scrollHeight - document.body.clientHeight) {
            const room = cli.getRoom(self.view_room_id.value);
            if (!room.oldState.paginationToken) {
                console.log('End of timeline');
                return;
            }
            const l = room.timeline.length;
            cli.scrollback(room).done(() => {
                console.log("Scrollback done");
                if (room.timeline.length !== l) {
                    updateEntriesDebounce(200);
                }
            });
        }
    }

    window.addEventListener('scroll', () => {
        scrollback();
    });

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

        console.log('Events:', entries);

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
                    const commenter = cachedMembers[e2.getSender()];
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
            let author = cachedMembers[e.getSender()];

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
            }
        });

        console.log('Number of blog posts:', entries.length);
        console.log(entries);

        if (entries.length < 10) {
            console.log('Scrolling back...', currentRoom.oldState.paginationToken)
            scrollback();
        }

        self.update({entries: entries});
    }

    let updateCurrentRoom = (room) => {
        console.log('Updating room')
        // Assumes that things are loading when the room name is a room ID
        // When the m.room.name is received, it is assumed things are done loading
        room.name = room.name[0] === '!'?"loading...":room.name;

        room.subscribers = room.getJoinedMembers().length;
        self.update({
            room : room
        });
    }

    doCreateBlog = () => {
        cli.createRoom({
            visibility: 'public',
            preset: self.room_join_rule_input.value,
            name: self.room_name_input.value
        }).then((resp) => {
            console.log("New room created: " + resp.room_id);
            riot.route('/journal/' + resp.room_id);
            doViewBlog();
        }).catch(console.error);
    }

    doNewBlogPost = (body) => {
        return cli.sendMessage(
            self.view_room_id.value,
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

    viewBlogButtonClick = () => {
        riot.route('/journal/'+self.view_room_id.value);
        doViewBlog();
    }

    doViewBlog = () => {
        if (!self.isLoggedIn) {
            throw new Error('Cannot view blog, not logged in');
        }
        console.log('Viewing ',self.view_room_id.value);

        cli.joinRoom(self.view_room_id.value).done((room) => {
            currentRoom = room;
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
                    "account_data": {
                        "limit": 0
                    },
                    "rooms": [self.view_room_id.value],
                    "timeline": {
                        "types": [
                            "m.room.message",
                            "m.room.avatar"
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
            cli.startClient({
                filter : f,
                pollTimeout : 10000
            });

            updateCurrentRoom(room);

            // Update the view - we might not receive any events to trigger an update
            updateEntries();
        });

        return cli.getStateEvent(self.view_room_id.value, 'm.room.power_levels').then(
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
        return cli.redactEvent(self.view_room_id.value, id).done(
            () => {
                getCurrentTimeline().removeEvent(id);
                console.log('Redacted');
                updateEntries();
            }
        );
    }

    doNewComment = (id, text) => {
        console.log('commenting...');
        return cli.sendMessage(
            self.view_room_id.value,
            {
                msgtype: 'm.text',
                body: text,
                in_response_to: id
            }
        );
    }

    doLoginWithPassword = () => {
        cli = matrixSdk.createClient({
           baseUrl: self.homeserver_url_input.value
        });

        localStorage.setItem("auto_login", self.shouldRememberMe.checked);
        cli.loginWithPassword(
            self.user_id.value, self.password.value
        ).done((resp) => {
            cli = matrixSdk.createClient({
               baseUrl: self.homeserver_url_input.value,
               accessToken: resp.access_token,
               userId: resp.user_id
            });
            loggedIn(resp);
        });
    };

    doLoginAsGuest = () => {
        try {
            tryAutoLogin();
        }
        catch (err) {
            console.error(err);
            cli = matrixSdk.createClient({
               baseUrl: self.homeserver_url_input.value
            });

            cli.registerGuest().then(
                (resp) => {
                    cli = matrixSdk.createClient({
                       baseUrl: self.homeserver_url_input.value,
                       accessToken: resp.access_token,
                       userId: resp.user_id
                    });
                    cli.setGuest(true);

                    loggedIn(resp, true);
                }
            );
        }
    };

    doLoginWithOpts = (opts) => {
        console.log(self.homeserver_url_input.value);
        cli = matrixSdk.createClient({
           baseUrl: self.homeserver_url_input.value,
           accessToken: opts.access_token,
           userId: opts.user_id
        });

        let isGuest = localStorage.getItem("mx_is_guest") === 'true';
        cli.setGuest(isGuest);

        loggedIn(opts, isGuest);
    };

    let loggedIn = (loginCreds, isGuest) => {
        creds = loginCreds;
        if (localStorage.getItem("auto_login") || isGuest) {
            console.log('Storing access token and user id');
            localStorage.setItem("mx_access_token", creds.access_token);
            localStorage.setItem("mx_user_id", creds.user_id);
            localStorage.setItem("mx_is_guest", Boolean(isGuest));
            localStorage.setItem("mx_hs", self.homeserver_url_input.value);
        } else {
            self.user_id.value = "";
            self.password.value = "";
        }

        //TODO: Hook these on load, not on login
        cli.on("event", (e) => {
            console.log(e.event.type, 'in', e.event.room_id);

            if (e.getType() === 'm.room.member') {
                e.event.content.avatar_url = ContentRepo.getHttpUriForMxc(
                    self.homeserver_url_input.value,
                    e.event.content.avatar_url,
                    250,
                    250,
                    'crop'
                )
                const memberEvent = e.event.content;
                memberEvent.is_guest = !memberEvent.displayname;
                memberEvent.display_name = memberEvent.displayname || 'Guest';

                cachedMembers[e.getSender()] = memberEvent
            } else if (e.getType() === 'm.room.avatar') {
                if (e.getRoomId() === currentRoom.roomId) {
                    // Force the state to be added
                    currentRoom.currentState.setStateEvents([e]);
                    // Update the room URL
                    self.update({
                        room_avatar_url : currentRoom.getAvatarUrl(
                            self.homeserver_url_input.value, 250, 250, "crop", false
                        )
                    });
                }
            }

            if (e.getRoomId() === self.view_room_id.value) {
                updateEntriesDebounce(1000);
            }
        });
        cli.on("Room", function(room) {
            roomList = cli.getRooms().filter(
                (r) => trackedRooms.indexOf(r.roomId) !== -1
            );
            self.update({
                roomList : roomList
            });
        });
        cli.on("Room.name", function(room) {
            if (room.roomId === self.view_room_id.value) {
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
        });
        console.log('Logged in as ' + creds.user_id);

        doViewBlog().catch(console.error);
    }

    doLogout = () => {
        self.update({isLoggedIn: false});
        // Guests cannot logout and we need to keep guest creds
        // so that the guests don't pile up for a single user.
        if (localStorage.getItem("mx_is_guest")) {
            cli.stopClient();
            return;
        }
        if (!localStorage.getItem("auto_login")) {
            localStorage.removeItem("mx_access_token");
            localStorage.removeItem("mx_user_id");
        }
        cli.logout();
        cli.stopClient();
    }

    showTodo = false;

    console.log('Routing starting...');
    riot.route.start();
    riot.route.exec();

    function tryAutoLogin() {
        access_token = localStorage.getItem("mx_access_token");
        user_id = localStorage.getItem("mx_user_id");

        self.homeserver_url_input.value = localStorage.getItem("mx_hs") || "https://matrix.org";
        self.user_id.value = user_id || "";
        self.shouldRememberMe.checked = localStorage.getItem("auto_login") || false;

        if (access_token && user_id) {
            doLoginWithOpts({
                access_token: access_token,
                user_id: user_id
            });
        } else {
            throw new Error('No credentials in localStorage');
        }
    }

    if (localStorage) {
        try {
            tryAutoLogin();
        }
        catch (err) {
            console.error(err);
        }
    }
}