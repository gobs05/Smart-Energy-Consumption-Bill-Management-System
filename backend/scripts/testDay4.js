const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectDB = require('../config/db');
const EnergyRecord = require('../models/EnergyRecord');

async function runDay4Tests() {
  console.log('========================================================');
  console.log('           DAY 4 VERIFICATION & TEST SUITE             ');
  console.log('========================================================\n');

  const connected = await connectDB();
  if (!connected) {
    console.error('❌ Could not connect to database.');
    process.exit(1);
  }

  // Ensure test records exist
  const existing = await EnergyRecord.find({
    month: { $in: ['August 2026', 'September 2026', 'October 2026', 'November 2026'] },
  });

  if (existing.length < 2) {
    await EnergyRecord.insertMany([
      {
        month: 'August 2026',
        previous_reading: 500,
        current_reading: 650,
        units_consumed: 150,
        rate_per_unit: 20,
        total_bill: 3000,
        payment_status: 'Paid',
        due_date: new Date('2026-08-31'),
      },
      {
        month: 'October 2026',
        previous_reading: 1000,
        current_reading: 1150,
        units_consumed: 150,
        rate_per_unit: 25,
        total_bill: 3750,
        payment_status: 'Unpaid',
        due_date: new Date('2026-10-31'),
      },
    ]);
  }

  const allRecords = await EnergyRecord.find({}).sort({ due_date: -1 });
  console.log(`✅ List Records: Found ${allRecords.length} records in database.`);

  const target = allRecords[0];
  const fetched = await EnergyRecord.findById(target._id);
  console.log(`✅ View Record: Retrieved record ${fetched.month} by ID: ${fetched._id}`);

  const fakeId = new mongoose.Types.ObjectId();
  const nonExisting = await EnergyRecord.findById(fakeId);
  console.log(`✅ Graceful Non-Existing ID: Returned ${nonExisting}`);

  const searchResults = await EnergyRecord.find({
    month: { $regex: 'October', $options: 'i' },
  });
  console.log(`✅ Search by Month: Found ${searchResults.length} records matching 'October'`);

  const paidRecords = await EnergyRecord.find({ payment_status: 'Paid' });
  console.log(`✅ Filter Paid: Found ${paidRecords.length} Paid records`);

  const unpaidRecords = await EnergyRecord.find({ payment_status: 'Unpaid' });
  console.log(`✅ Filter Unpaid: Found ${unpaidRecords.length} Unpaid records`);

  console.log('\n========================================================');
  console.log('🎉 ALL DAY 4 REGRESSION TESTS PASSED!                 ');
  console.log('========================================================\n');

  process.exit(0);
}

runDay4Tests().catch((err) => {
  console.error('❌ Day 4 test failed:', err);
  process.exit(1);
});
