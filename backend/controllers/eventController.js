const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { sendEventApprovedEmail } = require('../utils/mailer');

// @desc  Get all approved events (with filters)
// @route GET /api/events
exports.getEvents = async (req, res) => {
  try {
    const { category, search, status, page = 1, limit = 12 } = req.query;
    const query = {};

    if (req.user.role === 'student') query.status = 'approved';
    else if (req.user.role === 'organizer') query.organizer = req.user._id;
    else if (status) query.status = status;

    if (category && category !== 'all') query.category = category;
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { venue: { $regex: search, $options: 'i' } },
    ];

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('organizer', 'name email department')
      .populate('registrationCount')
      .sort({ date: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ success: true, total, page: parseInt(page), pages: Math.ceil(total / limit), events });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get single event
// @route GET /api/events/:id
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email department')
      .populate('registrationCount');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Create event
// @route POST /api/events
exports.createEvent = async (req, res) => {
  try {
    const { title, description, category, date, time, venue, participantLimit, registrationDeadline, tags, requiresPayment, fee, customFields } = req.body;
    
    const poster = req.files && req.files['poster'] ? `/uploads/${req.files['poster'][0].filename}` : '';
    const paymentQr = req.files && req.files['paymentQr'] ? `/uploads/${req.files['paymentQr'][0].filename}` : '';

    const event = await Event.create({
      title, description, category, date, time, venue,
      participantLimit: parseInt(participantLimit),
      registrationDeadline,
      tags: tags ? JSON.parse(tags) : [],
      customFields: customFields ? JSON.parse(customFields) : [],
      requiresPayment: requiresPayment === 'true',
      fee: fee ? parseInt(fee) : 0,
      poster,
      paymentQr,
      organizer: req.user._id,
      status: 'pending',
    });
    res.status(201).json({ success: true, message: 'Event submitted for admin approval', event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error creating event' });
  }
};

// @desc  Update event
// @route PUT /api/events/:id
exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this event' });
    }
    const updateData = { ...req.body };
    if (updateData.tags) updateData.tags = JSON.parse(updateData.tags);
    if (updateData.customFields) updateData.customFields = JSON.parse(updateData.customFields);
    if (updateData.requiresPayment !== undefined) updateData.requiresPayment = updateData.requiresPayment === 'true';
    if (updateData.fee !== undefined) updateData.fee = parseInt(updateData.fee);

    if (req.files && req.files['poster']) updateData.poster = `/uploads/${req.files['poster'][0].filename}`;
    if (req.files && req.files['paymentQr']) updateData.paymentQr = `/uploads/${req.files['paymentQr'][0].filename}`;

    if (req.user.role !== 'admin') {
      delete updateData.status;
      delete updateData.adminNote;
      updateData.status = 'pending';
    }
    event = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
      .populate('organizer', 'name email');
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Delete / Cancel event
// @route DELETE /api/events/:id
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    event.status = 'cancelled';
    await event.save();
    res.json({ success: true, message: 'Event cancelled successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Approve or reject event (admin)
// @route PUT /api/events/:id/review
exports.reviewEvent = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
    }
    const event = await Event.findByIdAndUpdate(
      req.params.id, { status, adminNote }, { new: true }
    ).populate('organizer', 'name email');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (status === 'approved') {
      try { await sendEventApprovedEmail(event); } catch (e) { /* email optional */ }
    }
    res.json({ success: true, message: `Event ${status}`, event });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get organizer's own events
// @route GET /api/events/my
exports.getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id })
      .populate('registrationCount')
      .sort({ createdAt: -1 });
    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
