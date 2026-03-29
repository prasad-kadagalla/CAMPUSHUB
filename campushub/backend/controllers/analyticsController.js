const Event = require('../models/Event');
const User = require('../models/User');
const Registration = require('../models/Registration');
const Attendance = require('../models/Attendance');

// @desc  Platform analytics (admin)
// @route GET /api/analytics
exports.getAnalytics = async (req, res) => {
  try {
    const [
      totalEvents, approvedEvents, pendingEvents,
      totalUsers, totalStudents, totalOrganizers,
      totalRegistrations, totalAttendance,
    ] = await Promise.all([
      Event.countDocuments(),
      Event.countDocuments({ status: 'approved' }),
      Event.countDocuments({ status: 'pending' }),
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'organizer' }),
      Registration.countDocuments({ status: 'confirmed' }),
      Attendance.countDocuments({ checkinStatus: true }),
    ]);

    // Registrations by category
    const byCategory = await Registration.aggregate([
      { $lookup: { from: 'events', localField: 'event', foreignField: '_id', as: 'eventData' } },
      { $unwind: '$eventData' },
      { $match: { status: 'confirmed' } },
      { $group: { _id: '$eventData.category', count: { $sum: 1 } } },
    ]);

    // Popular events
    const popularEvents = await Registration.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: '$event', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'events', localField: '_id', foreignField: '_id', as: 'eventData' } },
      { $unwind: '$eventData' },
      { $project: { title: '$eventData.title', category: '$eventData.category', date: '$eventData.date', count: 1 } },
    ]);

    // Monthly registrations
    const monthlyRegs = await Registration.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: { month: { $month: '$registeredAt' }, year: { $year: '$registeredAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 },
    ]);

    res.json({
      success: true,
      stats: {
        totalEvents, approvedEvents, pendingEvents,
        totalUsers, totalStudents, totalOrganizers,
        totalRegistrations, totalAttendance,
        attendanceRate: totalRegistrations > 0
          ? Math.round((totalAttendance / totalRegistrations) * 100)
          : 0,
      },
      byCategory,
      popularEvents,
      monthlyRegs,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc  Organizer dashboard stats
// @route GET /api/analytics/organizer
exports.getOrganizerStats = async (req, res) => {
  try {
    const myEvents = await Event.find({ organizer: req.user._id });
    const eventIds = myEvents.map(e => e._id);
    const totalRegistrations = await Registration.countDocuments({ event: { $in: eventIds }, status: 'confirmed' });
    const totalAttendance = await Attendance.countDocuments({ event: { $in: eventIds }, checkinStatus: true });
    res.json({
      success: true,
      stats: {
        totalEvents: myEvents.length,
        approvedEvents: myEvents.filter(e => e.status === 'approved').length,
        pendingEvents: myEvents.filter(e => e.status === 'pending').length,
        totalRegistrations,
        totalAttendance,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
