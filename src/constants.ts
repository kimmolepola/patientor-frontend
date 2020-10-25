require('dotenv').config();

//export const apiBaseUrl = 'http://localhost:3001/api';
const { BASE_URL } = process.env;
export const apiBaseUrl = BASE_URL;
