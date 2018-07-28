import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';

import fonts from '../style/fonts';
import * as mw from './ho/mediaWrapper';
import Avatar from './avatar';

function CategoryLink({ id, name, selected }) {
    return (
        <Link href={`/?category=${id}`} as={id} key={id}>
            <div className={selected ? 'selected' : ''}>
                { `// ${name}` }
                <style jsx>
                    {`
                        div {
                            border-bottom: 1px solid #eee;
                            padding: 10px 12px;
                            font-family: ${fonts.ui};
                            font-size: 10pt;
                            color: #444;
                            cursor: pointer;
                        }

                        div.selected {
                            background-color: #444;
                            color: #eee;
                        }
                    `}
                </style>
            </div>
        </Link>
    );
}
CategoryLink.propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    selected: PropTypes.bool.isRequired,
};

function IndexHeader({ category, media }) {
    const { isSmall } = media;
    const categories = [
        { id: 'architecture', name: 'architecture' },
        { id: 'mental-health', name: 'mental health' },
        { id: 'politics', name: 'politics' },
    ].map(
        ({ id, name }) => <CategoryLink id={id} selected={id === category} name={name} />,
    );

    // XXX: The parent of this should be positioned sticky
    return (
        <div className="floater">
            <div className="profile">
                <div className="clickable">
                    <Link prefetch href="/">
                        <a href="/">
                            <Avatar src="/static/avatar.png" size={isSmall ? 64 : 128} />
                        </a>
                    </Link>
                </div>
                <div className="name">
                    <h1>
                        Duncan Idaho
                    </h1>
                    <span>
                        building a better world
                    </span>
                </div>
            </div>
            <div className="filter">
                { categories }
            </div>
            <style jsx>
                {`
                    .floater {
                        min-width: 220px;
                        position: ${isSmall ? 'initial' : 'sticky'};
                        top: 50px;
                        padding: 20px;
                    }

                    .profile {
                        display: ${isSmall ? 'flex' : 'block'};
                        align-items: center;
                    }

                    .clickable {
                        cursor: pointer;
                    }

                    .name {
                        margin: ${isSmall ? '20px' : '10px'};
                    }

                    h1 {
                        font-family: ${fonts.header};
                        font-size: 20pt;
                        margin: 0px;
                    }

                    span {
                        font-family: ${fonts.body};
                    }

                    .filter {
                        box-shadow: ${isSmall ? '' : '0px 0px 10px 2px #ccc'};

                        min-width: 200px;

                        display: ${isSmall ? 'flex' : 'block'};
                    }
                `}
            </style>
        </div>
    );
}
IndexHeader.propTypes = {
    category: PropTypes.string.isRequired,
    media: PropTypes.shape(mw.propTypes.media).isRequired,
};

export default mw.mediaWrapper(IndexHeader);
