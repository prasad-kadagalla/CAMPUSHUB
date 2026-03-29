const Registration = require('../models/Registration');
const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const { sendRegistrationEmail } = require('../utils/mailer');

// @desc  Register for an event
// @route POST /api/registrations/:eventId
exports.registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId).populate('registrationCount');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Event is not open for registration' });
    }
    if (new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({ success: false, message: 'Registration deadline has passed' });
    }
    const count = await Registration.countDocuments({ event: event._id, status: 'confirmed' });
    if (count >= event.participantLimit) {
      return res.status(400).json({ success: false, message: 'Event is full' });
    }
    const exists = await Registration.findOne({ user: req.user._id, event: event._id });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Already registered for this event' });
    }
    const qrData = JSON.stringify({ userId: req.user._id, eventId: event._id, token: uuidv4() });
    const qrCode = await QRCode.toDataURL(qrData);
    const registration = await Registration.create({
      user: req.user._id,
      event: event._id,
      status: 'confirmed',
      qrCode,
    });
    // Pre-create attendance record
    await Attendance.create({ user: req.user._id, event: event._id, checkinStatus: false });
    try { await sendRegistrationEmail(req.user, event, qrCode); } catch (e) { /* email optional */ }
    res.status(201).json({ success: true, message: 'Successfully registered!', registration });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Already registered for this event' });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Cancel a registration
// @route DELETE /api/registrations/:eventId
exports.cancelRegistration = async (req, res) => {
  try {
    const reg = await Registration.findOneAndUpdate(
      { user: req.user._id, event: req.params.eventId },
      { status: 'cancelled' },
      { new: true }
    );
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found' });
    res.json({ success: true, message: 'Registration cancelled' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get current user's registrations
// @route GET /api/registrations/me
exports.getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user._id, status: 'confirmed' })
      .populate({ path: 'event', populate: { path: 'organizer', select: 'name' } })
      .sort({ registeredAt: -1 });
    res.json({ success: true, registrations });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get participants of an event (organizer/admin)
// @route GET /api/registrations/event/:eventId
exports.getEventParticipants = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const participants = await Registration.find({ event: req.params.eventId, status: 'confirmed' })
      .populate('user', 'name email rollNumber department');
    const attendanceMap = {};
    const attendance = await Attendance.find({ event: req.params.eventId });
    attendance.forEach(a => { attendanceMap[a.user.toString()] = a.checkinStatus; });
    const result = participants.map(p => ({
      ...p.toJSON(),
      checkinStatus: attendanceMap[p.user._id.toString()] || false,
    }));
    res.json({ success: true, participants: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
