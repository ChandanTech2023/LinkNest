require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Link = require('../models/Link');
const Click = require('../models/Click');

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for Seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Link.deleteMany({});
    await Click.deleteMany({});
    console.log('Cleared existing collections (User, Link, Click)');

    // Create 3 Demo Users
    const users = [
      {
        username: 'johndoe',
        email: 'demo1@linknest.com',
        password: 'password123', // Will be hashed automatically by User pre-save hook
        profile: {
          name: 'John Doe',
          bio: 'Full Stack Software Engineer & Tech Blogger. Building LinkNest!',
          photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200&h=200',
          theme: 'dark'
        }
      },
      {
        username: 'janesmith',
        email: 'demo2@linknest.com',
        password: 'password123',
        profile: {
          name: 'Jane Smith',
          bio: 'Digital Creator, Designer, and Photographer. Sharing my visual journey.',
          photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200',
          theme: 'gradient'
        }
      },
      {
        username: 'neon_rider',
        email: 'demo3@linknest.com',
        password: 'password123',
        profile: {
          name: 'Neon Rider',
          bio: 'Synthwave producer & nocturnal coder. Ride the retro wave.',
          photoUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200&h=200',
          theme: 'neon'
        }
      }
    ];

    const createdUsers = [];
    for (const u of users) {
      const user = new User(u);
      await user.save();
      createdUsers.push(user);
    }
    console.log('Seeded 3 Demo Users');

    // Create links for each user
    const linksData = [
      // John Doe (johndoe) Links
      {
        userId: createdUsers[0]._id,
        links: [
          { title: 'Personal Portfolio', url: 'https://johndoe.dev', iconType: 'globe', order: 0, isActive: true },
          { title: 'GitHub Profile', url: 'https://github.com/johndoe', iconType: 'github', order: 1, isActive: true },
          { title: 'Twitter / X', url: 'https://x.com/johndoe', iconType: 'twitter', order: 2, isActive: true },
          { title: 'LinkedIn Career', url: 'https://linkedin.com/in/johndoe', iconType: 'linkedin', order: 3, isActive: true },
          { title: 'Draft Link (Hidden)', url: 'https://johndoe.dev/draft', iconType: 'other', order: 4, isActive: false }
        ]
      },
      // Jane Smith (janesmith) Links
      {
        userId: createdUsers[1]._id,
        links: [
          { title: 'Instagram Portfolio', url: 'https://instagram.com/janesmith', iconType: 'instagram', order: 0, isActive: true },
          { title: 'Behance Design Projects', url: 'https://behance.net/janesmith', iconType: 'globe', order: 1, isActive: true },
          { title: 'YouTube Channel', url: 'https://youtube.com/c/janesmith', iconType: 'youtube', order: 2, isActive: true },
          { title: 'Facebook Page', url: 'https://facebook.com/janesmith', iconType: 'facebook', order: 3, isActive: true }
        ]
      },
      // Neon Rider (neon_rider) Links
      {
        userId: createdUsers[2]._id,
        links: [
          { title: 'Spotify Music', url: 'https://spotify.com/artist/neonrider', iconType: 'globe', order: 0, isActive: true },
          { title: 'TikTok Retro Beats', url: 'https://tiktok.com/@neonrider', iconType: 'tiktok', order: 1, isActive: true },
          { title: 'Twitter Musings', url: 'https://x.com/neonrider', iconType: 'twitter', order: 2, isActive: true }
        ]
      }
    ];

    const allCreatedLinks = [];
    for (const group of linksData) {
      for (const l of group.links) {
        const link = new Link({ ...l, userId: group.userId });
        await link.save();
        allCreatedLinks.push(link);
      }
    }
    console.log('Seeded links for all demo accounts');

    // Create 7-day click history for analytics visualization
    const now = new Date();
    const clickEvents = [];

    // Helper to generate dates spanning the last 7 days
    const getDateNDaysAgo = (n) => {
      const d = new Date(now);
      d.setDate(now.getDate() - n);
      d.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);
      return d;
    };

    allCreatedLinks.forEach(link => {
      if (!link.isActive) return; // Skip inactive links

      let baseClicksPerDay;
      if (link.iconType === 'github' || link.iconType === 'instagram' || link.iconType === 'globe') {
        baseClicksPerDay = 5;
      } else {
        baseClicksPerDay = 2;
      }

      for (let day = 0; day < 7; day++) {
        const dailyClicks = baseClicksPerDay + Math.floor(Math.random() * 4) - 1; // Random variation
        const clickDate = getDateNDaysAgo(day);

        for (let c = 0; c < dailyClicks; c++) {
          clickEvents.push({
            linkId: link._id,
            userId: link.userId,
            timestamp: clickDate
          });
        }
      }
    });

    if (clickEvents.length > 0) {
      await Click.insertMany(clickEvents);
    }
    console.log(`Seeded ${clickEvents.length} click events over the last 7 days.`);

    console.log('Data Seeding Completed Successfully!');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error during data seeding:', err.message);
    if (mongoose.connection) {
      mongoose.connection.close();
    }
    process.exit(1);
  }
};

seedData();
