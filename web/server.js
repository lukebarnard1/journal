const express = require('express');
const next = require('next');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const fs = require('fs');

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
    }
}
function randomArticle() {
    return {
        articleComments: [
            new CommentDatum(3),
            new CommentDatum(3),
            new CommentDatum(3),
        ],
    };
}

const HOUR = 1000 * 60 * 60;
const DAY = HOUR * 24;
const MONTH = DAY * 30;

function relativeDate(date) {
    // > 1m  : 1y 4m
    // > 48h : 26d
    // > 1h : 34h
    // !!!

    const now = Date.now();

    const delta = now - date;

    if (delta < HOUR) return '0h';

    if (delta < 2 * DAY) {
        const hours = Math.floor(delta / HOUR);
        return `${hours}h`;
    }

    if (delta < MONTH) {
        const days = Math.floor(delta / DAY);
        return `${days}d`;
    }

    const years = Math.floor(delta / (12 * MONTH));
    const months = (Math.floor(delta / MONTH) - 12 * Math.floor(delta / (12 * MONTH)));
    return `${years}y ${months} m`;
}


function loadArticle({ id, category }) {
    const fileName = `./articles/${category}/${id}.md`;
    const contents = (() => {
      try {
        return fs.readFileSync(fileName).toString('utf8');
      } catch (e) {
        console.log(e)
        return null
      }
    })()

    if (!contents) return null

    const date = fs.statSync(fileName).ctime;

    const sections = contents.split('---');

    const details = sections[1].split('\n').map((line) => {
        const matches = /^([a-zA-Z]+):(.+)$/.exec(line);
        if (!matches) return null;
        const [key, value] = matches.slice(1);
        return {
            [key]: value,
        };
    }).reduce((a, b) => ({ ...a, ...b }), Object(null));
    const articleMarkdown = sections[2];

    const {
        title,
        author,
        authorImg,
        authorTagline,
        imageUrl,
    } = details;

    const articleTimestamp = relativeDate(date);

    return {
        articleTitle: title,
        articleImgSrc: imageUrl,
        articleTimestamp,
        articleDate: date - 0,
        articleHref: `${category}/${id}`,
        articleMarkdown,
        articleComments: [],
        articleCategory: category,
        userImgSrc: authorImg,
        userName: author,
        userTagline: authorTagline,
    };
}

function listArticles() {
    let categories = fs.readdirSync('./articles');
    const articles = categories.map(category => fs.readdirSync(`./articles/${category}`).map(id => ({ category, id: id.split('.')[0] }))).reduce((a, b) => a.concat(b), []);
    return articles
        .map(loadArticle)
        .filter(Boolean)
        .reduce((rest, a) => ({ ...rest, [a.articleHref]: a }), Object(null));
}


app.prepare()
    .then(() => {
        const server = express();

        server.get('/data/articles', (req, res) => {
            res.json(listArticles());
        });

        server.get('/data/article/:category/:id', (req, res) => {
            const articleResponse = loadArticle(req.params);
            res.json(articleResponse);
        });

        server.get('/:category', (req, res) => app.render(req, res, '/', {
            category: req.params.category,
        }));

        server.get('/:category/:id', (req, res) => app.render(req, res, '/article', {
            category: req.params.category,
            id: req.params.id,
        }));


        server.get('*', (req, res) => handle(req, res));

        server.listen(port, (err) => {
            if (err) throw err;
            console.log(`> Ready on http://localhost:${port}`);
        });
    });
