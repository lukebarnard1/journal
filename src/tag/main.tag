<raw>
    this.root.innerHTML = opts.content
</raw>

<comment>
    <span style="font-weight: 700">comment from {opts.sender}: </span><span>{opts.content}</span>
    <button if={opts.mine} onClick={opts.delete}>
        delete comment
    </button>
</comment>

<main name="content">
    <div class="j_container">
        <strong>
            <a href="https://github.com/lukebarnard1/j">j - journalism for cool people</a>
        </strong>
        <span style="float:right" if={isLoggedIn}>
            logged in as {userId}
            <button onClick={doLogout}>logout</button>
        </span>
        <div if={isLoggedIn} style="clear:both">
            <span if={roomList.length !== 0}>
            visited:</span>
            <span each={roomList} style="padding-right:10px">
                <a href="/journal/{roomId}">{name}</a>
            </span>
        </div>
        <button if={isLoggedIn} onClick={()=>{this.showCreateRoomForm = !this.showCreateRoomForm}}>{this.showCreateRoomForm?'hide':'create your own blog'}</button>

        <h1 if={!isLoggedIn} style="text-align:center">login with <a href="http://matrix.org">[matrix]</a> to use j</h1>
        <div if={!isLoggedIn} class="j_login_form">
            <div>
                <label for="user_id">
                    user ID:
                </label>
                <input class="j_100_width" type="text" name="user_id" placeholder="@person1234:matrix.org"/>
            </div><div>
                <label for="password">
                    password:
                </label>
                <input class="j_100_width" type="password" name="password" placeholder="password"/>
            </div><div>
                <label for="homeserver_url_input">
                    homesever:
                </label>
                <input class="j_100_width" type="text" name="homeserver_url_input" placeholder="https://matrix.org" value="https://matrix.org"/>
            </div>
            <div>
                <label for="shouldRememberMe">
                    auto-login next time*:
                </label>
                <input type="checkbox" name="shouldRememberMe" style="float:right"/>
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

        <div if={isLoggedIn}>
            <div if={showCreateRoomForm}>
                <input type="text" name="room_name_input" placeholder="blog title"/>
                <select name="room_join_rule_input">
                    <option value="public_chat" selected="selected">public</option>
                    <option value="private_chat">private</option>
                </select>
                <button onClick={doCreateBlog}>create blog</button>
                <input type="text" name="view_room_id" placeholder="!roomtoview:matrix.org" value="!qJXdPYrthkbuFjdrxj:matrix.org"/>
                <button onClick={viewBlogButtonClick}>view blog</button>
            </div>
            <div class="j_blog_header">
                <img if={room_avatar_url} src={room_avatar_url}/>
                <h1>{room.name}</h1>
                <small if={room.subscribers}>{room.subscribers} people subscribed</small>
            </div>

            <div each={entries}>
                <div class="j_blog_post_content">
                    <div class="j_user_avatar_container">
                        <img class="j_user_avatar" src={author.avatar_url}/>
                    </div>
                    <raw content={html}/>
                    <div class="j_blog_post_written_by">written by <strong>{author.displayname}</strong></div>
                </div>
                <div each={comments} style="padding-left: 50px">
                    <comment
                        content={content}
                        mine={isMine}
                        delete={deleteEntry}
                        sender={sender}
                    />
                </div>
                <button if={isMine} onClick={deleteEntry}>
                    delete post
                </button>
                <input type="text" name="comment_text"/>
                <button onClick={comment}>
                    comment on post
                </button>
            </div>

            <div if={entries.length==0} style="text-align:center">
                {noBlogsMsg}
            </div>

            <div if={isOwnerOfCurrentBlog}>
                <h2>write new blog posts here:</h2>
                <div
                    contenteditable="true"
                    name="new_blog_post_content"
                    style="background-color:#fff; color:#333; border-radius:5px;border:1px solid #ccc; outline:0px; padding:5px"
                ></div>
                <button onClick={doNewBlogPost}>spread the word</button>
            </div>
        </div>
    </div>
    <script>
        require('../logic/main.js')(this);
    </script>
</main>