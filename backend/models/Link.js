const mongoose = require('mongoose');

const LinkSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Link title is required'],
    trim: true,
  },
  url: {
    type: String,
    required: [true, 'Link URL is required'],
    trim: true,
  },
  iconType: {
    type: String,
    enum: ['globe', 'github', 'twitter', 'instagram', 'linkedin', 'youtube', 'facebook', 'tiktok', 'other'],
    default: 'globe',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Link', LinkSchema);
