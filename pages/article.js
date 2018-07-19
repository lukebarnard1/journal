import React from 'react'
import fetch from 'isomorphic-unfetch'
import * as hljs from 'highlight.js'

import Navigation from '../components/navigation.js';
import MarkdownStyled from '../components/markdown.js';
import fonts from '../style/fonts'

class Avatar extends React.Component {
    render() {
        return <div>
            <img className="avatar" src={this.props.src}/>
            <style jsx>{`
                .avatar {
                    width: ${this.props.size ? this.props.size : 64}px;
                    height: ${this.props.size ? this.props.size : 64}px;
                    border: 1px solid rgba(0, 0, 0, 0.04);
                    background-color: #f0f0f0;
                    border-radius: 50%;
                }
            `}</style>
        </div>
    }
}

class UserCard extends React.Component {
    render() {
        return <div className="j-user-card">
            <Avatar src={this.props.userImgUrl}/>
            <div className="details">
                <div className="name">{this.props.userName}</div>
                <div className="tag">{this.props.userTagline}</div>
                <div className="ts">{this.props.timestamp}</div>
            </div>
            <div className="subscribe">
                <button>
                    Subscribe
                </button>
            </div>
            <style jsx>{`
                .j-user-card {
                    font-family: ${fonts.ui};
                    font-size: 10pt;
                    display: flex;
                    align-items: center;

                    padding: 35px 27px;
                    border-bottom: 1px solid #ddd;
                    overflow: hidden;
                }

                .j-user-card .details {
                    margin-left: 30px;
                    color: #666;
                    line-height: 14pt;
                }

                .j-user-card .details .name {
                    font-size: 14pt;
                    padding-top: 10px;
                    line-height: 28pt;
                }
                .j-user-card .details .tag {
                    font-size: 10pt;
                }

                .j-user-card .details .ts {
                    font-size: 10pt;
                    color: #aaa;
                }

                .subscribe {
                    flex-grow: 1;
                    display: flex;
                    justify-content: flex-end;

                    margin-left: 30px;
                }

                .subscribe button {
                    border: 1px solid #ddd;
                    border-radius: 4px;

                    background-color: #fff;

                    padding: 10px;

                    cursor: pointer;
                }

                .subscribe button:active {
                    color: #fff;
                    background-color: #222;
                }
                .subscribe button:focus {
                    border: 1px solid #444;
                    outline: 0px;
                }
            `}</style>
        </div>
    }
}

class ArticleHeader extends React.Component {
    render() {
        return <div>
            <UserCard {...this.props}/>
        </div>
    }
}

class CommentDatum {
    constructor(depth) {
        this.userImgUrl = "http://i.pravatar.cc/48"
        this.userName = "Some Person"
        this.text = [
            "I am writing a comment. ",
            "This is a comment. ",
            "Writing comments makes me feel alive. ",
        ][Math.floor(Math.random() * 3)].repeat(1 + Math.floor(Math.random() * 10));
        this.timestamp = [
            "commented three days ago",
            "commented two weeks ago",
            "commented last year"
        ][Math.floor(Math.random() * 3)];

        this.score = Math.floor(Math.random() * 50) - 25;

        if (depth <= 0) return;
        this.comments = [];

        let count = Math.floor(Math.random() * 5);
        while (count-- > 0) {
            this.comments.push(new CommentDatum(depth - 1));
        }
    }
}

