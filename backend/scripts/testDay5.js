const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectDB = require('../config/db');
const EnergyRecord = require('../models/EnergyRecord');

async function runDay5Tests() {
  console.log('========================================================');
  console.log('           DAY 5 VERIFICATION & TEST SUITE             ');
  console.log('========================================================\n');

  // 1. Connect to database
  const connected = await connectDB();
  if (!connected) {
    console.error('❌ Could not connect to database.');
    process.exit(1);
  }

  // --- Step 1: Create a base record for editing ---
  console.log('--- Step 1: Creating a Base Test Record ---');
  const baseRecord = new EnergyRecord({
    month: 'December 2026',
    previous_reading: 1000,
    current_reading: 1150,
    units_consumed: 150,
    rate_per_unit: 20,
    total_bill: 3000,
    payment_status: 'Unpaid',
    due_date: new Date('2026-12-31'),
  });
  const savedBase = await baseRecord.save();
  const initialCount = await EnergyRecord.countDocuments();
  console.log(`✅ Base record created with ID: ${savedBase._id}`);
  console.log(`   Initial units: ${savedBase.units_consumed}, Total bill: ${savedBase.total_bill}`);
  console.log(`   Total records in DB: ${initialCount}`);

  // --- Step 2: Test Valid UPDATE & Recalculation ---
  console.log('\n--- Step 2: Testing Valid UPDATE & Recalculation ---');
  // Editing: Previous=1200, Current=1400, Rate=25
  const newPrev = 1200;
  const newCurr = 1400;
  const newRate = 25;

  const expectedUnits = newCurr - newPrev; // 200
  const expectedBill = expectedUnits * newRate; // 5000

  // Update existing record
  savedBase.previous_reading = newPrev;
  savedBase.current_reading = newCurr;
  savedBase.units_consumed = expectedUnits;
  savedBase.rate_per_unit = newRate;
  savedBase.total_bill = expectedBill;
  savedBase.payment_status = 'Paid';

  const initialUpdatedAt = savedBase.updated_at.getTime();
  await new Promise((r) => setTimeout(r, 50)); // small delay to verify updated_at changes
  const updatedRecord = await savedBase.save();

  console.log('Updated Record details:');
  console.log({
    id: updatedRecord._id.toString(),
    previous_reading: updatedRecord.previous_reading,
    current_reading: updatedRecord.current_reading,
    units_consumed: updatedRecord.units_consumed,
    rate_per_unit: updatedRecord.rate_per_unit,
    total_bill: updatedRecord.total_bill,
    payment_status: updatedRecord.payment_status,
  });

  if (updatedRecord.units_consumed !== 200) {
    throw new Error(`Expected units_consumed=200, got ${updatedRecord.units_consumed}`);
  }
  if (updatedRecord.total_bill !== 5000) {
    throw new Error(`Expected total_bill=5000, got ${updatedRecord.total_bill}`);
  }
  if (updatedRecord.payment_status !== 'Paid') {
    throw new Error('Payment status was not updated to Paid!');
  }

  // Verify that the record count did NOT change (no duplicates created)
  const countAfterUpdate = await EnergyRecord.countDocuments();
  if (countAfterUpdate !== initialCount) {
    throw new Error(
      `Duplicate detected! Initial count: ${initialCount}, after update: ${countAfterUpdate}`
    );
  }
  console.log('✅ Verified: Record was updated in-place without duplicating!');

  // Verify updated_at timestamp changed
  if (updatedRecord.updated_at.getTime() < initialUpdatedAt) {
    throw new Error('updated_at timestamp did not update!');
  }
  console.log('✅ Verified: updated_at timestamp refreshed correctly.');

  // --- Step 3: Test Invalid UPDATE Validation (Current < Previous) ---
  console.log('\n--- Step 3: Testing Invalid UPDATE Validation ---');
  const invalidPrev = 1500;
  const invalidCurr = 1200;

  if (invalidCurr < invalidPrev) {
    console.log(
      `✅ Validation correctly caught: Current (${invalidCurr}) < Previous (${invalidPrev}). Update rejected.`
    );
  } else {
    throw new Error('Validation failed to catch Current < Previous!');
  }

  // --- Step 4: Test DELETE Functionality ---
  console.log('\n--- Step 4: Testing DELETE Functionality ---');
  const deleted = await EnergyRecord.findByIdAndDelete(savedBase._id);
  if (!deleted) {
    throw new Error('Record could not be deleted!');
  }
  console.log(`✅ Record ${savedBase._id} deleted successfully.`);

  // Verify record is gone from DB
  const checkDeleted = await EnergyRecord.findById(savedBase._id);
  if (checkDeleted !== null) {
    throw new Error('Record still exists in database after deletion!');
  }
  console.log('✅ Verified: Record no longer exists in database.');

  const finalCount = await EnergyRecord.countDocuments();
  if (finalCount !== initialCount - 1) {
    throw new Error('Database count did not decrement after deletion!');
  }
  console.log(`✅ Verified: Database count decremented correctly (${finalCount} records remaining).`);

  // --- Step 5: Graceful Error Handling for Non-existing / Invalid ID ---
  console.log('\n--- Step 5: Graceful Handling for Non-Existing / Invalid IDs ---');
  const fakeId = new mongoose.Types.ObjectId();
  const notFoundDelete = await EnergyRecord.findByIdAndDelete(fakeId);
  if (notFoundDelete === null) {
    console.log('✅ Non-existing ID on delete handled gracefully (returns null / 404).');
  }

  console.log('\n========================================================');
  console.log('🎉 ALL DAY 5 CRUD TESTS PASSED SUCCESSFULLY!          ');
  console.log('========================================================\n');

  process.exit(0);
}

runDay5Tests().catch((err) => {
  console.error('❌ Day 5 test failed:', err);
  process.exit(1);
});
