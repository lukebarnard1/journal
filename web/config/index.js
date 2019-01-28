
import defaultConfig from './config.default.json';
import setConfig from './config.json';

const config = setConfig
    ? Object.assign(defaultConfig, setConfig)
    : defaultConfig;

export default config;
