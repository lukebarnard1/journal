import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';

import fonts from '../style/fonts';
import * as mw from './ho/mediaWrapper';
import Avatar from './avatar';

import config from '../config';

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

function IndexHeader({ category, categories, media }) {
    const { isSmall } = media;
    const categoriesNav = categories.map(
        ({ id, name }) => <CategoryLink id={id} selected={id === category} name={name} />,
    );

    // XXX: The parent of this should be positioned sticky
    return (
        <div className="floater">
            <div className="profile">
                <div className="clickable">
                    <Link prefetch href="/">
                        <a href="/">
                            <Avatar src={config.authorImg} size={isSmall ? 64 : 128} />
                        </a>
                    </Link>
                </div>
                <div className="name">
                    <h1>
                        {config.authorName}
                    </h1>
                    <span>
                        {config.authorTagline}
                    </span>
                </div>
            </div>
            <div className="filter">
                { categoriesNav }
            </div>
            <style jsx>
                {`
                    .floater {
                        width: ${isSmall ? 'initial' : '220px'};
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
                        margin-bottom: 5px;
                    }

                    span {
                        font-family: ${fonts.body};
                    }

                    .filter {
                        box-shadow: ${isSmall ? '' : '0px 0px 15px -3px #ccc'};

                        min-width: 200px;
                        margin-top: 15px;

                        display: ${isSmall ? 'flex' : 'block'};
                    }
                `}
            </style>
        </div>
    );
}
IndexHeader.propTypes = {
    category: PropTypes.string,
    media: PropTypes.shape(mw.propTypes.media).isRequired,
};

export default mw.mediaWrapper(IndexHeader);
