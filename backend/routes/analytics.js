const express = require('express');
const router = express.Router();
const { getAnalytics, getOrganizerStats } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/',           protect, authorize('admin'), getAnalytics);
router.get('/organizer',  protect, authorize('organizer'), getOrganizerStats);

module.exports = router;
