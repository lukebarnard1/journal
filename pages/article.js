import React from 'react';

import fonts from '../style/fonts';
import Navigation from '../components/navigation';
import Article from '../components/article';

class CommentDatum {
    constructor(depth) {
        this.id = Math.random().toString(16).slice(2, 10);
        this.userImgUrl = 'http://i.pravatar.cc/48';
        this.userName = 'Some Person';
        this.text = [
            'I am writing a comment. ',
            'This is a comment. ',
            'Writing comments makes me feel alive. ',
        ][Math.floor(Math.random() * 3)].repeat(1 + Math.floor(Math.random() * 10));
        this.timestamp = [
            'commented three days ago',
            'commented two weeks ago',
            'commented last year',
        ][Math.floor(Math.random() * 3)];

        this.score = Math.floor(Math.random() * 50) - 25;

        if (depth <= 0) return;
        this.comments = [];

        let count = Math.floor(Math.random() * 5);
        while (count > 0) {
            this.comments.push(new CommentDatum(depth - 1));
            count -= 1;
        }
    }
}

const exampleMarkdown = require('raw-loader!../example.md'); // eslint-disable-line import/no-unresolved, import/no-webpack-loader-syntax

class ArticlePage extends React.Component {
    static async getInitialProps({ query }) {
        // When called on the server, this can do some async work to fetch
        // the blog content from the backend. For now, we assume it is there
        // and fetch from the store.
        //
        // The store should be a redux saga-ish thing, that maps its state
        // to the properties that we pass into Article.
        //
        // getInitialProps provides the inital properties whilst interaction
        // with the component will cause sagas to continue and cause side
        // effects.
        return {
            category: query.category,
            id: query.id,

            title: 'The title of the article',
            timestamp: 'posted two days ago',
            // For now, load an example file.
            // TODO: Load content from store.
            markdown: exampleMarkdown,
            imgUrl: 'https://cdn-images-1.medium.com/max/2000/1*Q88mzWfxMkth0apk4vV7gw.jpeg',

            articleComments: [
                new CommentDatum(3),
                new CommentDatum(3),
                new CommentDatum(3),
            ],

            userImgUrl: 'http://i.pravatar.cc/64',
            userName: 'Duncan Idaho',
            userTagline: 'duke and rightful heir to the thrown on planet Arrakis',
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

export default ArticlePage;
