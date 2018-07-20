import React from 'react';
import PropTypes from 'prop-types';
import * as hljs from 'highlight.js';

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

function applyMarkdownCodeHighlighting(root) {
    if (!root) return;

    const md = root.getElementsByClassName('j-article-md-body')[0];

    const codeElements = md.getElementsByTagName('pre');
    Array.from(codeElements).map(el => hljs.highlightBlock(el));
}

export default function Article(props) {
    const { imgUrl, title, markdown } = props;
    return (
        <div className="j-article" ref={applyMarkdownCodeHighlighting}>
            <ArticleHeader {...props} />
            {imgUrl ? <img alt="" src={imgUrl} /> : null}
            <div className="j-article-central">
                <h1>
                    {title}
                </h1>
                <MarkdownStyled source={markdown} />
                <ArticleFooter {...props} />
            </div>
            <style jsx="true">
                {`
                    .j-article {
                        width: calc(100% -16px);
                        padding: 0px 8px;
                    }

                    h1 {
                        font-family: ${fonts.header};
                        font-size: 50pt;
                    }

                    img {
                        width: 100%;
                        max-height: 33vh;
                        object-fit: cover;
                    }

                    .j-article-central {
                        width: 700px;
                        max-width: 100%;
                        margin: 0px auto;
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
