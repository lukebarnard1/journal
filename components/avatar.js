import React from 'react';
import PropTypes from 'prop-types';

class Avatar extends React.Component {
    constructor() {
        super();

        this.onError = () => {
            this.setState({ error: true });
        };
        this.state = { error: false };
    }

    render() {
        const { alt, size, ...props } = this.props;
        const { error } = this.state;
        return (
            <div>
                <img alt={alt} onError={this.onError} {...props} />
                <style jsx>
                    {`
                    img {
                        display: ${error || !props.src ? 'none' : 'auto'};
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
}
Avatar.defaultProps = {
    alt: '',
    size: 64,
};
Avatar.propTypes = {
    alt: PropTypes.string,
    size: PropTypes.number,
};
export default Avatar;
