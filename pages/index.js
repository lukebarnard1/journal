import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Page from '../components/page';
import IndexHeader from '../components/index-header';
import FoldingColumns from '../components/folding-columns';
import ArticleList from '../components/article-list';

function stateToProps(state = {}) {
    return {
        articles: state.articles || [],
    };
}

class IndexPage extends React.Component {
    static async getInitialProps({ query, store }) {
        store.dispatch({
            type: 'j-get-articles',
            payload: {},
        });
        return {
            category: query.category,
        };
    }

    render() {
        const { category, articles } = this.props;
        return (
            <Page>
                <FoldingColumns>
                    <IndexHeader category={category} />
                    <ArticleList articles={articles} />
                </FoldingColumns>
            </Page>
        );
    }
}
IndexPage.propTypes = {
    category: PropTypes.string.isRequired,
};

export default connect(stateToProps)(IndexPage);
