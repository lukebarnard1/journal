const riot = require('riot');
const route = require('riot-route');

require('./tag/test.tag');
require('./tag/raw.tag');
require('./tag/comment.tag');
require('./tag/blog.tag');
require('./tag/main.tag');

riot.mount("*");
