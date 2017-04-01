<comment>
    <div class="j_comment">
        <div class="j_comment_sender">
            <div if={opts.author.avatar_url} class="j_comment_sender_avatar_container">
                <img class="j_comment_sender_avatar" src="{opts.author.avatar_url}">
            </div>
            <span class={
                "j_comment_sender_name" + (opts.author.is_guest ? " guest" : "")
            }>
                {opts.author.display_name}
            </span>
        </div>
        <span class="j_comment_content">{opts.content}</span>
        <button if={opts.mine} onClick={opts.delete}>
            delete comment
        </button>
    </div>
</comment>
