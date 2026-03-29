const express = require('express');
const router = express.Router();
const { generateEventQR, generateCheckinQR } = require('../controllers/qrController');
const { protect, authorize } = require('../middleware/auth');

router.get('/event/:eventId',   protect, generateEventQR);
router.get('/checkin/:eventId', protect, authorize('organizer', 'admin'), generateCheckinQR);

module.exports = router;
