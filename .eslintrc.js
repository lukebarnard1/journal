module.exports = {
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        }
    },
    "extends": [
        "airbnb",
    ],
    "plugins": [
        "mocha"
    ],

    "rules": {
        "indent": ["error", 4],
        "react/jsx-indent-props": ["error", 4],
        "mocha/valid-suite-description": [2, "^[A-Z]*"],
        "react/jsx-wrap-multilines": [0],
        "react/jsx-indent": ["error", 4],
        "react/jsx-filename-extension": [0]
    }
};
