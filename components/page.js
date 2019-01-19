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
                    <a href="/about" className="brand">
                    journal // decentralised blogging
                    </a>
                    <a href="/">
                        Home
                    </a>
                    <a href="/explore">
                        Explore
                    </a>
                    <a href="/register">
                        Register
                    </a>
                    <a href="/about">
                        About
                    </a>
                    <a href="/code">
                        Code
                    </a>
                </div>
            </div>
            <style jsx>
                {`
                    .main {
                        min-height: calc(100vh - 130px);
                    }

                    .brand {
                        font-family: ${fonts.header};
                        font-size: 20pt;

                        text-decoration: none;

                        margin-bottom: 40px;
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
