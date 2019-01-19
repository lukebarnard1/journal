import React from 'react';
import { connect } from 'react-redux';

import Article from '../components/article';
import Page from '../components/page';

function stateToProps(state = {}) {
    return {
        ...(state.articles || [])[state.currentArticleId],
    };
}

class ArticlePage extends React.Component {
    static async getInitialProps({ query, store }) {
        // getInitialProps provides the inital properties whilst interaction
        // with the component will cause sagas to continue and cause side
        // effects.
        store.dispatch({
            type: 'j-select-article',
            payload: {
                id: [query.category, query.id],
            },
        });
        // Also need to get articles if we land on this originally
        store.dispatch({
            type: 'j-get-articles',
        });

        return {
            category: query.category,
            id: query.id,
        };
    }

    render() {
        return (
            <Page>
                <Article {...this.props} />
            </Page>
        );
    }
}

export default connect(stateToProps)(ArticlePage);
