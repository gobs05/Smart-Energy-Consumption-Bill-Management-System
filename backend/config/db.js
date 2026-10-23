const mongoose = require('mongoose');

const connectDB = async () => {
  const onlineUri = process.env.MONGODB_URI;
  const localUri = 'mongodb://127.0.0.1:27017/energy_db';

  // 1. Try connecting to the primary online database (MongoDB Atlas)
  if (onlineUri) {
    try {
      console.log('🔄 Connecting to MongoDB Atlas...');
      const conn = await mongoose.connect(onlineUri, {
        dbName: 'energy_db',
        serverSelectionTimeoutMS: 4000, // Timeout quickly if Atlas IP is not whitelisted
      });
      console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);

      // Ensure the energy_records collection exists
      const EnergyRecord = require('../models/EnergyRecord');
      await EnergyRecord.createCollection();
      console.log(`✅ Collection 'energy_records' ready in database '${conn.connection.name}'`);
      return true;
    } catch (error) {
      console.error(`❌ MongoDB Atlas Connection Failed: ${error.message}`);
      console.log('🔄 Falling back to local MongoDB at localhost:27017...');
    }
  }

  // 2. Fallback to local MongoDB instance
  try {
    const localConn = await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`✅ Connected to Local MongoDB: ${localConn.connection.host}:${localConn.connection.port}`);

    // Ensure the energy_records collection exists
    const EnergyRecord = require('../models/EnergyRecord');
    await EnergyRecord.createCollection();
    console.log(`✅ Collection 'energy_records' ready in local database '${localConn.connection.name}'`);
    return true;
  } catch (localError) {
    console.error(`❌ Local MongoDB Connection Failed: ${localError.message}`);
    console.error(`💡 Tip: Make sure MongoDB is running locally (mongod) or whitelist your IP in MongoDB Atlas.`);
    return false;
  }
};

module.exports = connectDB;

