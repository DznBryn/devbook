const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../../models/User');

// @route   post api/users
// @desc    Reqister User
// @access  Public
router.post(
	'/',
	[
		check('name', 'Name is required')
			.not()
			.isEmpty(),
		check('email', 'Please include a valid email').isEmail(),
		check(
			'password',
			'Please enter a password with 6 or more characters'
		).isLength({ min: 6 })
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { name, email, password } = req.body;

		try {
			// If user exist logic
			let user = await User.findOne({ email });

			if (user) {
				console.log('User exists');
				return res.status(400).json({
					errors: [
						{
							msg: 'User exists'
						}
					]
				});
			}

			// If user does not exist Create a User instance
			const avatar = gravatar.url(email, {
				s: '200',
				r: 'r',
				d: 'mm'
			});

			user = new User({
				name,
				email,
				avatar,
				password
			});

			// Hashing password with bcrypt
			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(password, salt);

			await user.save();
			console.log('User profile saved to database.');

			// Recieve a token key for User. This used to keep the User logged in and able to access prevetive pages
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
			console.log("User's auth-token created.");
			console.log(req.body);
		} catch (error) {
			console.log(error.message);
			res.status(500).send('Server Error');
		}
	}
);

module.exports = router;
