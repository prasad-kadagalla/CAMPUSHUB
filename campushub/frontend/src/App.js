import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Shared/ProtectedRoute';
import AppLayout from './components/Layout/AppLayout';

import AuthPage          from './pages/AuthPage';
import DashboardPage     from './pages/DashboardPage';
import EventsPage        from './pages/EventsPage';
import MyEventsPage      from './pages/MyEventsPage';
import ManageEventsPage  from './pages/ManageEventsPage';
import ParticipantsPage  from './pages/ParticipantsPage';
import ApproveEventsPage from './pages/ApproveEventsPage';
import UsersPage         from './pages/UsersPage';
import AnalyticsPage     from './pages/AnalyticsPage';
import NotificationsPage from './pages/NotificationsPage';

import './styles/globals.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login"  element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />

          {/* Protected — shared layout */}
          <Route element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard"     element={<DashboardPage />} />
            <Route path="/events"        element={<EventsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />

            {/* Student only */}
            <Route path="/my-events" element={
              <ProtectedRoute roles={['student']}>
                <MyEventsPage />
              </ProtectedRoute>
            } />

            {/* Organizer only */}
            <Route path="/manage-events" element={
              <ProtectedRoute roles={['organizer']}>
                <ManageEventsPage />
              </ProtectedRoute>
            } />
            <Route path="/participants" element={
              <ProtectedRoute roles={['organizer']}>
                <ParticipantsPage />
              </ProtectedRoute>
            } />

            {/* Admin only */}
            <Route path="/approve" element={
              <ProtectedRoute roles={['admin']}>
                <ApproveEventsPage />
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute roles={['admin']}>
                <UsersPage />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute roles={['admin']}>
                <AnalyticsPage />
              </ProtectedRoute>
            } />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="dark"
      />
    </AuthProvider>
  );
}
