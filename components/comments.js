import React from 'react';
import PropTypes from 'prop-types';
import fonts from '../style/fonts';
import Avatar from './avatar';
import Button from './button';

function Comment({
    userImgUrl, userName, text, timestamp, score, comments,
}) {
    return (
        <div className="root">
            <div className="comment">
                <Avatar src={userImgUrl} size={48} />
                <div className="col-2">
                    <div className="name">
                        {userName}
                    </div>
                    <div className="text">
                        {text}
                    </div>
                    <div className="timestamp">
                        {timestamp}
                    </div>
                </div>
            </div>
            <div className="thread">
                { comments && score > 0
                    ? <Comments comments={comments} />
                    : null
                }
            </div>
            <style jsx>
                {`
                    .comment {
                        display: flex;
                        margin: 15px 0px;

                        opacity: ${score > 0 ? 1.0 : 0.4}
                    }

                    .thread {
                        border-left: 1px solid #ddd;
                        padding-left: 24px;
                        margin-left: 24px;
                        maring-bottom: 20px;
                    }

                    .col-2 {
                        padding-top: 10px;
                        margin-left: 10px;
                    }

                    .name {
                        font-size: 10pt;
                        font-family: ${fonts.ui};
                        color: #666;
                    }

                    .text {
                        font-size: 10pt;
                        font-family: ${fonts.body};

                        padding-top: 10px;
                    }

                    .timestamp {
                        font-family: ${fonts.ui};
                        font-size: 10pt;

                        color: #aaa;

                        margin: 10px 0px;
                    }
                `}
            </style>
        </div>
    );
}
Comment.defaultProps = {
    comments: [],
};

// XXX: This is pants. The rules applied by eslint imply nesting prop-types
// should be avoided. Afterall, redundantly validating is a bit pointless.
const commentType = {
    userImgUrl: PropTypes.string.isRequired,
    userName: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
    score: PropTypes.number.isRequired,
};

Comment.propTypes = {
    userImgUrl: PropTypes.string.isRequired,
    userName: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
    score: PropTypes.number.isRequired,
    comments: PropTypes.arrayOf(PropTypes.shape(Comment.propTypes)),
};

export default class Comments extends React.Component {
    constructor() {
        super();
        this.state = { visible: 1 };
    }

    render() {
        const { comments } = this.props;
        const { visible } = this.state;
        return (
            <div>
                {comments
                    .sort((commentA, commentB) => commentB.score - commentA.score)
                    .slice(0, visible)
                    .map(comment => <Comment key={comment.id} {...comment} />)}
                { comments.length > visible ? (
                    <Button onClick={() => this.setState({ visible: visible + 5 })}>
                        Show more
                    </Button>
                ) : null }
            </div>
        );
    }
}
Comments.arrayPropType = PropTypes.arrayOf(PropTypes.shape(commentType));
Comments.propTypes = {
    comments: Comments.arrayPropType.isRequired,
};
