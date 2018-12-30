import React from 'react';
import Link from 'next/link';

import fonts from '../style/fonts';
import Button from './button';

const NAV_HEIGHT = 50;
const NAV_HEIGHT_PX = `${NAV_HEIGHT}px`;

export default class Navigation extends React.Component {
    constructor() {
        super();
        this.state = {
            showNavigation: true,
        };
    }

    componentDidMount() {
        const wheelListener = ev => this.onPageScroll(ev);
        this.removeWheelListener = () => document.removeEventListener('wheel', wheelListener);
        document.addEventListener('wheel', wheelListener);
    }

    componentWillUnmount() {
        this.removeWheelListener();
    }

    onPageScroll(ev) {
        // TODO: Use redux saga for this? Yep. Allows other components to use this state
        // wheel event -> scroll action

        // Scroll up -> show navigation
        this.setState({
            showNavigation:
                ev.deltaY < 0
                || ev.view.pageYOffset < NAV_HEIGHT,
        });
    }

    render() {
        const { showNavigation } = this.state;
        return (
            <div className="navigation">
                <nav>
                    <div className="brand">
                        <Link href="/">
                            <a href="/">
                                journal
                            </a>
                        </Link>
                    </div>
                    { /*
                    <div className="account-button">
                        <Link href="/login">
                            <Button>
                                Log in / Sign up
                            </Button>
                        </Link>
                    </div>
                        */ }
                </nav>
                <style jsx="true">
                    {`
                .navigation {
                    height: ${NAV_HEIGHT_PX};
                }

                nav {
                    font-family: ${fonts.header};
                    font-size: 20pt;
                    line-height: ${NAV_HEIGHT_PX};

                    display: grid;
                    grid-template-columns: 40px 50px auto 100px 40px;

                    width: 100%;
                    height: ${NAV_HEIGHT_PX};
                    border-bottom: 1px solid #ddd;

                    background-color: #fff;
                    color: #222;

                    position: fixed;
                    z-index: 1;
                    top: ${showNavigation ? '0px' : `-${NAV_HEIGHT_PX}`};
                    left: 0px;

                    transition: top 0.2s ease-in-out 0.2s;
                }

                .brand a {
                    color: inherit;
                    text-decoration: none;
                }

                .brand {
                    grid-column-start: 2;
                    grid-column-end: span 1;
                }

                .account-button {
                    grid-column-start: -3;
                    grid-column-end: span 1;
                }
            `}
                </style>
            </div>
        );
    }
}
