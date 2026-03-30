import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('campushub_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('campushub_token');
      localStorage.removeItem('campushub_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login:    (data) => API.post('/auth/login', data),
  getMe:    ()     => API.get('/auth/me'),
  updatePassword: (data) => API.put('/auth/password', data),
};

// Events
export const eventsAPI = {
  getAll:    (params) => API.get('/events', { params }),
  getOne:    (id)     => API.get(`/events/${id}`),
  getMy:     ()       => API.get('/events/my'),
  create:    (data)   => API.post('/events', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:    (id, data) => API.put(`/events/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:    (id)     => API.delete(`/events/${id}`),
  review:    (id, data) => API.put(`/events/${id}/review`, data),
};

// Registrations
export const registrationsAPI = {
  register:      (eventId, data) => API.post(`/registrations/${eventId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  cancel:        (eventId) => API.delete(`/registrations/${eventId}`),
  getMy:         ()        => API.get('/registrations/me'),
  getParticipants: (eventId) => API.get(`/registrations/event/${eventId}`),
  verifyPayment: (id)      => API.put(`/registrations/${id}/verify`),
};

// Attendance
export const attendanceAPI = {
  checkIn:       (data)    => API.post('/attendance/checkin', data),
  getByEvent:    (eventId) => API.get(`/attendance/event/${eventId}`),
  getCertificate:(eventId) => API.post(`/attendance/certificate/${eventId}`),
};

// Users
export const usersAPI = {
  getAll:    (params) => API.get('/users', { params }),
  getOne:    (id)     => API.get(`/users/${id}`),
  update:    (id, data) => API.put(`/users/${id}`, data),
  toggle:    (id)     => API.put(`/users/${id}/toggle`),
  delete:    (id)     => API.delete(`/users/${id}`),
  updateProfile: (data) => API.put('/users/profile', data),
};

// Analytics
export const analyticsAPI = {
  getAdmin:     () => API.get('/analytics'),
  getOrganizer: () => API.get('/analytics/organizer'),
};

// QR
export const qrAPI = {
  getEventQR:   (eventId) => API.get(`/qr/event/${eventId}`),
  getCheckinQR: (eventId) => API.get(`/qr/checkin/${eventId}`),
};

export default API;
