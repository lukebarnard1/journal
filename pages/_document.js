import Document, { Head, Main, NextScript } from 'next/document';
import React from 'react';

export default class MyDocument extends Document {
    static async getInitialProps(ctx) {
        const props = await Document.getInitialProps(ctx);
        // append value to props
        return { ...props };
    }

    render() {
        const styleSheetUrls = [
            '//fonts.googleapis.com/css?family='
            + 'Markazi+Text|'
            + 'Open+Sans|'
            + 'Ubuntu+Mono',
            '/static/hljs.css',
        ];

        const scriptUrls = [];

        return (
            <html lang="en">
                <Head>
                    <meta name="viewport" content="initial-scale=1" />
                    { styleSheetUrls.map(
                        url => <link href={url} rel="stylesheet" key={url} />,
                    ) }
                    { scriptUrls.map(
                        url => <script src={url} key={url} />,
                    ) }
                    <style>
                        {`
                        *:focus { outline: 1px solid }
                        body {
                            margin: 0px;
                            overflow-y: scroll;
                        }
                        html {
                            box-sizing: border-body;
                        }
                        html, body, #__next {
                            height: 100%;
                        }
                        *, *:before, *:after {
                            box-sizing: inherit;
                        }
                    `}
                    </style>
                </Head>
                {/* set className to body */}
                <body>
                    <Main />
                    <NextScript />
                </body>
            </html>
        );
    }
}
