<comment>
    <div class="j_comment">
        <div class="j_comment_sender">
            <div if={opts.author.httpAvatarUrl} class="j_comment_sender_avatar_container">
                <img class="j_comment_sender_avatar" src="{opts.author.httpAvatarUrl}">
            </div>
            <span class={
                "j_comment_sender_name" + (opts.author.name ? " guest" : "")
            }>
                {opts.author.name}
            </span>
            <span class="j_comment_timestamp"> on {opts.datetime}</span>
        </div>
        <span class="j_comment_content">{opts.content}</span>
        <button if={opts.mine} onClick={opts.delete} title="Delete comment">
            <i class="fa fa-trash" aria-hidden="true"></i>
        </button>
    </div>
</comment>
