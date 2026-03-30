const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'waitlisted', 'cancelled'],
    default: 'confirmed', // If payment required, controller sets this to pending
  },
  qrCode: {
    type: String,
    default: '',
  },
  customAnswers: [
    {
      fieldLabel: { type: String, required: true },
      answer: { type: String, required: true },
    }
  ],
  paymentScreenshot: {
    type: String,
    default: '',
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Prevent duplicate registrations
RegistrationSchema.index({ user: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Registration', RegistrationSchema);
