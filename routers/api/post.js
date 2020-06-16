const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const Post = require('../../models/Post');
const User = require('../../models/User');

// @route   POST api/post
// @desc    Create a post
// @access  Private

router.post(
	'/',
	[
		auth,
		[
			check('text', 'Text is required')
				.not()
				.isEmpty()
		]
	],
	async (req, res) => {
		const error = validationResult(req);
		if (!error.isEmpty()) {
			return res.status(400).json({ errors: error.array() });
		}

		try {
			const user = await User.findById(req.user.id).select('-password');

			const newPost = new Post({
				text: req.body.text,
				name: user.name,
				avatar: user.avatar,
				user: req.user.id
			});

			const post = await newPost.save();
			res.json(post);
		} catch (error) {
			console.error(error.message);
			res.status(500).send('Server Error!');
		}
	}
);

// @route   GET api/post
// @desc    Get all posts
// @access  Private

router.get('/', auth, async (req, res) => {
	try {
		const posts = await Post.find().sort({ date: -1 });
		res.json(posts);
	} catch (error) {
		console.error(error.message);
		res.status(500).send('Server Error!');
	}
});

// @route   GET api/post/:id
// @desc    Get post by id
// @access  Private

router.get('/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		if (!post) {
			console.log('Post Not Found');
			return res.status(404).json({ msg: 'Post Not Found' });
		}

		res.json(post);
	} catch (error) {
		console.error(error.message);
		if (error.kind === 'ObjectId') {
			console.log('Post Not Found');
			return res.status(404).json({ msg: 'Post Not Found' });
		}
		res.status(500).send('Server Error!');
	}
});

// @route   DELETE api/post/:id
// @desc    Get post by id
// @access  Private

router.delete('/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		if (!post) {
			console.log('Post Not Found');
			return res.status(404).json({ msg: 'Post Not Found' });
		}

		if (post.user.toString() !== req.user.id) {
			return res.status(401).json({ msg: 'User not authorized' });
		}

		await post.remove();
		console.log('Post removed');
		res.json({ msg: 'Post removed' });
	} catch (error) {
		console.error(error.message);
		if (error.kind === 'ObjectId') {
			console.log('Post Not Found');
			return res.status(404).json({ msg: 'Post Not Found' });
		}
		res.status(500).send('Server Error!');
	}
});

// @route   Put api/post/like/:id
// @desc    Like a post
// @access  Private
router.put('/like/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		const isLiked =
			post.likes.filter((like) => like.user.toString() === req.user.id).length >
			0;

		if (isLiked) {
			console.log('Post already liked');
			return res.json({ msg: 'Post already liked' });
		}

		post.likes.unshift({ user: req.user.id });
		await post.save();
		console.log('Post Liked.');
		res.json(post);
	} catch (error) {
		console.error(error.message);
		res.status(500).send('Server Error!');
	}
});

// @route   Put api/post/unlike/:id
// @desc    Delete Like from post
// @access  Private
router.put('/unlike/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		const isLiked =
			post.likes.filter((like) => like.user.toString() === req.user.id)
				.length === 0;

		if (isLiked) {
			console.log('Post has not been liked');
			return res.json({ msg: 'Post has not been liked' });
		}

		//Remove a like or index
		const removeIndex = post.likes
			.map((like) => like.user.toString())
			.indexOf(req.user.id);

		post.likes.splice(removeIndex, 1);

		await post.save();
		console.log('Post Unliked.');
		res.json(post);
	} catch (error) {
		console.error(error.message);
		res.status(500).send('Server Error!');
	}
});

// @route    POST api/posts/comment/:id
// @desc     Comment on a post
// @access   Private
router.post(
	'/comment/:id',
	[
		auth,
		[
			check('text', 'Text is required')
				.not()
				.isEmpty()
		]
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			const user = await User.findById(req.user.id).select('-password');
			const post = await Post.findById(req.params.id);

			const newComment = {
				text: req.body.text,
				name: user.name,
				avatar: user.avatar,
				user: req.user.id
			};

			post.comments.unshift(newComment);

			await post.save();

			res.json(post);
		} catch (error) {
			console.error(error.message);
			res.status(500).send('Server Error!');
		}
	}
);

// @route    DELETE api/posts/comment/:id/:comment_id
// @desc     Delete comment
// @access   Private

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		// PUll out comment
		const comment = post.comments.find(
			(comment) => comment.id === req.params.comment_id
		);

		if (!comment) {
			return res.status(404).json({ msg: 'Comment does not exist' });
		}

		if (comment.user.toString() !== req.user.id) {
			return res.status(401).json({ msg: 'User not authorized' });
		}

		const removeIndex = post.comments
			.map((comment) => comment.user.toString())
			.indexOf(req.user.id);

		post.comments.splice(removeIndex, 1);

		await post.save();
		console.log('Comment deleted');
		res.json(post);
	} catch (error) {
		console.error(error.message);
		res.status(500).send('Server Error!');
	}
});

module.exports = router;
