import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Page from '../components/page';
import IndexHeader from '../components/index-header';
import FoldingColumns from '../components/folding-columns';
import ArticleList from '../components/article-list';

import fetch from 'isomorphic-unfetch';

function stateToProps(state = {}) {
    return {
        articles: state.articles || [],
    };
}

class IndexPage extends React.Component {
    static async getInitialProps({ query, store, isServer }) {
        if (isServer) {
            store.dispatch({
                type: 'j-get-articles',
            });
        } else {
        }
        return {
            category: query.category,
        };
    }

    render() {
        const { category } = this.props;
        const { articles } = this.props;
        let categories = {};
        Object.keys(articles).forEach((k) => {
            const a = articles[k];
            const href = a.articleHref;
            const category = href.split('/')[0];
            categories[category] = true;
        });
        categories = Object.keys(categories).map(
            k => ({id: k, name: k})
        );
        return (
            <Page>
                <FoldingColumns>
                    <IndexHeader categories={categories} category={category} />
                    <ArticleList category={category} />
                </FoldingColumns>
            </Page>
        );
    }
}
IndexPage.propTypes = {
    category: PropTypes.string,
};

export default connect(stateToProps)(IndexPage);
