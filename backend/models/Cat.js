const mongoose = require('mongoose');

const catSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Cat name is required'],
    trim: true,
  },
  age: {
    type: String,
    required: [true, 'Age is required'],
  },
  breed: {
    type: String,
    trim: true,
    default: '',
  },
  weight: {
    type: Number,
    default: null,
  },
  healthConditions: {
    type: String,
    default: '',
  },
  allergies: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: '#8B5CF6',
  },
}, { timestamps: true });

module.exports = mongoose.model('Cat', catSchema);
