const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');

// @route   GET api/auth
// @desc    Retreive authenticated user through ( middleware/ auth.js )
// @access  Public

router.get('/', auth, async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select('-password');
		res.json(user);
	} catch (error) {
		console.error(error.message);
		res.status(500).send('Server Error!');
	}
});

// @route   POST api/auth
// @desc    Authenticate user & get token
// @access  Public

router.post(
	'/',
	[
		check('email', 'Please include a valid email').isEmail(),
		check('password', 'Password required').exists()
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { email, password } = req.body;

		try {
			// If user exist logic
			let user = await User.findOne({ email });

			if (!user) {
				console.log('Invalid Credentials');
				return res.status(400).json({
					errors: [
						{
							msg: 'Invalid Credentials'
						}
					]
				});
			}

			const isMatch = await bcrypt.compare(password, user.password);

			if (!isMatch) {
				console.log('Invalid Credentials');
				return res.status(400).json({
					errors: [
						{
							msg: 'Invalid Credentials'
						}
					]
				});
			}

			const payload = {
				user: {
					id: user.id
				}
			};

			jwt.sign(
				payload,
				config.get('jwt_sercet'),
				{ expiresIn: 3600000 },
				(error, token) => {
					if (error) throw error;
					res.json({ token });
				}
			);
			console.log('User Profile updated.');
			console.log(req.body);
		} catch (error) {
			console.log(error.message);
			res.status(500).send('Server Error');
		}
	}
);

module.exports = router;
