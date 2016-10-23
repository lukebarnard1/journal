<blog>
    <raw content={opts.content}/>
    <div each={comments} style="padding-left: 50px">
        <comment 
            content={content} 
            mine={isMine} 
            delete={deleteEntry}
            sender={sender}
        />
    </div>
    <button if={opts.mine} onClick={opts.delete}>
        delete post
    </button>
    <input type="text" name="comment_text"/>
    <button onClick={opts.comment}>
        comment on post
    </button>
</blog>