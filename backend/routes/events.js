const express = require('express');
const router = express.Router();
const {
  getEvents, getEvent, createEvent, updateEvent,
  deleteEvent, reviewEvent, getMyEvents,
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/',    protect, getEvents);
router.get('/my',  protect, authorize('organizer'), getMyEvents);
router.get('/:id', protect, getEvent);

router.post('/',
  protect, authorize('organizer'),
  upload.fields([{ name: 'poster', maxCount: 1 }, { name: 'paymentQr', maxCount: 1 }]),
  createEvent
);

router.put('/:id',
  protect, authorize('organizer', 'admin'),
  upload.fields([{ name: 'poster', maxCount: 1 }, { name: 'paymentQr', maxCount: 1 }]),
  updateEvent
);

router.put('/:id/review', protect, authorize('admin'), reviewEvent);
router.delete('/:id',     protect, authorize('organizer', 'admin'), deleteEvent);

module.exports = router;
