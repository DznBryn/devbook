// This file will be a function that takes in a token, if token is this the local storage add it to headers if not delete it from headers

import axios from 'axios';

const setAuthToken = (token) => {
	if (token) {
		axios.defaults.headers.common['x-auth-token'] = token;
	} else {
		delete axios.defaults.headers.common['x-auth-token'];
	}
};

export default setAuthToken;
