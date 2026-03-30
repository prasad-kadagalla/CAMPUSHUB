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
    const { answers } = req.body;
    const parsedAnswers = answers ? JSON.parse(answers) : [];
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
    if (event.requiresPayment && !req.file) {
      return res.status(400).json({ success: false, message: 'Payment screenshot is required' });
    }
    
    if (event.customFields && event.customFields.length > 0) {
      const requiredFields = event.customFields.filter(f => f.required).map(f => f.label);
      const answeredFields = parsedAnswers.map(a => a.fieldLabel);
      const missing = requiredFields.filter(f => !answeredFields.includes(f));
      if (missing.length > 0) {
        return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(', ')}` });
      }
    }

    const qrData = JSON.stringify({ userId: req.user._id, eventId: event._id, token: uuidv4() });
    const qrCode = await QRCode.toDataURL(qrData);

    const registrationStatus = event.requiresPayment ? 'pending' : 'confirmed';

    const registration = await Registration.create({
      user: req.user._id,
      event: event._id,
      status: registrationStatus,
      qrCode,
      customAnswers: parsedAnswers,
      paymentScreenshot: req.file ? `/uploads/${req.file.filename}` : '',
    });
    
    // Pre-create attendance record ONLY if confirmed immediately
    if (registrationStatus === 'confirmed') {
      await Attendance.create({ user: req.user._id, event: event._id, checkinStatus: false });
    }
    
    if (registrationStatus === 'confirmed') {
      try { await sendRegistrationEmail(req.user, event, qrCode); } catch (e) { /* email optional */ }
    }
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
    const participants = await Registration.find({ event: req.params.eventId, status: { $in: ['confirmed', 'pending'] } })
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

// @desc Verify a pending registration payment
// @route PUT /api/registrations/:id/verify
exports.verifyPayment = async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id).populate('event').populate('user');
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found' });
    if (reg.event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (reg.status === 'confirmed') return res.status(400).json({ success: false, message: 'Already confirmed' });
    
    reg.status = 'confirmed';
    await reg.save();
    
    // Create attendance record since it's now confirmed
    await Attendance.create({ user: reg.user._id, event: reg.event._id, checkinStatus: false });
    try { await sendRegistrationEmail(reg.user, reg.event, reg.qrCode); } catch (e) {}
    
    res.json({ success: true, message: 'Payment verified and registration confirmed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
