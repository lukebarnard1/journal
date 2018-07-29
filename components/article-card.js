import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';

import fonts from '../style/fonts';
import Avatar from './avatar';

function ArticleCard({
    articleTitle, articleImgSrc, articleTimestamp, articleHref, userImgSrc,
}) {
    return (
        <div className="article-card">
            <Link href={articleHref}>
                <div className="post-card">
                    <img src={articleImgSrc} alt="" />
                    <div className="title">
                        {articleTitle}
                    </div>
                    <div className="detail">
                        <Avatar src={userImgSrc} size={32} />
                        <div className="timestamp">
                            {articleTimestamp}
                        </div>
                    </div>
                </div>
            </Link>
            <style jsx>
                {`
                    .article-card {
                        min-width: 200px;
                        width: 100%;
                    }
                    div.post-card {
                        margin: 20px;
                        padding-bottom: 8px;

                        box-shadow: 0px 0px 10px 2px #ccc;
                        cursor: pointer;
                    }
                    div.title {
                        padding: 0px 15px;
                        padding-top: 4px;
                        font-family: ${fonts.header};
                        font-size: 22pt;
                    }
                    div.timestamp {
                        padding: 0px 8px;
                        font-family: ${fonts.ui};
                        font-size: 10pt;
                        color: #aaa;
                    }
                    div.detail {
                        padding: 0px 15px;
                        display: flex;

                        align-items: center
                    }
                    img {
                        object-fit: cover;
                        height: 30vw;
                        max-height: 30vh;
                        width: 100%;
                    }
                `}
            </style>
        </div>
    );
}
ArticleCard.defaultProps = {
    articleImgSrc: null,
};
ArticleCard.propTypes = {
    articleTitle: PropTypes.string.isRequired,
    articleImgSrc: PropTypes.string,
    articleTimestamp: PropTypes.string.isRequired,
    articleHref: PropTypes.string.isRequired,

    userImgSrc: PropTypes.string.isRequired,
};

export default ArticleCard;
