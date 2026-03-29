import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = {
  student: [
    { path: '/dashboard',   label: 'Dashboard',       icon: '🏠' },
    { path: '/events',      label: 'Browse Events',   icon: '🎪' },
    { path: '/my-events',   label: 'My Registrations',icon: '📅' },
    { path: '/notifications',label:'Notifications',   icon: '🔔', badge: true },
  ],
  organizer: [
    { path: '/dashboard',    label: 'Dashboard',      icon: '🏠' },
    { path: '/manage-events',label: 'My Events',      icon: '📋' },
    { path: '/participants', label: 'Participants',   icon: '👥' },
    { path: '/notifications',label: 'Notifications', icon: '🔔' },
  ],
  admin: [
    { path: '/dashboard',    label: 'Dashboard',      icon: '🏠' },
    { path: '/approve',      label: 'Approvals',      icon: '✅', badge: true },
    { path: '/events',       label: 'All Events',     icon: '🗓️' },
    { path: '/users',        label: 'Users',          icon: '👤' },
    { path: '/analytics',    label: 'Analytics',      icon: '📊' },
    { path: '/notifications',label: 'Notifications', icon: '🔔' },
  ],
};

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const items = NAV[user?.role] || NAV.student;

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const go = (path) => { navigate(path); onClose?.(); };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:99, display:'none' }}
          className="mobile-overlay" />
      )}

      <aside style={{
        width: 'var(--sidebar-width)', background: 'var(--card)',
        borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
        transform: mobileOpen ? 'translateX(0)' : undefined,
        transition: 'transform 0.3s',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:38, height:38, background:'linear-gradient(135deg,#5a4df5,#19e3cb)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>🎓</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, background:'linear-gradient(90deg,var(--purple2),var(--teal))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>CampusHub</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '12px 10px', flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text3)', padding:'0 10px', marginBottom:8, fontWeight:600 }}>
            {user?.role}
          </div>
          {items.map(item => {
            const active = location.pathname === item.path;
            return (
              <div key={item.path} onClick={() => go(item.path)}
                style={{
                  display:'flex', alignItems:'center', gap:10, padding:'9px 10px', borderRadius:8,
                  cursor:'pointer', color: active ? 'var(--purple2)' : 'var(--text2)',
                  background: active ? 'rgba(124,111,252,0.15)' : 'transparent',
                  fontSize:13, fontWeight:500, transition:'all 0.15s', marginBottom:2,
                  position:'relative',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background='var(--bg3)'; e.currentTarget.style.color='var(--text)'; }}}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text2)'; }}}
              >
                {active && <div style={{ position:'absolute', left:-10, top:'50%', transform:'translateY(-50%)', width:3, height:'60%', background:'var(--purple)', borderRadius:'0 2px 2px 0' }} />}
                <span style={{ fontSize:15 }}>{item.icon}</span>
                <span style={{ flex:1 }}>{item.label}</span>
                {item.badge && <span style={{ background:'var(--purple3)', color:'#fff', fontSize:10, padding:'2px 6px', borderRadius:20, fontWeight:700 }}>2</span>}
              </div>
            );
          })}
        </nav>

        {/* User */}
        <div style={{ padding:'14px 16px', borderTop:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#5a4df5,#19e3cb)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff', flexShrink:0 }}>{initials}</div>
          <div style={{ flex:1, overflow:'hidden' }}>
            <div style={{ fontSize:12, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</div>
            <div style={{ fontSize:10, color:'var(--text3)', textTransform:'capitalize' }}>{user?.role}</div>
          </div>
          <button onClick={logout} title="Logout"
            style={{ background:'none', border:'none', color:'var(--text3)', fontSize:16, cursor:'pointer', padding:'4px', borderRadius:6, transition:'all 0.2s', lineHeight:1 }}
            onMouseEnter={e=>{e.target.style.color='var(--coral)';e.target.style.background='rgba(255,107,107,0.1)';}}
            onMouseLeave={e=>{e.target.style.color='var(--text3)';e.target.style.background='none';}}>
            ↩
          </button>
        </div>
      </aside>
    </>
  );
}
