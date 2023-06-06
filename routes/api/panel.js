const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const Panel = require('../../models/Panel');
const User = require('../../models/User');
const checkObjectId = require('../../middleware/checkObjectId');

// @route    POST api/panels
// @desc     Create a panel
// @access   Private
router.post(
  '/',
  auth,
  check('tile', 'Title is required').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');

      const newPanel = new Panel({
        owner: req.user.id,
        title: req.body.title,
        url: req.body.url,
        api_url: req.body.api_url,
        api_key: req.body.api_key
      });

      const panel = await newPanel.save();

      res.json(panel);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    GET api/panles
// @desc     Get all panles
// @access   Private
router.get('/', async (req, res) => {
  try {
    const panles = await Panel.find().sort({ level: 1, date: -1 });
    res.json(panles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/panels/:id
// @desc     Get panel by ID
// @access   Private
router.get('/:id', auth, checkObjectId('id'), async (req, res) => {
  try {
    const panel = await Panel.findById(req.params.id);

    if (!panel) {
      return res.status(404).json({ msg: 'Panel not found' });
    }

    res.json(panel);
  } catch (err) {
    console.error(err.message);

    res.status(500).send('Server Error');
  }
});

// @route    DELETE api/panels/:id
// @desc     Delete a panel
// @access   Private
router.delete('/:id', [auth, checkObjectId('id')], async (req, res) => {
  try {
    const panel = await Panel.findById(req.params.id);

    if (!panel) {
      return res.status(404).json({ msg: 'Panel not found' });
    }

    // Check user
    if (panel.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await panel.remove();

    res.json({ msg: 'Panel removed' });
  } catch (err) {
    console.error(err.message);

    res.status(500).send('Server Error');
  }
});

// @route    PUT api/panels/like/:id
// @desc     Like a panel
// @access   Private
router.put('/like/:id', auth, checkObjectId('id'), async (req, res) => {
  try {
    const panel = await Panel.findById(req.params.id);

    // Check if the panel has already been liked
    if (panel.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: 'Panel already liked' });
    }

    panel.likes.unshift({ user: req.user.id });

    await panel.save();

    return res.json(panel.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/panels/unlike/:id
// @desc     Unlike a panel
// @access   Private
router.put('/unlike/:id', auth, checkObjectId('id'), async (req, res) => {
  try {
    const panel = await Panel.findById(req.params.id);

    // Check if the panel has not yet been liked
    if (!panel.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: 'Panel has not yet been liked' });
    }

    // remove the like
    panel.likes = panel.likes.filter(
      ({ user }) => user.toString() !== req.user.id
    );

    await panel.save();

    return res.json(panel.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/panels/comment/:id
// @desc     Comment on a panel
// @access   Private
router.post(
  '/comment/:id',
  auth,
  checkObjectId('id'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Panel.findById(req.params.id);

      const newComment = {
        name: user.name,
        text: req.body.text,
        user: req.user.id
      };

      post.comments.unshift(newComment);

      await post.save();

      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);


module.exports = router;
