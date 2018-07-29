import {
    takeEvery,
    put,
    call,
    all,
} from 'redux-saga/effects';

class CommentDatum {
    constructor(depth) {
        this.id = Math.random().toString(16).slice(2, 10);
        this.userImgUrl = '/static/avatar.png';
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

function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function randomArticle() {
    const articleNumber = randomChoice([0, 1, 2, 3, 4]);
    const articleTitle = [
        'This is the title of the article',
        'Streets, parks and bridges of London',
        'Life in the city',
        'Finding the job of your dreams in the big city',
        'Another blog post',
    ][articleNumber];
    const articleCategory = ['bridges', 'sunflowers', 'parks', 'london', 'articles-i-wrote'][articleNumber];
    const articleHref = `${articleCategory}/${articleTitle.toLowerCase().replace(/[^a-z]+/g, '-')}`;
    return {
        articleTitle,
        articleImgSrc: `/static/image${1 + articleNumber}-small.jpeg`,
        articleTimestamp: [
            '1 year ago',
            '20 days ago',
            '2 weeks ago',
            '2 years ago',
            '10 minutes ago',
        ][articleNumber],
        articleHref,
        articleMarkdown: exampleMarkdown,
        articleComments: [
            new CommentDatum(3),
            new CommentDatum(3),
            new CommentDatum(3),
        ],
        userImgSrc: '/static/avatar.png',
        userName: 'Duncan Idaho',
        userTagline: 'duke and rightful heir to the thrown on planet Arrakis',
    };
}

function* selectArticle({ payload }) {
    // For now, directly put a dummy article.
    // TODO: Actually fetch an individual article from the backend
    const article = randomArticle();
    yield put({
        type: 'j-select-article-success',
        payload: {
            id: payload.id,
            article,
        },
    });
}

function generateRandomArticles(count = 10) {
    const articles = {};
    while (count > 0) {
        const article = randomArticle();
        articles[article.articleHref] = article;
        count -= 1;
    }
    return articles;
}

function* getArticles() {
    yield put({
        type: 'j-get-articles-success',
        payload: {
            articles: generateRandomArticles(5),
        },
    });
}

function* watchSelectArticle() {
    yield takeEvery('j-select-article', selectArticle);
}
function* watchGetArticles() {
    yield takeEvery('j-get-articles', getArticles);
}

export default function* rootSaga() {
    yield all([
        call(watchSelectArticle),
        call(watchGetArticles),
    ]);
}
