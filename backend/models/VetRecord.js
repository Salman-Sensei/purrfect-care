const mongoose = require('mongoose');

const vetRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  catId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cat',
    required: true,
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  type: {
    type: String,
    required: [true, 'Visit type is required'],
    enum: ['vaccination', 'checkup', 'dental', 'emergency', 'other'],
  },
  vetName: {
    type: String,
    default: '',
  },
  clinic: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
  nextVisitDate: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('VetRecord', vetRecordSchema);
