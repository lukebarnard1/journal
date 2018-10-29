import React from 'react';
import PropTypes from 'prop-types';

import fonts from '../style/fonts';
import MarkdownStyled from './markdown';
import ArticleFooter from './article-footer';
import UserCard from './user-card';

function ArticleHeader(props) {
    return (
        <div>
            <UserCard {...props} />
        </div>
    );
}

export default function Article(props) {
    const { articleImgSrc, articleTitle, articleMarkdown } = props;

    const {
        userImgSrc,
        userName,
        userTagline,
        articleTimestamp,
    } = props;
    const headerProps = {
        userImgSrc, userName, userTagline, timestamp: articleTimestamp,
    };

    if (!articleImgSrc || !articleTitle || !articleMarkdown) {
        return null;
    }
    return (
        <div className="article">
            <div className="article-central">
                <ArticleHeader {...headerProps} />
            </div>
            {articleImgSrc ? <img alt="" src={articleImgSrc} /> : null}
            <div className="article-central">
                <h1>
                    {articleTitle}
                </h1>
                <MarkdownStyled source={articleMarkdown} />
                <ArticleFooter {...props} />
            </div>
            <style jsx="true">
                {`
                    .article {
                        width: calc(100% -16px);
                    }

                    h1 {
                        font-family: ${fonts.header};
                        font-size: 50pt;
                    }

                    img {
                        width: 100%;
                        max-height: 40vh;
                        object-fit: cover;
                    }

                    .article-central {
                        max-width: 700px;
                        margin: 0px auto;
                        padding: 0px 8px;
                    }
                `}
            </style>
        </div>
    );
}
Article.defaultProps = {
    articleImgSrc: null,
};
Article.propTypes = {
    userImgSrc: PropTypes.string.isRequired,
    userName: PropTypes.string.isRequired,
    userTagline: PropTypes.string.isRequired,
    articleTimestamp: PropTypes.string.isRequired,
    articleImgSrc: PropTypes.string,
    articleTitle: PropTypes.string.isRequired,
    articleMarkdown: PropTypes.string.isRequired,
};