class Comment extends React.Component {
    render() {
        return <div className="root">
            <div className="comment">
                <Avatar src={this.props.userImgUrl} size={48}/>
                <div className="col-2">
                    <div className="name">
                        {this.props.userName}
                    </div>
                    <div className="text">
                        {this.props.text}
                    </div>
                    <div className="timestamp">
                        {this.props.timestamp}
                    </div>
                </div>
            </div>
            <div className="thread">
                { this.props.comments && this.props.score > 0 ?
                    <Comments comments={this.props.comments}/>
                    : null
                }
            </div>
            <style jsx>{`
                .comment {
                    display: flex;
                    margin: 15px 0px;

                    opacity: ${this.props.score > 0 ? 1.0 : 0.4}
                }

                .thread {
                    border-left: 1px solid #ddd;
                    padding-left: 24px;
                    margin-left: 24px;
                    maring-bottom: 20px;
                }

                .col-2 {
                    padding-top: 10px;
                    margin-left: 10px;
                }

                .name {
                    font-size: 10pt;
                    font-family: ${fonts.ui};
                    color: #666;
                }

                .text {
                    font-size: 10pt;
                    font-family: ${fonts.body};

                    padding-top: 10px;
                }

                .timestamp {
                    font-family: ${fonts.ui};
                    font-size: 10pt;

                    color: #aaa;

                    margin: 10px 0px;
                }
            `}</style>
        </div>
    }
}

class Comments extends React.Component {
    constructor(props) {
        super();
        this.state = { visible: 1 };
    }
    render() {
        return <div>
            {this.props.comments
                    .sort((commentA, commentB) => commentB.score - commentA.score)
                    .slice(0, this.state.visible)
                    .map((comment, index) => <Comment key={index} {...comment}/>)}
            { this.props.comments.length > this.state.visible ? <a className="more" href="javascript:;" onClick={() => this.setState({ visible: this.state.visible + 5})}>Show more</a> : null }
            <style jsx>{`
                .more {
                    font-family: ${fonts.ui};
                    font-size: 10pt;

                    color: #aaa;

                    cursor: pointer;

                    margin-top: 10px;
                }
            `}</style>
        </div>
    }
}

class ArticleFooter extends React.Component {
    render() {
        return <div>
            <UserCard {...this.props}/>
            <Comments comments={this.props.articleComments}/>
            <style jsx>{`
                div {
                    margin-bottom: 100px;
                }
            `}</style>
        </div>
    }
}

class Article extends React.Component {
    collectRoot(root) {
        if (!root) return

        const md = root.getElementsByClassName('j-article-md-body')[0];

        const codeElements = md.getElementsByTagName('pre')
        Array.from(codeElements).map((el) => hljs.highlightBlock(el))
    }

    render() {
        return <div className="j-article" ref={this.collectRoot}>
            <ArticleHeader {...this.props}/>
            {this.props.imgUrl ? <img src={this.props.imgUrl}/> : null}
            <div className="j-article-central">
                <h1>{this.props.title}</h1>
                <MarkdownStyled source={this.props.markdown}/>
                <ArticleFooter {...this.props}/>
            </div>
            <style jsx="true">{`
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
            `}</style>
        </div>
    }
}
const exampleMarkdown = require('raw-loader!../example.md');
class ArticlePage extends React.Component {
    static async getInitialProps({ req, query }) {
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

            title: "The title of the article",
            timestamp: 'posted two days ago',
            // For now, load an example file.
            // TODO: Load content from store.
            markdown: exampleMarkdown,
            imgUrl: "https://cdn-images-1.medium.com/max/2000/1*Q88mzWfxMkth0apk4vV7gw.jpeg",

            articleComments: [
                new CommentDatum(3),
                new CommentDatum(3),
                new CommentDatum(3),
            ],

            userImgUrl: "http://i.pravatar.cc/64",
            userName: "Duncan Idaho",
            userTagline: "duke and rightful heir to the thrown on planet Arrakis",
        }
    }

    render() {
        return <div>
            <Navigation/>
            <div>
                <Article {...this.props} />
                <div className="root">
                    <a href="/about" className="brand">
                        journal // decentralised blogging
                    </a>
                    <a href="/">Home</a>
                    <a href="/explore">Explore</a>
                    <a href="/register">Register</a>
                    <a href="/about">About</a>
                    <a href="/code">Code</a>
                    <style jsx>{`
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
                    `}</style>
                </div>
            </div>
        </div>
    }
}

export default ArticlePage
