const riot = require('riot');

const testTag = require('./tag/test.tag');
const rawTag = require('./tag/raw.tag');
const commentTag = require('./tag/comment.tag');
const blogTag = require('./tag/blog.tag');
const mainTag = require('./tag/main.tag');

riot.route.base('/');
riot.mount("*");

let l = riot.route.create();
l('/', 			() => {riot.route('/journal/!qJXdPYrthkbuFjdrxj:matrix.org');});
l('/journal', 	() => {riot.route('/journal/!qJXdPYrthkbuFjdrxj:matrix.org');});
