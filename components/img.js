import React from 'react';
import PropTypes from 'prop-types';

class Img extends React.Component {
    constructor() {
        super();

        this.onError = () => {
            this.setState({ error: true });
        };
        this.state = { error: false };
    }

    style() {
        const { error } = this.state;
        return {
            display: error ? 'none' : 'initial',
        };
    }

    render() {
        const { alt, ...props } = this.props;
        return (
            <img alt={alt} onError={this.onError} style={this.style()} {...props} />
        );
    }
}
Img.defaultProps = {
    alt: '',
};
Img.propTypes = {
    alt: PropTypes.string,
};
export default Img;
