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
    const { imgUrl, title, markdown } = props;
    if (!imgUrl || !title || !markdown) {
        return null;
    }
    return (
        <div className="article">
            <ArticleHeader {...props} />
            {imgUrl ? <img alt="" src={imgUrl} /> : null}
            <div className="article-central">
                <h1>
                    {title}
                </h1>
                <MarkdownStyled source={markdown} />
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
                        width: 700px;
                        max-width: 100%;
                        margin: 0px auto;
                        padding: 0px 8px;
                    }
                `}
            </style>
        </div>
    );
}
Article.defaultProps = {
    imgUrl: null,
};
Article.propTypes = {
    imgUrl: PropTypes.string,
    title: PropTypes.string.isRequired,
    markdown: PropTypes.string.isRequired,
};
