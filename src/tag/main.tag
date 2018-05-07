<editor>
    <textarea
        id={opts.taid}
        name={opts.taname}
        ref="ta"
    ></textarea>

    var marked = require("marked");
    marked.setOptions({
        sanitize: true, // Sanitize the output of marked, this does not protect against XSS
    });
    var SimpleMDE = require("simplemde");

    this.submit = function() {
        let md = marked(this.simplemde.value());
            opts.submit(md).then(
            () => {
                this.simplemde.value("");
            }
        );
    }

    this.cancel = function() {
        opts.cancel();
    }

    this.on('mount', () => {
        this.simplemde = new SimpleMDE({
            element: document.getElementById(opts.taid),
            autofocus: true,
            status: false,
            toolbar: [
                "bold", "italic", "heading", "|",
                "quote", "unordered-list", "ordered-list", "|",
                "link", "image", "|", "preview", "|" , "guide", "|",
                {
                    name: "send",
                    action: this.submit.bind(this),
                    className: "fa fa-paper-plane",
                    title: "Send",
                }, {
                    name: "cancel",
                    action: this.cancel.bind(this),
                    className: "fa fa-times",
                    title: "Cancel",
                }
            ],
        });
    });
</editor>

<editable>
    <span>
        {this.opts.prefix}<span
            ref="input" name="input"
            style={{minWidth: '100px'}}
            contenteditable={this.opts.enabled}
            class="j_text_input"
            onfocus={onFocus}
            onblur={onBlur}
            placeholder={this.opts.placeholder}
        >{this.opts.initialValue}</span>{this.opts.suffix}
    </span>
    <script>
        onClick(e) {
            this.refs.input.focus();
        }
        onBlur(e) {
            this.opts.onChange(this.refs.input.innerText);
        }
    </script>
</editable>

<aliasInput>
    <a href={this.opts.initialValue ? '/#/journal/' + this.opts.initialValue : ""}>
        <editable
            prefix={window.location.origin + '/#/journal/'}
            suffix={':' + (initialDomain || this.opts.domain)}
            on-change={onChange}
            initial-value={initialValue}
            placeholder="my-blog"
            enabled={this.opts.enabled}
        />
    </a>
    <script>
        this.on('update', function() {
            this.initialDomain = this.opts.initialValue ?
                this.opts.initialValue.slice(this.opts.initialValue.indexOf(':') + 1) : undefined;
            this.initialValue = this.opts.initialValue ?
                this.opts.initialValue.slice(0, this.opts.initialValue.indexOf(':')) : undefined;
        });

        onChange(value) {
            dis.dispatch({
                type: 'alias_change',
                payload: {
                    value: '#' + value + ':' + this.opts.domain,
                },
            });
        }
    </script>
</aliasInput>

<topicInput>
    <editable
        initial-value={this.opts.initialValue}
        placeholder="The topic of your blog"
        on-change={onChange}
        enabled={this.opts.enabled}
    />

    onChange(value) {
        dis.dispatch({type: 'topic_change', payload: {value}});
    }
</topicInput>

<loginPanel>
    <h1 style="text-align:center">login with <a href="http://matrix.org">[matrix]</a> to use journal</h1>
    <div class="j_login_form">
        <div>
            <label for="user_id">
                user ID:
            </label>
            <input type="text" name="user_id" ref="user_id" placeholder="@person1234:matrix.org" value={userId}/>
        </div><div>
            <label for="password">
                password:
            </label>
            <input
                type="password"
                name="password"
                ref="password"
                placeholder="password"
            />
        </div><div>
            <label for="homeserver_url_input">
                homeserver:
            </label>
            <input type="text" name="homeserver_url_input" ref="homeserver_url_input" placeholder="https://matrix.org" value={homeserverUrl}/>
        </div>
        <div>
            <label for="remember_me">
                auto-login next time*:
            </label>
            <input type="checkbox" name="remember_me" ref="remember_me" style="float:right" checked={rememberMe}/>
        </div>
        <p>
            *access tokens are stored in the browser if enabled.
        </p>
        <div style="text-align: center">
            <button onClick={doLoginWithPassword}>login</button>
            <p style="text-align: center">or</p>
            <button onClick={doLoginAsGuest}>login as guest</button>
        </div>
    </div>
    <script>
        this.userId = localStorage.getItem('mx_user_id');
        this.homeserverUrl = localStorage.getItem('mx_hs') || "https://matrix.org";
        this.rememberMe = localStorage.getItem('auto_login');

        doLoginWithPassword(e) {
            dis.dispatch({
                type: 'login_password',
                payload: {
                    userId: this.refs.user_id.value,
                    password: this.refs.password.value,
                    homeserverUrl: this.refs.homeserver_url_input.value,
                    rememberMe: this.refs.remember_me.value,
                }
            });
        }

        doLoginAsGuest(e) {
            dis.dispatch({
                type: 'login_guest',
                payload: {
                    homeserverUrl: this.refs.homeserver_url_input.value,
                }
            });
        }
    </script>
</loginPanel>

