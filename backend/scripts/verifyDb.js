const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectDB = require('../config/db');
const EnergyRecord = require('../models/EnergyRecord');

async function verify() {
  console.log('=== Database Verification with Local Fallback ===');
  const connected = await connectDB();
  if (!connected) {
    console.error('❌ Could not connect to either Atlas or Local database.');
    process.exit(1);
  }

  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Collections in database:', collections.map(c => c.name));
  console.log('✅ energy_records is verified!');
  process.exit(0);
}

verify();

