import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';

import rootSaga from './root-saga';
import rootReducer from './root-reducer';

const sagaMiddleware = createSagaMiddleware();

function configureStore(initialState) {
    const store = createStore(
        rootReducer,
        initialState,
        applyMiddleware(sagaMiddleware),
    );

    /**
     * next-redux-saga depends on `runSagaTask` and `sagaTask` being attached to the store.
     *
     *   `runSagaTask` is used to rerun the rootSaga on the client when in sync mode (default)
     *   `sagaTask` is used to await the rootSaga task before sending results to the client
     *
     */

    store.runSagaTask = () => {
        store.sagaTask = sagaMiddleware.run(rootSaga);
    };

    // run the rootSaga initially
    store.runSagaTask();
    return store;
}

export default configureStore;
