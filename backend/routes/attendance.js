const express = require('express');
const router = express.Router();
const { checkIn, getEventAttendance, issueCertificate } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.post('/checkin',              protect, authorize('organizer', 'admin'), checkIn);
router.get('/event/:eventId',        protect, authorize('organizer', 'admin'), getEventAttendance);
router.post('/certificate/:eventId', protect, authorize('student'), issueCertificate);

module.exports = router;