<connectionStatus>
    <span class={className}>{text}</span>
    <script>
        this.on('update', () => {
            this.text = {
                "CONNECTION_STATUS_UNKNOWN": "unknown",
                "CONNECTION_STATUS_CONNECTED": "connected",
                "CONNECTION_STATUS_RECONNECTING": "reconnecting",
                "CONNECTION_STATUS_DISCONNECTED": "disconnected"
            }[this.opts.status];

            this.className = "j_connection_status " + {
                "CONNECTION_STATUS_UNKNOWN": "j_connection_status_unknown",
                "CONNECTION_STATUS_CONNECTED": "j_connection_status_connected",
                "CONNECTION_STATUS_RECONNECTING": "j_connection_status_reconnecting",
                "CONNECTION_STATUS_DISCONNECTED": "j_connection_status_disconnected"
            }[this.opts.status];
        });
    </script>
</connectionStatus>

<loadingBar>
    <div class={className}>&nbsp;</div>
    <script>
        this.className = "j_loading_bar " + {
            "LOADING_STATUS_LOADING": "j_loading_bar_loading",
        }[this.opts.status];
    </script>
</loadingBar>

<topBar>
    <i class="fa fa-newspaper-o" aria-hidden="true"></i>
    <strong>
        journal
    </strong>
    <connectionStatus status={this.opts.connectionStatus}/>
    <span style="float:right">
        logged in as {loggedInAs}
        <button onClick={doLogout}><i class="fa fa-sign-out" aria-hidden="true"></i></button>
    </span>
    <loadingBar status={this.opts.loadingStatus}/>
    <div style="clear:both">
        <span if={this.opts.roomList.length !== 0}>
        history:</span>
        <span each={this.opts.roomList} style="padding-right:10px">
            <a href="/#/journal/{roomId}">{name}</a>
        </span>
    </div>
    <script>
        this.on('update', () => {
            loggedInAs = this.opts.loggedInAs;
        });

        doLogout(e) {
            dis.dispatch({
                type: 'logout',
            });
        }
    </script>
</topBar>

<roomAvatarPicker>
    <div if={this.opts.enabled} class="j_room_avatar_picker" onClick={doFilePicker}>
        <img if={this.opts.roomAvatar} class="j_room_avatar" src={this.opts.roomAvatar}/>
        <div if={!this.opts.roomAvatar} class="j_room_avatar_placeholder">
            <span if={this.state === 'unset'}>
                <i class="fa fa-camera"></i>
                <i class="fa fa-plus"></i>
            </span>
            <span if={this.state === 'file_upload'}>
                <i class="fa fa-circle-o-notch fa-spin"></i>
            </span>
        </div>
        <input style="display:none" ref="file_input" type="file" accept="image/*" onChange={doFileSelected}/>
    </div>
    <img if={!this.opts.enabled && this.opts.roomAvatar} class="j_room_avatar" src={this.opts.roomAvatar}/>

    this.state = this.opts.roomAvatar ? 'set' : 'unset';
    doFilePicker(e) {
        this.refs.file_input.click();
    }

    doFileSelected(e) {
        const file = e.target.files[0];
        this.state = 'file_upload';
        dis.dispatch({
            type: 'room_avatar_change',
            payload: {
                file: file,
            }
        });
    }
</roomAvatarPicker>

<main name="content">
    <div class="j_container">
        <topBar if={isLoggedIn} room-list={roomList} logged-in-as={userId} connection-status={connectionStatus} loading-status={loadingStatus}/>
        <div class="j_toolbar">
            <button title="Create a new blog" onClick={()=>{this.showCreateRoomForm = !this.showCreateRoomForm}}><i class="fa fa-file-text-o" aria-hidden="true"></i></button>
            <button title="Write a post" if={isOwnerOfCurrentBlog} onClick={()=>{this.showCreateBlogForm = !this.showCreateBlogForm}}><i class="fa fa-pencil-square-o"></i></button>
        </div>

        <loginPanel if={!isLoggedIn && loadingStatus === "LOADING_STATUS_DONE"}/>

        <div if={isLoggedIn}>
            <div if={showCreateRoomForm}>
                <input type="text" ref="room_name_input" placeholder="blog title"/>
                <select ref="room_join_rule_input">
                    <option value="public_chat" selected="selected">public</option>
                    <option value="private_chat">private</option>
                </select>
                <button onClick={doCreateBlog}><i class="fa fa-plus" aria-hidden="true"></i></button>
            </div>
            <div class="j_blog_header">
                <div class="j_flex_row">
                    <div class="j_col">
                        <roomAvatarPicker enabled={isOwnerOfCurrentBlog} room-avatar={roomHttpAvatar}/>
                    </div>
                    <div class="j_col_expand j_blog_details">
                        <span class="j_blog_name">{roomName}</span>
                        <span class="j_blog_topic">
                            <topicInput enabled={isOwnerOfCurrentBlog} initial-value={topicInputValue}/>
                        </span>
                        <span class="j_user_count" if={roomMemberCount}>
                            <i class="fa fa-users" aria-hidden="true"></i> {roomMemberCount}
                        </span>
                        <div>
                            <aliasInput enabled={isOwnerOfCurrentBlog} domain={domain} initial-value={aliasInputValue}/>
                        </div>
                    </div>
                </div>
            </div>
            <div if={isOwnerOfCurrentBlog && showCreateBlogForm}>
                <editor taid="main-editor" taname="new_blog_post_content" submit={doNewBlogPost} cancel={()=>{this.showCreateBlogForm = false;this.update();}}/>
            </div>
            <blog each={entries}></blog>
            <div if={entries.length==0} style="text-align:center">
                {noBlogsMsg}
            </div>
        </div>
    </div>

    this.on('mount', () => {
        require('../logic/main.js')(this);
    });
</main>
