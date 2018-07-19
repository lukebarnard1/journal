import Document, { Head, Main, NextScript } from 'next/document'
export default class MyDocument extends Document {
    static async getInitialProps (ctx) {
        const props = await Document.getInitialProps(ctx)
        // append value to props
        return { ...props }
    }

    render () {
        const styleSheetUrls = [
            "//fonts.googleapis.com/css?family="
            + "Markazi+Text|"
            + "Open+Sans|"
            + "Ubuntu+Mono",
            "/static/hljs.css"
        ]

        const scriptUrls = []

        return (
            <html>
                <Head>
                    <meta name="viewport" content="initial-scale=1"/>
                    { styleSheetUrls.map(
                        (url) => <link href={url} rel="stylesheet"/>
                    ) }
                    { scriptUrls.map(
                        (url) => <script src={url}></script>
                    ) }
                    <style>{`
                        *:focus { outline: 1px solid }
                        body {
                            margin: 0px;
                        }
                    `}</style>
                </Head>
                {/* set className to body */}
                <body>
                    <Main />
                    <NextScript />
                </body>
            </html>
        )
    }
}
