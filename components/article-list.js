import React from 'react';
import ArticleCard from './article-card';
import * as mw from './ho/mediaWrapper';

function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
// articleTitle, articleImgSrc, articleTimestamp, articleHref, userImgSrc

function randomArticle() {
    const articleTitle = randomChoice([
        'This is the title of the article',
        'Streets, parks and bridges of London',
        'Life in the city',
        'Finding the job of your dreams in the big city',
    ]);
    return {
        articleTitle,
        articleImgSrc: '/static/image' + randomChoice([1, 2, 3, 4, 5]) + '.jpg',
        articleTimestamp: randomChoice([
            '1 year ago',
            '20 days ago',
            '2 weeks ago',
            '2 years ago',
            '10 minutes ago',
        ]),
        articleHref: randomChoice(['parks', 'london', 'articles-i-wrote']) + '/' + articleTitle.toLowerCase().replace(/[^a-z]+/g, '-'),
        userImgSrc: '/static/avatar.png',
    };
}

function generateRandomArticles(count = 10) {
    const articles = [];
    while (count > 0) {
        articles.push(randomArticle());
        count -= 1;
    }
    return articles;
}

function ArticleList() {
    return (
        <div className="article-list">
            <ArticleCard {...randomArticle()} />
            {generateRandomArticles(5).map(article => <ArticleCard {...article} key={article.articleHref} />)}
            <style jsx>
                {`
                    .article-list {
                        display: flex;
                        flex-wrap: wrap;

                        justify-content: center;
                    }
                `}
            </style>
        </div>
    );
}
export default mw.mediaWrapper(ArticleList);
