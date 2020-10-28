//export const apiBaseUrl = 'http://localhost:3001/api';
const BASE_URL = `${process.env.REACT_APP_BACKEND}/api`; //eslint-disable-line
//export const apiBaseUrl = BASE_URL;
console.log("baseurl-----", BASE_URL);
export const apiBaseUrl = BASE_URL;
