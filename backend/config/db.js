const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'energy_db',
      serverSelectionTimeoutMS: 5000, // Timeout after 5s if Atlas is unreachable
    });
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);

    // Ensure the energy_records collection exists in MongoDB
    const EnergyRecord = require('../models/EnergyRecord');
    await EnergyRecord.createCollection();
    console.log(`✅ Collection 'energy_records' ready in database '${conn.connection.name}'`);

    return true;
  } catch (error) {
    console.error(`❌ MongoDB Atlas Connection Error: ${error.message}`);
    console.error(`💡 Note: If you see a connection error, please ensure your IP address is whitelisted in MongoDB Atlas Network Access (e.g. 0.0.0.0/0 or your current IP).`);
    return false;
  }
};

module.exports = connectDB;

