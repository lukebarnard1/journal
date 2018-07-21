import { takeEvery, put } from 'redux-saga/effects';

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

function* selectArticle({ payload }) {
    // For now, directly put a dummy article.
    // TODO: Actually fetch an individual article from the backend
    const article = {
        title: 'The title of the article',
        timestamp: 'posted two days ago',
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
    yield put({
        type: 'j-select-article-success',
        payload: {
            id: payload.id,
            article,
        },
    });
}

function* watchSelectArticle() {
    yield takeEvery('j-select-article', selectArticle);
}

export default function* rootSaga() {
    yield watchSelectArticle();
}
