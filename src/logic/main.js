module.exports = (self) => {
    const matrixSdk = require('matrix-js-sdk');
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

    // let entries = []; // Blog posts and comments
    let admins = []; // Authors of the current blog

    let events = {};
    let currentRoom = null;
    let creds = null;

    let access_token = null;

    let trackedRooms = [];
    let roomList = [];

    // Initial loaded state
    self.update({
        entries: [],
        canCreateNewPost: false,
        isLoggedIn: false,
        showCreateRoomForm: false,
        roomList : roomList
    });

    let ueDebounce = null;
    let updateEntriesDebounce = (delay) => {
        clearTimeout(ueDebounce);
        ueDebounce = setTimeout(
            updateEntries, delay
        );
    };

    let updateEntries = () => {
        console.log('updateEntries');
        if (!events[self.view_room_id.value]) {
            console.warn('No events received yet');
            return; // No events yet
        }

        let entries = events[self.view_room_id.value];
        entries = entries.filter((e) => {
            return e.event.type === 'm.room.message'
                && e.event.content.is_blog
        }).sort((a, b) => b.getTs() - a.getTs());

        // Transform into view
        entries = entries.map((e) => {
            let comments = events[self.view_room_id.value].filter(
                (e2) => e2.event.content.parent === e.getId()
            ).sort(
                (a, b) => a.getTs() - b.getTs()
            ).map(
                (e2) => {
                    return {
                        content : e2.event.content.body,
                        id : e2.getId(),
                        isMine : e2.getSender() === creds.user_id,

                        deleteEntry : () => {
                            doDeleteEntry(e2.getId());
                        },

                        sender : e2.getSender()
                    };
                }
            );

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
                }
            }
        });

        console.log('Number of blog posts:', entries.length);
        console.log(entries);

        if (entries.length === 0) {
            console.log('Scrolling back...', currentRoom.oldState.paginationToken)
            cli.scrollback(currentRoom, 100).then(
                (r) => {
                    console.log('Scrollback done')
                    if (r.oldState.paginationToken) {
                        // TODO: continue polling, unless the rendered posts would
                        // not be visible, and would require actual scolling.
                    }
                }
            );
        }

        self.update({entries: entries});
    }

    doCreateBlog = () => {
        cli.createRoom({
            visibility: 'public',
            preset: self.room_join_rule_input.value,
            name: self.room_name_input.value
        }).then((resp) => {
            riot.route('/journal/'+self.view_room_id.value);
            doViewBlog();
        }).catch(console.error);
    }

    doNewBlogPost = () => {
        let body = self.new_blog_post_content.innerText;
        body = body.split('\n').map(
            (line) => line.trim()
        ).filter(
            (line) => line.length > 0
        );

        body[0] = '<h3>' + body[0] + '</h3><p>';
        body = body.join('</p><p>') + '</p>';

        cli.sendMessage(
            self.view_room_id.value,
            {
                msgtype: 'm.text',
                is_blog: true,
                body: 'no plaintext',
                format: 'org.matrix.custom.html',
                // TODO: sanitise self
                formatted_body: body,
            }
        ).done(() => {
            self.new_blog_post_content.innerHTML = "";
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
                "room": {
                    "rooms": trackedRooms,
                    "timeline": {
                        "types": [
                            "m.room.message"
                        ],
                        "limit": 100
                    },
                    "presence": {
                        "limit": 0
                    }
                }
            });

            cli.stopClient();
            cli.store.setSyncToken(null);
            cli.startClient({
                filter : f,
                pollTimeout : 5000
            });

            room.name = "loading...";

            self.update({room : room});

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
                console.log('Redacted');
                events[self.view_room_id.value] = events[self.view_room_id.value].filter(
                    (e) => e.getId() !== id
                );
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
                parent: id
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

    doLoginWithOpts = (opts) => {
        console.log(self.homeserver_url_input.value);
        cli = matrixSdk.createClient({
           baseUrl: self.homeserver_url_input.value,
           accessToken: opts.access_token,
           userId: opts.user_id
        });

        loggedIn(opts);
    };

    let loggedIn = (loginCreds) => {
        creds = loginCreds;
        if (localStorage.getItem("auto_login")) {
            console.log('Storing access token and user id');
            localStorage.setItem("mx_access_token", creds.access_token);
            localStorage.setItem("mx_user_id", creds.user_id);
            localStorage.setItem("mx_hs", self.homeserver_url_input.value);
        } else {
            self.user_id.value = "";
            self.password.value = "";
        }

        //TODO: Hook these on load, not on login
        cli.on("event", (e) => {
            console.log(e.event.type, 'in', e.event.room_id);
            if (!events[e.getRoomId()]) events[e.getRoomId()] = [];

            // No duplicates
            if (!events[e.getRoomId()].find((e2) => {
                return e2.getId() === e.getId()
            })) {
                events[e.getRoomId()].push(e);
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
                self.update({room : room});
            }
        });
        cli.on("Room.redaction", function(e) {
            console.log('ignoring redaction');
        });

        self.update({isLoggedIn: true});
        console.log('Logged in!');

        doViewBlog().catch(console.error);
    }

    doLogout = () => {
        localStorage.removeItem("mx_access_token");
        localStorage.removeItem("mx_user_id");
        self.update({isLoggedIn: false});
        cli.logout();
        cli.stopClient();
    }

    showTodo = false;

    console.log('Routing starting...');
    riot.route.start();
    riot.route.exec();

    let testing = false;
    if (testing) {
        events[self.view_room_id.value] = [{
            event: {
                type: 'm.room.message',
                content: {
                    formatted_body: '<h1>Test blog</h1><p>This is a test 😁</p><p>Second paragraph here</p>',
                    format: 'org.matrix.custom.html'
                }
            },
            getTs: () => 1,
            getId: () => 1,
            getSender: () => '@testuser1:server.name'
        },
        {
            event: {
                type: 'm.room.message',
                content: {
                    parent: 1,
                    body: 'I am another, later comment',
                    format: 'org.matrix.custom.html'
                }
            },
            getTs: () => 3,
            getId: () => 3,
            getSender: () => '@testuser3:server.name'
        },
        {
            event: {
                type: 'm.room.message',
                content: {
                    parent: 1,
                    body: 'I am an earlier comment',
                    formatted_body: '<h1>THIS SHOULD NOT BE VISIBLE</h1>',
                    format: 'org.matrix.custom.html'
                }
            },
            getTs: () => 2,
            getId: () => 2,
            getSender: () => '@testuser2:server.name'
        },
        {
            event: {
                type: 'm.room.message',
                content: {
                    body: 'Comment in room: THIS SHOULD NOT BE VISIBLE',
                }
            },
            getTs: () => 4,
            getId: () => 4,
            getSender: () => '@testuser2:server.name'
        }];

        creds = {};
        self.update({isLoggedIn : true});

        updateEntries();
        return;
    }

    if (localStorage) {
        access_token = localStorage.getItem("mx_access_token");
        user_id = localStorage.getItem("mx_user_id");
        self.homeserver_url_input.value = localStorage.getItem("mx_hs") || "https://matrix.org";

        if (access_token && user_id) {
            doLoginWithOpts({
                access_token: access_token,
                user_id: user_id
            });
        }
    }
}