const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Link = require('../models/Link');
const auth = require('../middleware/auth');

// @route   GET /api/profile/:username
// @desc    Get user public profile (no login required)
// @access  Public
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Get only active links, sorted by order ascending
    const links = await Link.find({ userId: user._id, isActive: true }).sort({ order: 1 });

    res.json({
      user: {
        username: user.username,
        profile: user.profile,
      },
      links,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/profile
// @desc    Update current user's profile details
// @access  Private
router.put('/', auth, async (req, res) => {
  const { name, bio, photoUrl, theme } = req.body;

  try {
    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update profile fields
    if (name !== undefined) user.profile.name = name;
    if (bio !== undefined) user.profile.bio = bio;
    if (photoUrl !== undefined) user.profile.photoUrl = photoUrl;
    if (theme !== undefined) user.profile.theme = theme;

    await user.save();

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      profile: user.profile,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
