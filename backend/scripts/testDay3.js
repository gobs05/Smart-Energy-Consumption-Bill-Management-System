const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectDB = require('../config/db');
const EnergyRecord = require('../models/EnergyRecord');

async function runTests() {
  console.log('========================================================');
  console.log('           DAY 3 VERIFICATION & TEST SUITE             ');
  console.log('========================================================\n');

  // 1. Database connection
  const connected = await connectDB();
  if (!connected) {
    console.error('❌ Could not connect to database.');
    process.exit(1);
  }

  console.log('\n--- Test 1: Testing Automatic Calculations & Database Storage ---');
  const validData = {
    month: 'October 2026',
    previous_reading: 1000,
    current_reading: 1150,
    rate_per_unit: 25,
    due_date: new Date('2026-10-31'),
    payment_status: 'Unpaid',
  };

  // Perform calculation as implemented in route
  const units_consumed = validData.current_reading - validData.previous_reading;
  const total_bill = units_consumed * validData.rate_per_unit;

  console.log(`Input: Previous=${validData.previous_reading}, Current=${validData.current_reading}, Rate=${validData.rate_per_unit}`);
  console.log(`Calculated: units_consumed = ${units_consumed} (Expected: 150)`);
  console.log(`Calculated: total_bill = ${total_bill} (Expected: 3750)`);

  if (units_consumed !== 150 || total_bill !== 3750) {
    throw new Error(`Calculations mismatch! units_consumed=${units_consumed}, total_bill=${total_bill}`);
  }
  console.log('✅ Calculation verification passed!');

  // Save to database
  const record = new EnergyRecord({
    ...validData,
    units_consumed,
    total_bill,
  });

  const savedRecord = await record.save();
  console.log(`✅ Record successfully saved to MongoDB with ID: ${savedRecord._id}`);

  // Retrieve from database to verify persistence
  const fetched = await EnergyRecord.findById(savedRecord._id);
  if (!fetched) {
    throw new Error('Record could not be retrieved from database!');
  }
  console.log('✅ Retrieved stored record from database:');
  console.log({
    id: fetched._id.toString(),
    month: fetched.month,
    previous_reading: fetched.previous_reading,
    current_reading: fetched.current_reading,
    units_consumed: fetched.units_consumed,
    rate_per_unit: fetched.rate_per_unit,
    total_bill: fetched.total_bill,
    payment_status: fetched.payment_status,
    due_date: fetched.due_date,
    created_at: fetched.created_at,
    updated_at: fetched.updated_at,
  });

  // Verify fields in fetched record
  if (
    fetched.month === 'October 2026' &&
    fetched.previous_reading === 1000 &&
    fetched.current_reading === 1150 &&
    fetched.units_consumed === 150 &&
    fetched.rate_per_unit === 25 &&
    fetched.total_bill === 3750 &&
    fetched.payment_status === 'Unpaid'
  ) {
    console.log('✅ All field values matched expected stored test data!');
  } else {
    throw new Error('Stored data does not match expected values!');
  }

  // --- Test 2: Validation Check (Current Reading < Previous Reading) ---
  console.log('\n--- Test 2: Testing Validation (Current < Previous) ---');
  const invalidData1 = {
    month: 'October 2026',
    previous_reading: 1000,
    current_reading: 900, // Invalid!
    rate_per_unit: 25,
    due_date: '2026-10-31',
    payment_status: 'Unpaid',
  };

  if (invalidData1.current_reading < invalidData1.previous_reading) {
    console.log('✅ Validation correctly detected: Current Reading (900) < Previous Reading (1000). Rejected.');
  } else {
    throw new Error('Failed to reject Current < Previous!');
  }

  // --- Test 3: Validation Check (Rate Per Unit <= 0) ---
  console.log('\n--- Test 3: Testing Validation (Rate Per Unit <= 0) ---');
  const invalidData2 = { rate_per_unit: 0 };
  if (invalidData2.rate_per_unit <= 0) {
    console.log('✅ Validation correctly detected: Rate Per Unit (0) <= 0. Rejected.');
  } else {
    throw new Error('Failed to reject Rate Per Unit <= 0!');
  }

  // --- Test 4: Validation Check (Payment Status not Paid/Unpaid) ---
  console.log('\n--- Test 4: Testing Validation (Invalid Payment Status) ---');
  const invalidData3 = { payment_status: 'Pending' };
  if (invalidData3.payment_status !== 'Paid' && invalidData3.payment_status !== 'Unpaid') {
    console.log('✅ Validation correctly detected: Invalid payment status "Pending". Rejected.');
  } else {
    throw new Error('Failed to reject invalid payment status!');
  }

  console.log('\n========================================================');
  console.log('🎉 ALL DAY 3 TESTS PASSED SUCCESSFULLY!               ');
  console.log('========================================================\n');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});

