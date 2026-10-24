const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const EnergyRecord = require('../models/EnergyRecord');

// GET /api/records - Retrieve all energy records with optional search, filter & sort
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

// GET /api/records/:id - Retrieve a single energy record by database ID
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
    const {
      month,
      previous_reading,
      current_reading,
      rate_per_unit,
      due_date,
      payment_status,
    } = req.body;

    // 1. Required fields validation
    if (!month || typeof month !== 'string' || month.trim() === '') {
      return res.status(400).json({ success: false, message: 'Month is required.' });
    }
    if (previous_reading === undefined || previous_reading === null || previous_reading === '') {
      return res.status(400).json({ success: false, message: 'Previous reading is required.' });
    }
    if (current_reading === undefined || current_reading === null || current_reading === '') {
      return res.status(400).json({ success: false, message: 'Current reading is required.' });
    }
    if (rate_per_unit === undefined || rate_per_unit === null || rate_per_unit === '') {
      return res.status(400).json({ success: false, message: 'Rate per unit is required.' });
    }
    if (!due_date || due_date === '') {
      return res.status(400).json({ success: false, message: 'Due date is required.' });
    }
    if (!payment_status || payment_status === '') {
      return res.status(400).json({ success: false, message: 'Payment status is required.' });
    }

    // 2. Numerical validation
    const prev = Number(previous_reading);
    const curr = Number(current_reading);
    const rate = Number(rate_per_unit);

    if (isNaN(prev) || isNaN(curr) || isNaN(rate)) {
      return res.status(400).json({
        success: false,
        message: 'Readings and rate per unit must be valid numbers.',
      });
    }

    if (prev < 0) {
      return res.status(400).json({
        success: false,
        message: 'Previous reading cannot be negative.',
      });
    }

    if (curr < 0) {
      return res.status(400).json({
        success: false,
        message: 'Current reading cannot be negative.',
      });
    }

    if (curr < prev) {
      return res.status(400).json({
        success: false,
        message: 'Current reading must be greater than or equal to previous reading.',
      });
    }

    if (rate <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Rate per unit must be greater than 0.',
      });
    }

    if (payment_status !== 'Paid' && payment_status !== 'Unpaid') {
      return res.status(400).json({
        success: false,
        message: 'Payment status must only be Paid or Unpaid.',
      });
    }

    // 3. Automatic calculations
    const units_consumed = curr - prev;
    const total_bill = units_consumed * rate;

    // 4. Save record to persistent database
    const record = new EnergyRecord({
      month: month.trim(),
      previous_reading: prev,
      current_reading: curr,
      units_consumed,
      rate_per_unit: rate,
      total_bill,
      payment_status,
      due_date: new Date(due_date),
    });

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

module.exports = router;

