import React from 'react';
import PropTypes from 'prop-types';
import fonts from '../style/fonts';

export default function Button(props) {
    const { children } = props; // eslint-disable-line react/prop-types
    const { onClick } = props;
    return (
        <button onClick={onClick} type="button">
            { children }
            <style jsx>
                {`
                    button {
                        border: 1px solid #ddd;
                        border-radius: 4px;

                        background-color: #fff;

                        padding: 10px;
                        margin: 10px 0px;

                        cursor: pointer;
                        font-family: ${fonts.ui};
                    }

                    button:active {
                        color: #fff;
                        background-color: #222;
                    }
                    button:focus {
                        border: 1px solid #444;
                        outline: 0px;
                    }
                `}
            </style>
        </button>
    );
}
Button.defaultProps = {
    onClick: null,
};
Button.propTypes = {
    onClick: PropTypes.func,
};
