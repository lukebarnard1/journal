import React from 'react';
import PropTypes from 'prop-types';
import MediaQuery from 'react-responsive';

export const DEVICE_SIZE = {
    SMALL: 0,
    MEDIUM: 1,
    LARGE: 2,
};

const devices = [
    // These should be mutally exclusive
    { size: DEVICE_SIZE.SMALL, width: {min: 0, max: 699} },
    { size: DEVICE_SIZE.MEDIUM, width: {min: 700, max: 1399} },
    { size: DEVICE_SIZE.LARGE, width: {min: 1400} },
];

export function mediaWrapper(WrappedComponent) {
    return (props) =>
        <div>
            { devices.map((device) =>
                <MediaQuery
                    key={device.size}
                    minWidth={device.width.min}
                    maxWidth={device.width.max}
                >
                    <WrappedComponent media={{
                        isSmall: device.size === DEVICE_SIZE.SMALL,
                        isMedium: device.size === DEVICE_SIZE.MEDIUM,
                        isLarge: device.size === DEVICE_SIZE.LARGE,
                        size: device.size,
                    }} {...props} />
                </MediaQuery>
            ) }
        </div>;
}
export const propTypes = {
    media: {
        size: PropTypes.number.isRequired,
        isSmall: PropTypes.bool.isRequired,
        isMedium: PropTypes.bool.isRequired,
        isLarge: PropTypes.bool.isRequired,
    },
}
