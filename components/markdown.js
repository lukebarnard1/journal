import Markdown from 'react-markdown'

import fonts from '../style/fonts';

const MarkdownStyled = (props) => {
    return <div>
        <Markdown className='j-article-md-body' {...props}/>
        <style global jsx>{`
            .j-article-md-body p,
            .j-article-md-body h1,
            .j-article-md-body h2,
            .j-article-md-body h3,
            .j-article-md-body h4,
            .j-article-md-body h5 {
                color: #222;
            }
            .j-article-md-body h1,
            .j-article-md-body h2,
            .j-article-md-body h3,
            .j-article-md-body h4,
            .j-article-md-body h5 {
                font-family: ${fonts.header};
            }
            .j-article-md-body h1 {
                font-size: 50pt;
            }
            .j-article-md-body h2 {
                font-size: 40pt;
            }
            .j-article-md-body h3 {
                font-size: 30pt;
            }
            .j-article-md-body h4 {
                font-size: 20pt;
            }
            .j-article-md-body h5 {
                font-size: 15pt;
            }
            .j-article-md-body p
            {
                font-size: 12pt;
                font-family: ${fonts.body};

                line-height: 2em;
                margin: 2em 0px 0px 0px;
            }
            .j-article-md-body ul,
            .j-article-md-body ol
            {
                font-size: 12pt;
                font-family: ${fonts.body};
                line-height: 2em;
                margin-top: 0px;
            }
            .j-article-md-body li {
            }
            .j-article-md-body hr {
                margin: 30px 20%;
                width: 60%;
                text-align: center;
                min-width: 50px;
                border: 0.5px solid #ccc;
            }
            .j-article-md-body pre,
            .j-article-md-body pre.hljs {
                padding: 20px 30px;
                line-height: 1.5em;
            }
            /* Colour both of these for basic pre-hljs style */
            .j-article-md-body pre,
            .j-article-md-body code {
                /* TODO: this colour is defined in hljs.css */
                background-color: #f0f0f0;
            }
            .j-article-md-body pre {
                opacity: 0;
            }
            .j-article-md-body pre.hljs {
                opacity: 1;
                transition: opacity 0.2s ease-in;
            }
            .j-article-md-body code {
                font-family: ${fonts.code};
            }
            .j-article-md-body h1 code,
            .j-article-md-body h2 code,
            .j-article-md-body h3 code,
            .j-article-md-body h4 code,
            .j-article-md-body h5 code {
                font-size: 0.84em;
            }
            .j-article-md-body blockquote {
                border-left: 4px solid #ddd;
                padding-left: 40px;
            }
            .j-article-md-body blockquote p {
                color: #888;
            }
            .j-article-md-body img {
                width: 100%;
            }
        `}</style>
    </div>
}

export default MarkdownStyled;
