const express = require('express');
const request = require('request');
const config = require('config');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const normalize = require('normalize-url');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   GET api/profile/me
// @desc    Get current users profile
// @access  Private

router.get('/me', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({
			user: req.user.id,
		}).populate('user', ['name', 'avatar']);

		if (!profile) {
			console.log('There is no profile for this user');
			return res.status(400).json({ msg: 'There is no profile for this user' });
		}

		console.log("Displaying user's profile...");
		res.json(profile);
	} catch (error) {
		console.error(error.message);
		res.status(500).send('Server Error!');
	}
});

// @route   POST api/profile
// @desc    Create or update user profile
// @access  Private
router.post(
	'/',
	[
		auth,
		[
			check('status', 'Status required').not().isEmpty(),
			check('skills', 'Skills required').not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const {
			company,
			website,
			location,
			bio,
			status,
			github,
			skills,
			youtube,
			twitch,
			twitter,
			facebook,
			linkedin,
			instagram,
		} = req.body;

		// Build profile object
		const profileFields = {
			user: req.user.id,
			company,
			location,
			website:
				website && website !== ''
					? normalize(website, { forceHttps: true })
					: '',
			bio,
			skills: Array.isArray(skills)
				? skills
				: skills.split(',').map((skill) => ' ' + skill.trim()),
			status,
			github,
		};

		const social = { youtube, twitch, twitter, facebook, linkedin, instagram };

		for (const [key, value] of Object.entries(social)) {
			if (value && value.length > 0) {
				social[key] = normalize(value, { forceHttps: true });
			}
		}

		profileFields.social = social;
		// Update user profile
		try {
			let profile = await Profile.findOneAndUpdate(
				{ user: req.user.id },
				{ $set: profileFields },
				{ new: true, upsert: true, setDefaultsOnInsert: true }
			);

			console.log('User Profile updated.');
			res.json(profile);
		} catch (error) {
			console.error(error.message);
			res.status(500).send('Server Error!');
		}

		// // Create user profile
		// profile = new Profile(profileFields);

		// await profile.save();
		// console.log('User Profile created.');
		// res.json(profile);
	}
);

// @route   GET api/profile/
// @desc    Get all users profile
// @access  Public

router.get('/', async (req, res) => {
	try {
		console.log('Display all user profiles...');
		const profiles = await Profile.find().populate('user', ['name', 'avatar']);
		res.json(profiles);
	} catch (error) {
		console.error(error.message);
		res.status(500).send('Server Error!');
	}
});

// @route   GET api/profile/user/:id
// @desc    Get users profile by id
// @access  Public

router.get('/user/:id', async (req, res) => {
	try {
		console.log('Display user profile by ID...');
		const profile = await Profile.findOne({
			user: req.params.id,
		}).populate('user', ['name', 'avatar']);

		if (!profile) {
			console.log('Profile not found.');
			return res.status(400).json({ msg: 'Profile not found.' });
		}
		res.json(profile);
	} catch (error) {
		console.error(error.message);
		if (error.kind === 'ObjectId') {
			console.log('Profile not found.');
			return res.status(400).json({ msg: 'Profile not found.' });
		}
		res.status(500).send('Server Error!');
	}
});

// @route   DELETE api/profile
// @desc    DELETE user profile
// @access  Private

router.delete('/', auth, async (req, res) => {
	try {
		console.log('Removing user profile...');
		await Profile.findOneAndRemove({ user: req.user.id });
		await User.findOneAndRemove({ _id: req.user.id });
		console.log('User Deleted.');
		res.json({ msg: 'User Deleted.' });
	} catch (error) {
		console.error(error.message);
		res.status(500).send('Server Error!');
	}
});

// @route   PUT api/profile/experience
// @desc    Adding user profile experience
// @access  Private

router.put(
	'/experience',
	[
		auth,
		[
			check('title', 'Title is required').not().isEmpty(),
			check('company', 'Company is required').not().isEmpty(),
			check('from', 'From date is required').not().isEmpty(),
		],
	],
	async (req, res) => {
		const error = validationResult(req);
		if (!error.isEmpty()) {
			return res.status(400).json({ errors: error.array() });
		}

		const {
			title,
			company,
			location,
			from,
			to,
			current,
			description,
		} = req.body;

		const newExperience = {
			title,
			company,
			location,
			from,
			to,
			current,
			description,
		};

		try {
			const profile = await Profile.findOne({ user: req.user.id });
			profile.experience.unshift(newExperience);

			await profile.save();
			console.log(`user profile experience has been updated`);
			res.json(profile);
		} catch (error) {
			console.error(error.message);
			res.status(500).send('Server Error!');
		}
	}
);

// @route   DELETE api/profile/experience/:exp_id
// @desc    DELETE user profile experience
// @access  Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
	try {
		console.log('Removing user experience...');
		const profile = await Profile.findOne({ user: req.user.id });

		const removeIndex = profile.experience
			.map((item) => item.id)
			.indexOf(req.params.exp_id);

		profile.experience.splice(removeIndex, 1);

		await profile.save();

		console.log('User Experience Deleted.');
		res.json(profile);
	} catch (error) {
		console.error(error.message);
		res.status(500).send('Server Error!');
	}
});

// @route   PUT api/profile/education
// @desc    Adding user profile education
// @access  Private

router.put(
	'/education',
	[
		auth,
		[
			check('school', 'School is required').not().isEmpty(),
			check('degree', 'Degree is required').not().isEmpty(),
			check('fieldOfStudy', 'Field Of Study is required').not().isEmpty(),
			check('from', 'From date is required').not().isEmpty(),
		],
	],
	async (req, res) => {
		const error = validationResult(req);
		if (!error.isEmpty()) {
			return res.status(400).json({ errors: error.array() });
		}

		const {
			school,
			degree,
			fieldOfStudy,
			from,
			to,
			current,
			description,
		} = req.body;

		const newEducation = {
			school,
			degree,
			fieldOfStudy,
			from,
			to,
			current,
			description,
		};

		try {
			const profile = await Profile.findOne({ user: req.user.id });
			profile.education.unshift(newEducation);

			await profile.save();
			console.log(`user profile education has been updated`);
			res.json(profile);
		} catch (error) {
			console.error(error.message);
			res.status(500).send('Server Error!');
		}
	}
);

// @route   DELETE api/profile/education/:edu_id
// @desc    DELETE user profile education
// @access  Private

router.delete('/education/:edu_id', auth, async (req, res) => {
	try {
		console.log('Removing user education...');
		const profile = await Profile.findOne({ user: req.user.id });

		const removeIndex = profile.education
			.map((item) => item.id)
			.indexOf(req.params.edu_id);

		profile.education.splice(removeIndex, 1);

		await profile.save();

		console.log('User education Deleted.');
		res.json(profile);
	} catch (error) {
		console.error(error.message);
		res.status(500).send('Server Error!');
	}
});

// @route   GET api/profile/github:/:username
// @desc    Get user repos from Github
// @access  Public
router.get('/github/:username', (req, res) => {
	try {
		const option = {
			uri: `https://api.github.com/users/${
				req.params.username
			}/repos?per_page=5:asc&client_id=${config.get('githubSercet')}&client_secret=${config.get('githubClientId')}`,
			method: 'GET',
			headers: { 'user-agent': 'node.js' },
		};

		request(option, (error, response, body) => {
			if (error) console.error(error);

			if (response.statusCode !== 200) {
				return res.status(400).json({ msg: 'Github Profile Not Found' });
			}

			res.json(JSON.parse(body));
		});
	} catch (error) {
		console.error(error.message);
		res.status(500).send('Server Error!');
	}
});

module.exports = router;
