const mongoose = require('mongoose');

const energyRecordSchema = new mongoose.Schema(
  {
    month: {
      type: String,
      required: [true, 'Month is required'],
      trim: true,
    },
    previous_reading: {
      type: Number,
      required: [true, 'Previous meter reading is required'],
      min: [0, 'Previous reading cannot be negative'],
    },
    current_reading: {
      type: Number,
      required: [true, 'Current meter reading is required'],
      min: [0, 'Current reading cannot be negative'],
    },
    units_consumed: {
      type: Number,
      required: [true, 'Units consumed is required'],
      min: [0, 'Units consumed cannot be negative'],
    },
    rate_per_unit: {
      type: Number,
      required: [true, 'Rate per unit is required'],
      min: [0, 'Rate per unit cannot be negative'],
    },
    total_bill: {
      type: Number,
      required: [true, 'Total bill is required'],
      min: [0, 'Total bill cannot be negative'],
    },
    payment_status: {
      type: String,
      enum: {
        values: ['Paid', 'Unpaid'],
        message: 'Payment status must be either Paid or Unpaid',
      },
      default: 'Unpaid',
      trim: true,
    },
    due_date: {
      type: Date,
      required: [true, 'Due date is required'],
    },
  },
  {
    collection: 'energy_records',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const EnergyRecord = mongoose.model('EnergyRecord', energyRecordSchema);

module.exports = EnergyRecord;
