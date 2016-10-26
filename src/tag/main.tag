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
    <div style="width:60%;padding-left:20%">
        <h3>
            j - journalism for cool people
            <button if={isLoggedIn} onClick={doLogout}>logout</button>
        </h3>
        <p>I am WAY too tired to be coding right now. Use this at your own risk. Access tokens are stored in the browser if 'auto-login' is enabled. For the list of things to do: <a href="https://github.com/lukebarnard1/j">github.com/lukebarnard1/j</a>.</p>

        <span if={roomList.length !== 0}>
        Visited blogs:</span>
        <span each={roomList} style="padding-right:10px">
            <a href="/journal/{roomId}">{name}</a>
        </span>
        <button if={isLoggedIn} onClick={()=>{this.showCreateRoomForm = !this.showCreateRoomForm}}>{this.showCreateRoomForm?'hide':'create your own blog'}</button>

        <div if={!isLoggedIn} class="j_login_form">
            <p>login here:</p>
            <div>
                <input class="j_100_width" type="text" name="user_id" placeholder="@person1234:matrix.org"/>
            </div><div>
                <input class="j_100_width" type="password" name="password" placeholder="password"/>
            </div><div>
                <input class="j_100_width" type="text" name="homeserver_url_input" placeholder="https://matrix.org" value="https://matrix.org"/>
            </div>
            <div>
                <label for="shouldRememberMe">
                    auto-login next time:
                </label>
                <input type="checkbox" name="shouldRememberMe" style="float:right"/>
            </div>
            <button onClick={doLoginWithPassword}>login</button>
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

            <h1>{room.name}</h1>
            <img src={room.getAvatarUrl("http://matrix.org", 250, 250, "scale", false)}/>

            <div each={entries}>
                <raw content={html}/>
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