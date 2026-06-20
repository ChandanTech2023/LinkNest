const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Link = require('../models/Link');
const Click = require('../models/Click');
const mongoose = require('mongoose');

// @route   GET /api/links/analytics
// @desc    Get user links click analytics
// @access  Private
// NOTE: We place this BEFORE the GET /:id or PUT /:id routes so Express matches it first.
router.get('/analytics', auth, async (req, res) => {
  try {
    // 1. Get all links of the user
    const links = await Link.find({ userId: req.user.id });
    const linkIds = links.map(l => l._id);

    // 2. Count total clicks per link
    const totalClicksAggregation = await Click.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: '$linkId', count: { $sum: 1 } } }
    ]);

    // Map counts to link ID
    const totalClicksMap = {};
    totalClicksAggregation.forEach(item => {
      totalClicksMap[item._id.toString()] = item.count;
    });

    const linkStats = links.map(l => ({
      id: l._id,
      title: l.title,
      url: l.url,
      isActive: l.isActive,
      clicks: totalClicksMap[l._id.toString()] || 0
    }));

    // 3. Get daily clicks over the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyClicksAggregation = await Click.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.id),
          timestamp: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format as 7-day array
    const dailyStats = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(sevenDaysAgo.getDate() + i);
      const dateString = d.toISOString().split('T')[0];
      const match = dailyClicksAggregation.find(item => item._id === dateString);
      dailyStats.push({
        date: dateString,
        clicks: match ? match.count : 0
      });
    }

    res.json({
      linkStats,
      dailyStats
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/links
// @desc    Get user's links
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const links = await Link.find({ userId: req.user.id }).sort({ order: 1 });
    res.json(links);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/links
// @desc    Create a new link
// @access  Private
router.post('/', auth, async (req, res) => {
  const { title, url, iconType } = req.body;

  if (!title || !url) {
    return res.status(400).json({ message: 'Title and URL are required' });
  }

  try {
    // Find highest order to place new link at the bottom
    const lastLink = await Link.findOne({ userId: req.user.id }).sort({ order: -1 });
    const order = lastLink ? lastLink.order + 1 : 0;

    const newLink = new Link({
      userId: req.user.id,
      title,
      url,
      iconType: iconType || 'globe',
      order,
    });

    const link = await newLink.save();
    res.status(201).json(link);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/links
// @desc    Bulk update link ordering
// @access  Private
router.put('/', auth, async (req, res) => {
  const { links } = req.body; // Expects an array of links: [{ id, order }, ...]

  if (!links || !Array.isArray(links)) {
    return res.status(400).json({ message: 'Invalid payload' });
  }

  try {
    const bulkOps = links.map((l) => ({
      updateOne: {
        filter: { _id: l.id, userId: req.user.id },
        update: { $set: { order: l.order } },
      },
    }));

    if (bulkOps.length > 0) {
      await Link.bulkWrite(bulkOps);
    }

    const updatedLinks = await Link.find({ userId: req.user.id }).sort({ order: 1 });
    res.json(updatedLinks);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/links/:id
// @desc    Update single link details
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { title, url, iconType, isActive } = req.body;

  try {
    let link = await Link.findOne({ _id: req.params.id, userId: req.user.id });
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    if (title !== undefined) link.title = title;
    if (url !== undefined) link.url = url;
    if (iconType !== undefined) link.iconType = iconType;
    if (isActive !== undefined) link.isActive = isActive;

    await link.save();
    res.json(link);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/links/:id
// @desc    Delete a link
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const link = await Link.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    // Delete associated clicks
    await Click.deleteMany({ linkId: req.params.id });

    res.json({ message: 'Link deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/links/:id/click
// @desc    Record click on link (Public)
// @access  Public
router.post('/:id/click', async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    const click = new Click({
      linkId: link._id,
      userId: link.userId,
    });

    await click.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
