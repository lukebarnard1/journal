import React from 'react';
import PropTypes from 'prop-types';

import fonts from '../style/fonts';
import Navigation from './navigation';

function Page({ children }) {
    return (
        <div>
            <Navigation />
            <div>
                { children }
                <div className="root">
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
                    <style jsx>
                        {`
                            .brand {
                                font-family: ${fonts.header};
                                font-size: 20pt;

                                text-decoration: none;

                                margin-bottom: 40px;
                            }
                            .root {
                                background-color: #444;
                                padding: 50px;
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
            </div>
        </div>
    );
}
Page.propTypes = {
    children: PropTypes.arrayOf(PropTypes.node).isRequired,
};

export default Page;
