import React from 'react';
import PropTypes from 'prop-types';

import * as mw from './ho/mediaWrapper';

function FoldingColumns({ children, media }) {
    const { isSmall } = media;
    return (
        <div className="root">
            { children }
            <style jsx>
                {`
                    .root {
                        display: flex;
                        flex-direction: ${isSmall ? 'column' : 'row'};
                    }
                `}
            </style>
        </div>
    );
}
FoldingColumns.propTypes = {
    children: PropTypes.node.isRequired,
    media: PropTypes.shape(mw.propTypes.media).isRequired,
};

export default mw.mediaWrapper(FoldingColumns);
