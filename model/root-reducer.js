
export default function rootReducer(state = { articles: [] }, action) {
    switch (action.type) {
    case 'j-select-article':
        return {
            ...state,
            currentArticleId: action.payload.id.join('/'),
        };
    case 'j-select-article-success':
        return {
            ...state,
            articles: {
                ...state.articles,
                [action.payload.id.join('/')]: action.payload.article,
            },
        };
    case 'j-get-articles-success':
        return {
            ...state,
            articles: {
                ...state.articles,
                ...action.payload.articles,
            },
        };
    default:
        return state;
    }
}
