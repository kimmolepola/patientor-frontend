//export const apiBaseUrl = 'http://localhost:3001/api';
const BASE_URL = `${process.env.REACT_APP_BACKEND ? process.env.REACT_APP_BACKEND : "undefined"}/api`;
export const apiBaseUrl = BASE_URL;
