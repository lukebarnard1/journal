<comment>
    <span style="font-weight: 700">comment from {opts.sender}: </span><span>{opts.content}</span>
    <button if={opts.mine} onClick={opts.delete}>
        delete comment
    </button>
</comment>