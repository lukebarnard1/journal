import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ArticleCard from './article-card';

function ArticleList({ articles, category }) {
    const articleCards = Object.values(articles)
        .filter(article => category === undefined || article.articleCategory === category)
        .sort((a, b) => b.articleDate - a.articleDate)
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
                        flex-grow: 1;

                        justify-content: center;
                    }
                `}
            </style>
        </div>
    );
}
ArticleList.defaultProps = {
    category: undefined,
};
ArticleList.propTypes = {
    articles: PropTypes.arrayOf(ArticleCard.propTypes).isRequired,
    category: PropTypes.string,
};

const stateToProps = ({ articles }) => ({ articles });

export default connect(stateToProps)(ArticleList);
