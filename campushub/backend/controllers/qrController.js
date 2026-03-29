const QRCode = require('qrcode');
const Registration = require('../models/Registration');

// @desc  Generate QR code for event check-in
// @route GET /api/qr/event/:eventId
exports.generateEventQR = async (req, res) => {
  try {
    const reg = await Registration.findOne({
      user: req.user._id,
      event: req.params.eventId,
      status: 'confirmed',
    });
    if (!reg) {
      return res.status(404).json({ success: false, message: 'No registration found for this event' });
    }
    if (reg.qrCode) {
      return res.json({ success: true, qrCode: reg.qrCode });
    }
    const qrData = JSON.stringify({ userId: req.user._id, eventId: req.params.eventId });
    const qrCode = await QRCode.toDataURL(qrData);
    reg.qrCode = qrCode;
    await reg.save();
    res.json({ success: true, qrCode });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Generate organizer check-in QR (for organizer to display at entry)
// @route GET /api/qr/checkin/:eventId
exports.generateCheckinQR = async (req, res) => {
  try {
    const data = JSON.stringify({ eventId: req.params.eventId, type: 'checkin', ts: Date.now() });
    const qrCode = await QRCode.toDataURL(data, { width: 300, margin: 2 });
    res.json({ success: true, qrCode });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
