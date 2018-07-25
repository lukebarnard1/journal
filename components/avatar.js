import React from 'react';
import PropTypes from 'prop-types';

function Avatar({ src, size }) {
    return (
        <div>
            <img className="avatar" alt="user avatar" src={src} />
            <style jsx>
                {`
                .avatar {
                    width: ${size}px;
                    height: ${size}px;
                    border: 1px solid rgba(0, 0, 0, 0.04);
                    background-color: #f0f0f0;
                    border-radius: 50%;

                    object-fit: cover;
                }
            `}
            </style>
        </div>
    );
}
Avatar.defaultProps = {
    size: 64,
};
Avatar.propTypes = {
    src: PropTypes.string.isRequired,
    size: PropTypes.number,
};
export default Avatar;
