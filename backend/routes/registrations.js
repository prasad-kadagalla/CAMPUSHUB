const express = require('express');
const router = express.Router();
const {
  registerForEvent, cancelRegistration,
  getMyRegistrations, getEventParticipants,
} = require('../controllers/registrationController');
const { protect, authorize } = require('../middleware/auth');

router.get('/me',                protect, getMyRegistrations);
router.post('/:eventId',         protect, authorize('student'), registerForEvent);
router.delete('/:eventId',       protect, authorize('student'), cancelRegistration);
router.get('/event/:eventId',    protect, authorize('organizer', 'admin'), getEventParticipants);

module.exports = router;
