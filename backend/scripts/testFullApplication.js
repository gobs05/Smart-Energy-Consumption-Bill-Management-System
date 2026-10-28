const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const express = require('express');
const http = require('http');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectDB = require('../config/db');
const EnergyRecord = require('../models/EnergyRecord');
const recordsRouter = require('../routes/records');

// Helper to make local HTTP requests to test Express routes
function makeRequest(server, options, postData) {
  return new Promise((resolve, reject) => {
    const address = server.address();
    const reqOptions = {
      hostname: '127.0.0.1',
      port: address.port,
      path: options.path,
      method: options.method,
      headers: options.headers || {},
    };

    if (postData) {
      reqOptions.headers['Content-Type'] = 'application/json';
      reqOptions.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runCompleteApplicationTest() {
  console.log('================================================================');
  console.log('       COMPLETE APPLICATION END-TO-END VERIFICATION TEST        ');
  console.log('================================================================\n');

  // Connect to database
  const connected = await connectDB();
  if (!connected) {
    console.error('❌ Database connection failed.');
    process.exit(1);
  }

  // Setup test Express app with the actual records route
  const app = express();
  app.use(express.json());
  app.use('/api/records', recordsRouter);

  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });

  try {
    // Clean test records
    await EnergyRecord.deleteMany({
      month: { $in: ['October 2026', 'November 2026', 'December 2026'] },
    });

    // -------------------------------------------------------------
    // TEST A — CREATE
    // -------------------------------------------------------------
    console.log('--- TEST A: CREATE RECORD ---');
    const createData = JSON.stringify({
      month: 'October 2026',
      previous_reading: 1000,
      current_reading: 1150,
      rate_per_unit: 25,
      due_date: '2026-10-31',
      payment_status: 'Unpaid',
    });

    const createRes = await makeRequest(server, { path: '/api/records', method: 'POST' }, createData);
    console.log('Create Response Status:', createRes.status);
    console.log('Create Message:', createRes.body.message);

    if (createRes.status !== 201) {
      throw new Error(`Failed to create record. Status: ${createRes.status}`);
    }

    const createdRecord = createRes.body.data;
    console.log(`Units Consumed: ${createdRecord.units_consumed} (Expected: 150)`);
    console.log(`Total Bill: ${createdRecord.total_bill} (Expected: 3750)`);

    if (createdRecord.units_consumed !== 150 || createdRecord.total_bill !== 3750) {
      throw new Error('Automatic calculations failed on creation!');
    }
    console.log('✅ TEST A PASSED: Record created and stored with correct calculations.\n');

    // -------------------------------------------------------------
    // TEST B — READ
    // -------------------------------------------------------------
    console.log('--- TEST B: READ ALL & VIEW INDIVIDUAL RECORD ---');
    const listRes = await makeRequest(server, { path: '/api/records', method: 'GET' });
    if (listRes.status !== 200 || !Array.isArray(listRes.body.data)) {
      throw new Error('Failed to list records!');
    }
    console.log(`Retrieved ${listRes.body.data.length} records.`);

    // View specific record
    const viewRes = await makeRequest(server, { path: `/api/records/${createdRecord._id}`, method: 'GET' });
    if (viewRes.status !== 200 || viewRes.body.data.month !== 'October 2026') {
      throw new Error('Failed to view individual record!');
    }
    console.log(`Viewed record: ${viewRes.body.data.month}, ID: ${viewRes.body.data._id}`);
    console.log('✅ TEST B PASSED: List and View record work correctly.\n');

    // -------------------------------------------------------------
    // TEST C — SEARCH
    // -------------------------------------------------------------
    console.log('--- TEST C: SEARCH BY MONTH ---');
    const searchMatch = await makeRequest(server, { path: '/api/records?search=October', method: 'GET' });
    console.log(`Search 'October' returned ${searchMatch.body.data.length} match(es).`);
    if (searchMatch.body.data.length === 0) {
      throw new Error('Search failed to find existing October record!');
    }

    const searchNoMatch = await makeRequest(server, { path: '/api/records?search=NonExistingMonth2099', method: 'GET' });
    console.log(`Search 'NonExistingMonth2099' returned ${searchNoMatch.body.data.length} match(es).`);
    if (searchNoMatch.body.data.length !== 0) {
      throw new Error('Search returned results for non-existing query!');
    }
    console.log('✅ TEST C PASSED: Search by month works correctly.\n');

    // -------------------------------------------------------------
    // TEST D — FILTER
    // -------------------------------------------------------------
    console.log('--- TEST D: FILTER BY PAYMENT STATUS ---');
    const filterUnpaid = await makeRequest(server, { path: '/api/records?status=Unpaid', method: 'GET' });
    console.log(`Filter 'Unpaid' returned ${filterUnpaid.body.data.length} record(s).`);
    if (!filterUnpaid.body.data.some((r) => r._id === createdRecord._id)) {
      throw new Error('Unpaid filter failed to include unpaid test record!');
    }

    const filterPaid = await makeRequest(server, { path: '/api/records?status=Paid', method: 'GET' });
    console.log(`Filter 'Paid' returned ${filterPaid.body.data.length} record(s).`);
    if (filterPaid.body.data.some((r) => r._id === createdRecord._id)) {
      throw new Error('Paid filter included an unpaid record!');
    }
    console.log('✅ TEST D PASSED: Payment status filtering works correctly.\n');

    // -------------------------------------------------------------
    // TEST E — SORT
    // -------------------------------------------------------------
    console.log('--- TEST E: SORTING ---');
    // Add second record to test relative sorting
    await makeRequest(
      server,
      { path: '/api/records', method: 'POST' },
      JSON.stringify({
        month: 'November 2026',
        previous_reading: 1150,
        current_reading: 1250,
        rate_per_unit: 20,
        due_date: '2026-11-30',
        payment_status: 'Paid',
      })
    );

    const sortBillAsc = await makeRequest(server, { path: '/api/records?sortBy=total_bill&order=asc', method: 'GET' });
    const billsAsc = sortBillAsc.body.data.map((r) => r.total_bill);
    console.log('Bills sorted ASC:', billsAsc);
    for (let i = 0; i < billsAsc.length - 1; i++) {
      if (billsAsc[i] > billsAsc[i + 1]) throw new Error('Bills not sorted ASC!');
    }

    const sortBillDesc = await makeRequest(server, { path: '/api/records?sortBy=total_bill&order=desc', method: 'GET' });
    const billsDesc = sortBillDesc.body.data.map((r) => r.total_bill);
    console.log('Bills sorted DESC:', billsDesc);
    for (let i = 0; i < billsDesc.length - 1; i++) {
      if (billsDesc[i] < billsDesc[i + 1]) throw new Error('Bills not sorted DESC!');
    }
    console.log('✅ TEST E PASSED: Sorting by field and order works correctly.\n');

    // -------------------------------------------------------------
    // TEST F — UPDATE & RECALCULATION
    // -------------------------------------------------------------
    console.log('--- TEST F: UPDATE & RECALCULATION ---');
    const countBeforeUpdate = await EnergyRecord.countDocuments();
    const updateData = JSON.stringify({
      month: 'October 2026',
      previous_reading: 1000,
      current_reading: 1200, // Updated from 1150 to 1200
      rate_per_unit: 25,
      due_date: '2026-10-31',
      payment_status: 'Paid', // Updated from Unpaid to Paid
    });

    const updateRes = await makeRequest(
      server,
      { path: `/api/records/${createdRecord._id}`, method: 'PUT' },
      updateData
    );

    if (updateRes.status !== 200) {
      throw new Error(`Failed to update record. Status: ${updateRes.status}`);
    }

    const updated = updateRes.body.data;
    console.log(`Updated Units: ${updated.units_consumed} (Expected: 200)`);
    console.log(`Updated Total Bill: ${updated.total_bill} (Expected: 5000)`);
    console.log(`Updated Status: ${updated.payment_status} (Expected: Paid)`);

    if (updated.units_consumed !== 200 || updated.total_bill !== 5000 || updated.payment_status !== 'Paid') {
      throw new Error('Update calculation or field persistence failed!');
    }

    const countAfterUpdate = await EnergyRecord.countDocuments();
    if (countAfterUpdate !== countBeforeUpdate) {
      throw new Error('Update created a duplicate record instead of updating in-place!');
    }
    console.log('✅ TEST F PASSED: In-place update and recalculations verified (no duplicates).\n');

    // -------------------------------------------------------------
    // TEST G — INVALID UPDATE REJECTION
    // -------------------------------------------------------------
    console.log('--- TEST G: INVALID UPDATE REJECTION ---');
    const invalidUpdate = JSON.stringify({
      month: 'October 2026',
      previous_reading: 1500,
      current_reading: 1200, // Invalid! curr < prev
      rate_per_unit: 25,
      due_date: '2026-10-31',
      payment_status: 'Paid',
    });

    const invalidRes = await makeRequest(
      server,
      { path: `/api/records/${createdRecord._id}`, method: 'PUT' },
      invalidUpdate
    );

    console.log('Invalid update status code:', invalidRes.status);
    console.log('Invalid update error message:', invalidRes.body.message);

    if (invalidRes.status !== 400 || !invalidRes.body.message.includes('lower than previous reading')) {
      throw new Error('Failed to reject invalid update with appropriate error message!');
    }
    console.log('✅ TEST G PASSED: Invalid update properly rejected.\n');

    // -------------------------------------------------------------
    // TEST H — DASHBOARD SUMMARY
    // -------------------------------------------------------------
    console.log('--- TEST H: DASHBOARD SUMMARY ---');
    const summaryRes = await makeRequest(server, { path: '/api/records/summary', method: 'GET' });
    if (summaryRes.status !== 200) {
      throw new Error('Failed to fetch dashboard summary!');
    }

    const summary = summaryRes.body.data;
    console.log('Dashboard summary data:');
    console.log(`  Total Usage: ${summary.totalUsage} kWh`);
    console.log(`  Latest Bill: Rs. ${summary.latestBill}`);
    console.log(`  Unpaid Bills Count: ${summary.unpaidBills}`);
    console.log(`  Recent Records Count: ${summary.recentRecords.length}`);

    if (summary.totalUsage <= 0 || summary.recentRecords.length === 0) {
      throw new Error('Dashboard summary returned empty or invalid statistics!');
    }
    console.log('✅ TEST H PASSED: Dashboard calculates real metrics from database.\n');

    // -------------------------------------------------------------
    // TEST I — DELETE
    // -------------------------------------------------------------
    console.log('--- TEST I: DELETE RECORD ---');
    const deleteRes = await makeRequest(
      server,
      { path: `/api/records/${createdRecord._id}`, method: 'DELETE' }
    );

    if (deleteRes.status !== 200) {
      throw new Error(`Failed to delete record. Status: ${deleteRes.status}`);
    }
    console.log('Delete message:', deleteRes.body.message);

    const checkDeleted = await EnergyRecord.findById(createdRecord._id);
    if (checkDeleted !== null) {
      throw new Error('Deleted record still exists in MongoDB!');
    }
    console.log('✅ TEST I PASSED: Record removed from database successfully.\n');

    // -------------------------------------------------------------
    // TEST J — ERROR HANDLING (NON-EXISTING / INVALID ID)
    // -------------------------------------------------------------
    console.log('--- TEST J: ERROR HANDLING FOR INVALID IDS ---');
    const fakeId = new mongoose.Types.ObjectId();
    const notFoundGet = await makeRequest(server, { path: `/api/records/${fakeId}`, method: 'GET' });
    console.log('GET non-existing ID status:', notFoundGet.status);
    if (notFoundGet.status !== 404) throw new Error('Expected 404 for non-existing ID!');

    const invalidFormatGet = await makeRequest(server, { path: '/api/records/invalid-id-xyz', method: 'GET' });
    console.log('GET malformed ID status:', invalidFormatGet.status);
    if (invalidFormatGet.status !== 404) throw new Error('Expected 404 for malformed ID!');

    const notFoundDelete = await makeRequest(server, { path: `/api/records/${fakeId}`, method: 'DELETE' });
    console.log('DELETE non-existing ID status:', notFoundDelete.status);
    if (notFoundDelete.status !== 404) throw new Error('Expected 404 for non-existing delete!');
    console.log('✅ TEST J PASSED: Graceful error handling for invalid/non-existing IDs verified.\n');

    console.log('================================================================');
    console.log('🎉 ALL APPLICATION WORKFLOW TESTS (A-J) PASSED 100% SUCCESSFULLY!');
    console.log('================================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

runCompleteApplicationTest();

