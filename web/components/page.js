import React from 'react';
import PropTypes from 'prop-types';

import fonts from '../style/fonts';
import Navigation from './navigation';

function Page({ children }) {
    return (
        <div>
            <Navigation />
            <div>
                <div className="main">
                    { children }
                </div>
                <div className="page-footer">
                    <a
                        className="brand"
                        href="https://github.com/lukebarnard1/journal/blob/master/README.md"
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        journal // decentralised blogging
                    </a>
                    <a href="/">
                        Home
                    </a>
                    <a href="/explore" className="disabled">
                        Explore
                    </a>
                    <a href="/register" className="disabled">
                        Register
                    </a>
                    <a href="https://github.com/lukebarnard1/journal" target="_blank" rel="noopener noreferrer">
                        Code
                    </a>
                </div>
            </div>
            <style jsx>
                {`
                    .main {
                        max-width: 1000px;
                        margin: 0 auto;
                        min-height: calc(100vh - 130px);
                    }

                    .brand {
                        font-family: ${fonts.header};
                        font-size: 20pt;

                        text-decoration: none;

                        margin-bottom: 40px;
                    }

                    .disabled {
                        pointer-events: none;

                        text-decoration: none;
                        opacity: 0.7;
                    }

                    .page-footer {
                        background-color: #444;
                        border-top: 2px solid #111;
                        padding: 25px 50px;
                    }

                    a {
                        font-family: ${fonts.ui};
                        font-size: 10pt;

                        margin-bottom: 10px;

                        display: block;

                        color: #eee;
                    }
                    a:hover {
                        color: #fff;
                    }
                `}
            </style>
        </div>
    );
}
Page.propTypes = {
    children: PropTypes.node.isRequired,
};

export default Page;
