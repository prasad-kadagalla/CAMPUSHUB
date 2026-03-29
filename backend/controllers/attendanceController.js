const Attendance = require('../models/Attendance');
const Registration = require('../models/Registration');

// @desc  Check in a user via QR scan
// @route POST /api/attendance/checkin
exports.checkIn = async (req, res) => {
  try {
    const { userId, eventId } = req.body;
    const reg = await Registration.findOne({ user: userId, event: eventId, status: 'confirmed' });
    if (!reg) {
      return res.status(400).json({ success: false, message: 'No valid registration found' });
    }
    const attendance = await Attendance.findOneAndUpdate(
      { user: userId, event: eventId },
      { checkinStatus: true, checkinTime: new Date(), checkedInBy: req.user._id },
      { new: true, upsert: true }
    );
    res.json({ success: true, message: 'Check-in successful', attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Get attendance for an event
// @route GET /api/attendance/event/:eventId
exports.getEventAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ event: req.params.eventId })
      .populate('user', 'name email rollNumber');
    res.json({ success: true, attendance });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Issue certificate
// @route POST /api/attendance/certificate/:eventId
exports.issueCertificate = async (req, res) => {
  try {
    const attendance = await Attendance.findOneAndUpdate(
      { user: req.user._id, event: req.params.eventId, checkinStatus: true },
      { certificateIssued: true, certificateIssuedAt: new Date() },
      { new: true }
    ).populate('event', 'title date venue organizer')
      .populate('user', 'name email');
    if (!attendance) {
      return res.status(400).json({ success: false, message: 'Attendance not found or not checked in' });
    }
    res.json({ success: true, message: 'Certificate issued', attendance });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
