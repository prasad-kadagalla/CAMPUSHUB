const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Attendance = require('../models/Attendance');

const seed = async () => {
  // Clear existing data
  await User.deleteMany({});
  await Event.deleteMany({});
  await Registration.deleteMany({});
  await Attendance.deleteMany({});
  console.log('🗑️  Cleared existing data');

  // Create users
  const admin = await User.create({
    name: 'Dr. Admin Kumar', email: 'admin@college.edu',
    password: 'admin123', role: 'admin',
  });
  const organizer1 = await User.create({
    name: 'CS Club', email: 'csclub@college.edu',
    password: 'org123', role: 'organizer', department: 'Computer Science',
  });
  const organizer2 = await User.create({
    name: 'Cultural Committee', email: 'cultural@college.edu',
    password: 'org123', role: 'organizer', department: 'Student Affairs',
  });
  const organizer3 = await User.create({
    name: 'Sports Club', email: 'sports@college.edu',
    password: 'org123', role: 'organizer', department: 'Physical Education',
  });
  const student1 = await User.create({
    name: 'Arjun Sharma', email: 'arjun@college.edu',
    password: 'student123', role: 'student', rollNumber: '21CS001', department: 'Computer Science',
  });
  const student2 = await User.create({
    name: 'Priya Menon', email: 'priya@college.edu',
    password: 'student123', role: 'student', rollNumber: '21EC042', department: 'Electronics',
  });
  const student3 = await User.create({
    name: 'Rahul Das', email: 'rahul@college.edu',
    password: 'student123', role: 'student', rollNumber: '22ME015', department: 'Mechanical',
  });
  console.log('👥 Users created');

  // Create events
  const now = new Date();
  const events = await Event.insertMany([
    {
      title: 'Tech Symposium 2025', category: 'technical',
      description: 'Cutting-edge talks on AI, ML, and cloud computing by industry experts from Google and Microsoft. Network with professionals and explore internship opportunities.',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10),
      time: '10:00 AM', venue: 'Main Auditorium',
      organizer: organizer1._id, participantLimit: 200,
      registrationDeadline: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7),
      status: 'approved', tags: ['AI', 'ML', 'Cloud'],
    },
    {
      title: 'Spring Cultural Fest', category: 'cultural',
      description: 'Annual cultural extravaganza featuring music, dance, drama and art from every state of India. Cash prizes worth ₹1,00,000.',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 18),
      time: '5:00 PM', venue: 'Open Air Theatre',
      organizer: organizer2._id, participantLimit: 500,
      registrationDeadline: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14),
      status: 'approved', tags: ['Dance', 'Music', 'Drama'],
    },
    {
      title: 'Inter-College Cricket', category: 'sports',
      description: '3-day cricket tournament with teams from 12 colleges. Cash prizes worth ₹50,000. Both boys and girls teams welcome.',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 22),
      time: '8:00 AM', venue: 'Cricket Ground',
      organizer: organizer3._id, participantLimit: 24,
      registrationDeadline: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 18),
      status: 'approved', tags: ['Cricket', 'Tournament'],
    },
    {
      title: 'ML Workshop: PyTorch', category: 'workshop',
      description: 'Hands-on workshop on deep learning with PyTorch. Topics: CNNs, RNNs, Transformers. Laptop required. Certificate provided.',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 25),
      time: '2:00 PM', venue: 'CS Lab 301',
      organizer: organizer1._id, participantLimit: 40,
      registrationDeadline: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 22),
      status: 'approved', tags: ['PyTorch', 'Deep Learning'],
    },
    {
      title: 'Hackathon 36hr', category: 'technical',
      description: 'Build innovative solutions in 36 hours. Theme: Sustainability & Social Impact. Team size: 2-4. Prizes: ₹1L, ₹50K, ₹25K.',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30),
      time: '9:00 AM', venue: 'Innovation Hub',
      organizer: organizer1._id, participantLimit: 100,
      registrationDeadline: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 26),
      status: 'approved', tags: ['Hackathon', 'Innovation'],
    },
    {
      title: 'Classical Dance Night', category: 'cultural',
      description: 'An evening of Bharatanatyam, Kathak and Odissi performances. Guest artists from national academies.',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 35),
      time: '6:30 PM', venue: 'Seminar Hall',
      organizer: organizer2._id, participantLimit: 150,
      registrationDeadline: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30),
      status: 'pending',
    },
    {
      title: 'UI/UX Design Bootcamp', category: 'workshop',
      description: '2-day intensive bootcamp on Figma, prototyping and user research. Industry mentors from top product companies.',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 40),
      time: '10:00 AM', venue: 'Design Studio',
      organizer: organizer1._id, participantLimit: 30,
      registrationDeadline: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 36),
      status: 'pending',
    },
  ]);
  console.log('🎪 Events created');

  // Create registrations
  await Registration.create({ user: student1._id, event: events[0]._id, status: 'confirmed' });
  await Registration.create({ user: student1._id, event: events[3]._id, status: 'confirmed' });
  await Registration.create({ user: student1._id, event: events[4]._id, status: 'confirmed' });
  await Registration.create({ user: student2._id, event: events[0]._id, status: 'confirmed' });
  await Registration.create({ user: student2._id, event: events[1]._id, status: 'confirmed' });
  await Registration.create({ user: student3._id, event: events[2]._id, status: 'confirmed' });
  console.log('📝 Registrations created');

  // Create attendance records
  await Attendance.create({ user: student1._id, event: events[0]._id, checkinStatus: true, checkinTime: new Date() });
  await Attendance.create({ user: student2._id, event: events[0]._id, checkinStatus: false });
  console.log('✅ Attendance records created');

  console.log('\n🌱 Seed completed! Demo accounts:');
  console.log('  Admin:     admin@college.edu     / admin123');
  console.log('  Organizer: csclub@college.edu    / org123');
  console.log('  Student:   arjun@college.edu     / student123');
};

if (require.main === module) {
  seed().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
} else {
  module.exports = seed;
}
