import React from 'react';
import UserCard from './user-card';
import Comments from './comments';

export default function ArticleFooter(props) {
    const { articleComments } = props;
    return (
        <div>
            <UserCard {...props} />
            <Comments comments={articleComments} />
            <style jsx>
                {`
                    div {
                        margin-bottom: 100px;
                    }
                `}
            </style>
        </div>
    );
}
ArticleFooter.propTypes = {
    articleComments: Comments.arrayPropType.isRequired,
};
