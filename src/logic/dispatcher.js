const stores = [];

function registerStore(s) {
	stores.push(s);
}

// This is the dispatcher. It dispatches an action to all registered stores
function dispatch(action) {
    console.log('dispatch('+ action.type + ')');

    stores.forEach(s => {
    	s.onAction(action);
    });
}

module.exports = {
	registerStore,
	dispatch,
};
