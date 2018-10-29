import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ArticleCard from './article-card';
import * as mw from './ho/mediaWrapper';

function ArticleList({ articles }) {
    const articleCards = Object.values(articles)
        .map(article => (
            <ArticleCard
                {...article}
                key={article.articleHref}
            />
        ));
    return (
        <div className="article-list">
            { articleCards }
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

const stateToProps = ({ articles }) => ({ articles });

export default connect(stateToProps)(mw.mediaWrapper(ArticleList));
