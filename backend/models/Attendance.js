const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  checkinStatus: {
    type: Boolean,
    default: false,
  },
  checkinTime: {
    type: Date,
  },
  checkedInBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  certificateIssued: {
    type: Boolean,
    default: false,
  },
  certificateIssuedAt: {
    type: Date,
  },
}, { timestamps: true });

AttendanceSchema.index({ user: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
