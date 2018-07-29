import React from 'react';
import PropTypes from 'prop-types';
import ArticleCard from './article-card';
import * as mw from './ho/mediaWrapper';

function ArticleList({ articles }) {
    return (
        <div className="article-list">
            {Object.values(articles).map(article => <ArticleCard {...article} key={article.articleHref} />)}
            <style jsx>
                {`
                    .article-list {
                        display: flex;
                        flex-wrap: wrap;

                        justify-content: center;
                    }
                `}
            </style>
        </div>
    );
}
ArticleList.propTypes = {
    articles: PropTypes.arrayOf(ArticleCard.propTypes).isRequired,
};
export default mw.mediaWrapper(ArticleList);
