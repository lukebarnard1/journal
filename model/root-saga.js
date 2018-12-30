import {
    takeEvery,
    put,
    call,
    all,
} from 'redux-saga/effects';

import fetch from 'isomorphic-unfetch';

function* selectArticle({ payload }) {
    // For now, directly put a dummy article.
    // TODO: Actually fetch an individual article from the backend
    const req = yield call(fetch, 'http://localhost:3000/data/article/' + payload.id.join('/'));
    const article = yield req.json();
    yield put({
        type: 'j-select-article-success',
        payload: {
            id: payload.id,
            article,
        },
    });
}


function* getArticles() {
    const req = yield call(fetch, 'http://localhost:3000/data/articles');
    const res = yield req.json();
    yield put({
        type: 'j-get-articles-success',
        payload: {
            articles: res,
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
