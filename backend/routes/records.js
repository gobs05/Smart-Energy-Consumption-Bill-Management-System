const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const EnergyRecord = require('../models/EnergyRecord');

// Shared validation function for Create (Day 3) and Update (Day 5)
function validateRecordInput(body) {
  const {
    month,
    previous_reading,
    current_reading,
    rate_per_unit,
    due_date,
    payment_status,
  } = body;

  // 1. Required fields validation
  if (!month || typeof month !== 'string' || month.trim() === '') {
    return { valid: false, message: 'Month is required.' };
  }
  if (previous_reading === undefined || previous_reading === null || previous_reading === '') {
    return { valid: false, message: 'Previous reading is required.' };
  }
  if (current_reading === undefined || current_reading === null || current_reading === '') {
    return { valid: false, message: 'Current reading is required.' };
  }
  if (rate_per_unit === undefined || rate_per_unit === null || rate_per_unit === '') {
    return { valid: false, message: 'Rate per unit is required.' };
  }
  if (!due_date || due_date === '') {
    return { valid: false, message: 'Due date is required.' };
  }
  if (!payment_status || payment_status === '') {
    return { valid: false, message: 'Payment status is required.' };
  }

  // 2. Numerical validation
  const prev = Number(previous_reading);
  const curr = Number(current_reading);
  const rate = Number(rate_per_unit);

  if (isNaN(prev) || isNaN(curr) || isNaN(rate)) {
    return {
      valid: false,
      message: 'Readings and rate per unit must be valid numbers.',
    };
  }

  if (prev < 0) {
    return { valid: false, message: 'Previous reading cannot be negative.' };
  }

  if (curr < 0) {
    return { valid: false, message: 'Current reading cannot be negative.' };
  }

  if (curr < prev) {
    return {
      valid: false,
      message: 'Current reading must be greater than or equal to previous reading.',
    };
  }

  if (rate <= 0) {
    return { valid: false, message: 'Rate per unit must be greater than 0.' };
  }

  if (payment_status !== 'Paid' && payment_status !== 'Unpaid') {
    return { valid: false, message: 'Payment status must only be Paid or Unpaid.' };
  }

  // 3. Automatic calculations
  const units_consumed = curr - prev;
  const total_bill = units_consumed * rate;

  return {
    valid: true,
    data: {
      month: month.trim(),
      previous_reading: prev,
      current_reading: curr,
      units_consumed,
      rate_per_unit: rate,
      total_bill,
      payment_status,
      due_date: new Date(due_date),
    },
  };
}

// GET /api/records - Retrieve all energy records with optional search, filter & sort (Day 4)
router.get('/', async (req, res) => {
  try {
    const { search, status, sortBy, order } = req.query;
    const filter = {};

    // 1. Search by Month
    if (search && search.trim() !== '') {
      filter.month = { $regex: search.trim(), $options: 'i' };
    }

    // 2. Filter by Payment Status (Paid / Unpaid)
    if (status && status !== 'All') {
      filter.payment_status = status;
    }

    // 3. Sort configuration
    const sort = {};
    const sortDirection = order === 'asc' ? 1 : -1;

    if (sortBy === 'month') {
      sort.month = sortDirection;
    } else if (sortBy === 'total_bill') {
      sort.total_bill = sortDirection;
    } else if (sortBy === 'due_date') {
      sort.due_date = sortDirection;
    } else {
      sort.due_date = -1; // Default to latest due date
    }

    const records = await EnergyRecord.find(filter).sort(sort);

    return res.json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    console.error('Error fetching records:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching energy records.',
    });
  }
});

// GET /api/records/:id - Retrieve a single energy record by database ID (Day 4)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Gracefully handle invalid MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Invalid record ID format. Record not found.',
      });
    }

    const record = await EnergyRecord.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Energy record not found.',
      });
    }

    return res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error('Error fetching record by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching the energy record.',
    });
  }
});

// POST /api/records - Create a new energy record (Day 3)
router.post('/', async (req, res) => {
  try {
    const validation = validateRecordInput(req.body);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    const record = new EnergyRecord(validation.data);
    const savedRecord = await record.save();

    return res.status(201).json({
      success: true,
      message: 'Energy record saved successfully!',
      data: savedRecord,
    });
  } catch (error) {
    console.error('Error saving energy record:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while saving energy record.',
    });
  }
});

// PUT /api/records/:id - Update an existing energy record (Day 5)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Gracefully handle invalid MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Invalid record ID format. Record not found.',
      });
    }

    const existingRecord = await EnergyRecord.findById(id);

    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        message: 'Energy record not found.',
      });
    }

    // Reuse validation logic
    const validation = validateRecordInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    // Update the existing record fields with recalculated values
    existingRecord.month = validation.data.month;
    existingRecord.previous_reading = validation.data.previous_reading;
    existingRecord.current_reading = validation.data.current_reading;
    existingRecord.units_consumed = validation.data.units_consumed;
    existingRecord.rate_per_unit = validation.data.rate_per_unit;
    existingRecord.total_bill = validation.data.total_bill;
    existingRecord.payment_status = validation.data.payment_status;
    existingRecord.due_date = validation.data.due_date;

    const updatedRecord = await existingRecord.save();

    return res.json({
      success: true,
      message: 'Energy record updated successfully!',
      data: updatedRecord,
    });
  } catch (error) {
    console.error('Error updating energy record:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while updating energy record.',
    });
  }
});

// DELETE /api/records/:id - Delete an existing energy record (Day 5)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Gracefully handle invalid MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Invalid record ID format. Record not found.',
      });
    }

    const deletedRecord = await EnergyRecord.findByIdAndDelete(id);

    if (!deletedRecord) {
      return res.status(404).json({
        success: false,
        message: 'Energy record not found.',
      });
    }

    return res.json({
      success: true,
      message: 'Energy record deleted successfully.',
      data: deletedRecord,
    });
  } catch (error) {
    console.error('Error deleting energy record:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while deleting energy record.',
    });
  }
});

module.exports = router;

