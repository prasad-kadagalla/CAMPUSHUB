const express = require('express');
const router = express.Router();
const {
  getAllUsers, getUser, updateUser,
  toggleUserStatus, deleteUser, updateProfile,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/',                protect, authorize('admin'), getAllUsers);
router.get('/:id',             protect, authorize('admin'), getUser);
router.put('/profile',         protect, updateProfile);
router.put('/:id',             protect, authorize('admin'), updateUser);
router.put('/:id/toggle',      protect, authorize('admin'), toggleUserStatus);
router.delete('/:id',          protect, authorize('admin'), deleteUser);

module.exports = router;
