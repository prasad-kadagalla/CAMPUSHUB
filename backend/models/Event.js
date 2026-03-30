const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  category: {
    type: String,
    required: true,
    enum: ['technical', 'cultural', 'sports', 'workshop'],
  },
  date: {
    type: Date,
    required: [true, 'Event date is required'],
  },
  time: {
    type: String,
    required: [true, 'Event time is required'],
  },
  venue: {
    type: String,
    required: [true, 'Venue is required'],
    trim: true,
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  poster: {
    type: String,
    default: '',
  },
  participantLimit: {
    type: Number,
    required: [true, 'Participant limit is required'],
    min: [1, 'Limit must be at least 1'],
  },
  registrationDeadline: {
    type: Date,
    required: [true, 'Registration deadline is required'],
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending',
  },
  adminNote: {
    type: String,
    default: '',
  },
  customFields: [
    {
      label: { type: String, required: true },
      type: { type: String, enum: ['text', 'textarea', 'dropdown'], required: true },
      options: [{ type: String }], // Only for dropdowns
      required: { type: Boolean, default: false },
    }
  ],
  requiresPayment: {
    type: Boolean,
    default: false,
  },
  fee: {
    type: Number,
    default: 0,
  },
  paymentQr: {
    type: String, // URL to the uploaded QR image
    default: '',
  },
  tags: [{ type: String }],
  isFeatured: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Virtual: registration count
EventSchema.virtual('registrationCount', {
  ref: 'Registration',
  localField: '_id',
  foreignField: 'event',
  count: true,
});

EventSchema.set('toJSON', { virtuals: true });
EventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', EventSchema);
