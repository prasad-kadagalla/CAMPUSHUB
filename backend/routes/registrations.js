const express = require('express');
const router = express.Router();
const {
  registerForEvent, cancelRegistration,
  getMyRegistrations, getEventParticipants, verifyPayment
} = require('../controllers/registrationController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/me',                protect, getMyRegistrations);
router.post('/:eventId',         protect, authorize('student'), upload.single('paymentScreenshot'), registerForEvent);
router.delete('/:eventId',       protect, authorize('student'), cancelRegistration);
router.get('/event/:eventId',    protect, authorize('organizer', 'admin'), getEventParticipants);
router.put('/:id/verify',        protect, authorize('organizer', 'admin'), verifyPayment);

module.exports = router;
