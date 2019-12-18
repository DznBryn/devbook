const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = (req, res, next) => {
	// Gets token from header of the HTML
	const token = req.header('x-auth-token');

	// Check if not token
	if (!token) {
		return res
			.status(401)
			.json({ msg: 'Token not found, authorization denied' });
	}

	// If Token then Verify
	try {
		const decoded = jwt.verify(token, config.get('jwt_sercet'));
		req.user = decoded.user;
		next();
	} catch (error) {
		res.status(401).json({ msg: 'Token is not valid' });
	}
};
