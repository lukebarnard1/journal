import React from 'react'
import Link from 'next/link'

import fonts from '../style/fonts'

const NAV_HEIGHT = 50
const NAV_HEIGHT_px = NAV_HEIGHT + "px"

export default class Navigation extends React.Component {
    constructor() {
        super()
        this.state = {
            showNavigation: true
        }
    }

    onPageScroll(ev) {
        // TODO: Use redux saga for this?
        // wheel event -> scroll action

        // Scroll up -> show navigation
        this.setState({
            showNavigation:
                ev.deltaY < 0 ||
                ev.view.pageYOffset < NAV_HEIGHT,
        })
    }

    componentDidMount() {
        const wheelListener = (ev) => this.onPageScroll(ev);
        this._removeWheelListener = () => document.removeEventListener('wheel', wheelListener);
        document.addEventListener('wheel', wheelListener);
    }


    componentWillUnmount() {
        this._removeWheelListener();
    }

    render() {
        return <div className="root">
            <nav>
                <Link href="/">
                    <a>journal</a>
                </Link>
            </nav>
            <style jsx="true">{`
                .root {
                    height: ${NAV_HEIGHT_px};
                }

                nav {
                    font-family: ${fonts.header};
                    font-size: 20pt;
                    line-height: ${NAV_HEIGHT_px};

                    width: 100%;
                    height: ${NAV_HEIGHT_px};
                    padding: 0px 35px;
                    border-bottom: 1px solid #ddd;

                    background-color: #fff;
                    color: #222;

                    position: fixed;
                    z-index: 1;
                    top: ${this.state.showNavigation ? '0px' : '-' + NAV_HEIGHT_px};
                    left: 0px;

                    transition: top 0.2s ease-in-out 0.2s;
                }

                nav a {
                    color: inherit;
                    text-decoration: none;
                }
            `}</style>
        </div>
    }
}
