import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { Button, FormField } from '../components/Shared/UI';

export default function AuthPage() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab]         = useState('login');
  const [role, setRole]       = useState('student');
  const [loading, setLoading] = useState(false);

  // Separate state for each form — no field bleed between tabs
  const [loginForm,  setLoginForm]  = useState({ identifier: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '', rollNumber: '', department: '' });

  if (user) return <Navigate to="/dashboard" replace />;

  const setLogin  = (k, v) => setLoginForm(f  => ({ ...f, [k]: v }));
  const setSignup = (k, v) => setSignupForm(f => ({ ...f, [k]: v }));

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.identifier || !loginForm.password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      await login(loginForm.identifier.trim(), loginForm.password);
      toast.success('Welcome back! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // REGISTER
  const handleRegister = async (e) => {
    e.preventDefault();
    const { name, email, password, rollNumber, department } = signupForm;
    if (!name.trim())        return toast.error('Full name is required');
    if (!email.trim())       return toast.error('Email is required');
    if (!password)           return toast.error('Password is required');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        rollNumber: rollNumber.trim(),
        department: department.trim(),
      });
      toast.success('Account created! Welcome to CampusHub 🎓');
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors?.length > 0) {
        toast.error(data.errors[0].msg || 'Validation error');
      } else {
        toast.error(data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // QUICK DEMO LOGIN
  const quickLogin = async (r) => {
    const creds = { student: 'arjun@college.edu', organizer: 'csclub@college.edu', admin: 'admin@college.edu' };
    const pass  = { student: 'student123',        organizer: 'org123',             admin: 'admin123' };
    if (loading) return;
    setLoading(true);
    try {
      await login(creds[r], pass[r]);
      toast.success('Logged in as ' + r + ' 🚀');
      navigate('/dashboard');
    } catch {
      toast.error('Demo login failed — run: cd backend && npm run seed');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: 'student',   label: '🎒 Student' },
    { id: 'organizer', label: '🎪 Organizer' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '16px' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(79, 70, 229, 0.08) 0%, transparent 70%)' }} />
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'var(--purple)', filter: 'blur(80px)', opacity: 0.1, top: -100, left: -100 }} />
      <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'var(--teal)', filter: 'blur(80px)', opacity: 0.08, bottom: -80, right: -80 }} />

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 24, padding: '40px', width: '100%', maxWidth: 420, position: 'relative', zIndex: 2, boxShadow: 'var(--shadow-lg)', animation: 'fadeIn 0.4s ease' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{ width: 42, height: 42, background: 'linear-gradient(135deg,#5a4df5,#19e3cb)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🎓</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, background: 'linear-gradient(90deg,var(--purple2),var(--teal))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CampusHub</div>
        </div>

        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 700, marginBottom: 6 }}>
          {tab === 'login' ? 'Welcome back 👋' : 'Create account'}
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 24 }}>Centralized College Event Management Portal</p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg3)', borderRadius: 10, padding: 4, marginBottom: 24 }}>
          {[{ key: 'login', label: 'Login' }, { key: 'signup', label: 'Sign Up' }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: tab === t.key ? 'var(--card2)' : 'none', color: tab === t.key ? 'var(--text)' : 'var(--text2)', fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: tab === t.key ? 500 : 400, cursor: 'pointer', transition: 'all 0.2s' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* LOGIN */}
        {tab === 'login' && (
          <form onSubmit={handleLogin}>
            <FormField label="Email or Roll Number" required>
              <input type="text" placeholder="student@college.edu or 21CS001"
                value={loginForm.identifier} onChange={e => setLogin('identifier', e.target.value)}
                autoComplete="username" />
            </FormField>
            <FormField label="Password" required>
              <input type="password" placeholder="••••••••"
                value={loginForm.password} onChange={e => setLogin('password', e.target.value)}
                autoComplete="current-password" />
            </FormField>
            <Button type="submit" fullWidth loading={loading} style={{ marginTop: 8 }}>
              Login to CampusHub
            </Button>
            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--text3)' }}>
              Quick demo:{' '}
              {['student', 'organizer', 'admin'].map(r => (
                <span key={r} onClick={() => quickLogin(r)}
                  style={{ color: 'var(--purple)', cursor: loading ? 'default' : 'pointer', marginRight: 6, textTransform: 'capitalize' }}
                  onMouseEnter={e => { if (!loading) e.target.style.textDecoration = 'underline'; }}
                  onMouseLeave={e => e.target.style.textDecoration = 'none'}>
                  {r}
                </span>
              ))}
            </div>
          </form>
        )}

        {/* SIGNUP */}
        {tab === 'signup' && (
          <form onSubmit={handleRegister}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <FormField label="Full Name" required>
                <input type="text" placeholder="Arjun Sharma"
                  value={signupForm.name} onChange={e => setSignup('name', e.target.value)}
                  autoComplete="name" />
              </FormField>
              <FormField label="Roll Number">
                <input type="text" placeholder="21CS001"
                  value={signupForm.rollNumber} onChange={e => setSignup('rollNumber', e.target.value)} />
              </FormField>
            </div>

            <FormField label="Email" required>
              <input type="email" placeholder="arjun@college.edu"
                value={signupForm.email} onChange={e => setSignup('email', e.target.value)}
                autoComplete="email" />
            </FormField>

            <FormField label="Department">
              <input type="text" placeholder="Computer Science"
                value={signupForm.department} onChange={e => setSignup('department', e.target.value)} />
            </FormField>

            <FormField label="Register as">
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                {roles.map(r => (
                  <div key={r.id} onClick={() => setRole(r.id)}
                    style={{ flex: 1, padding: '8px 12px', background: role === r.id ? '#EEF2FF' : 'var(--bg2)', border: `1px solid ${role === r.id ? 'var(--purple)' : 'var(--border)'}`, borderRadius: 8, color: role === r.id ? 'var(--purple)' : 'var(--text2)', fontSize: 12, cursor: 'pointer', textAlign: 'center', fontWeight: 500, transition: 'all 0.2s', userSelect: 'none' }}>
                    {r.label}
                  </div>
                ))}
              </div>
            </FormField>

            <FormField label="Password" required>
              <input type="password" placeholder="Min 6 characters"
                value={signupForm.password} onChange={e => setSignup('password', e.target.value)}
                autoComplete="new-password" />
            </FormField>

            <Button type="submit" fullWidth loading={loading} style={{ marginTop: 8 }}>
              Create Account
            </Button>

            <p style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: 'var(--text3)' }}>
              Already have an account?{' '}
              <span onClick={() => setTab('login')} style={{ color: 'var(--purple)', cursor: 'pointer', fontWeight: 600 }}>
                Login
              </span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
