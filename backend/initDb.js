const mongoose = require('mongoose');
const connectDB = require('./db');
const Block = require('./models/Block');
require('dotenv').config();

async function init() {
  try {
    await connectDB();

    const count = await Block.countDocuments();

    if (count === 0) {
      console.log('Seeding 20x20 grid in MongoDB...');
      const blocks = [];
      for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 20; x++) {
          blocks.push({ x, y });
        }
      }
      
      await Block.insertMany(blocks);
      console.log('Grid seeded successfully.');
    } else {
      console.log('Grid already seeded.');
    }

  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    mongoose.connection.close();
  }
}

init();
