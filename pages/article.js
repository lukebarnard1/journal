import React from 'react';
import { connect } from 'react-redux';

import fonts from '../style/fonts';
import Navigation from '../components/navigation';
import Article from '../components/article';

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

        return {
            category: query.category,
            id: query.id,
        };
    }

    render() {
        return (
            <div>
                <Navigation />
                <div>
                    <Article {...this.props} />
                    <div className="root">
                        <a href="/about" className="brand">
                        journal // decentralised blogging
                        </a>
                        <a href="/">
                            Home
                        </a>
                        <a href="/explore">
                            Explore
                        </a>
                        <a href="/register">
                            Register
                        </a>
                        <a href="/about">
                            About
                        </a>
                        <a href="/code">
                            Code
                        </a>
                        <style jsx>
                            {`
                                .brand {
                                    font-family: ${fonts.header};
                                    font-size: 20pt;

                                    text-decoration: none;

                                    margin-bottom: 40px;
                                }
                                .root {
                                    background-color: #444;
                                    padding: 50px;
                                }
                                a {
                                    font-family: ${fonts.ui};
                                    font-size: 10pt;

                                    margin-bottom: 10px;

                                    display: block;

                                    color: #eee;
                                }
                                a:hover {
                                    color: #fff;
                                }
                            `}
                        </style>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(stateToProps)(ArticlePage);
