import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const PAGE_TITLES = {
  '/dashboard':     'Dashboard',
  '/events':        'Browse Events',
  '/my-events':     'My Registrations',
  '/manage-events': 'Manage Events',
  '/participants':  'Participants & Attendance',
  '/approve':       'Event Approvals',
  '/users':         'User Management',
  '/analytics':     'Platform Analytics',
  '/notifications': 'Notifications',
};

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'CampusHub';

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div style={{ marginLeft:'var(--sidebar-width)', flex:1, display:'flex', flexDirection:'column', minHeight:'100vh' }}>
        {/* Topbar */}
        <header style={{ background:'var(--card)', borderBottom:'1px solid var(--border)', padding:'0 28px', height:'var(--topbar-height)', display:'flex', alignItems:'center', gap:16, position:'sticky', top:0, zIndex:50 }}>
          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(o => !o)}
            style={{ display:'none', background:'none', border:'none', color:'var(--text)', fontSize:22, cursor:'pointer' }}
            className="mobile-menu-btn">☰</button>

          <h1 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:18, flex:1 }}>{title}</h1>

          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {/* Search */}
            <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:10, padding:'7px 14px', display:'flex', alignItems:'center', gap:8, width:200 }}>
              <span style={{ color:'var(--text3)', fontSize:13 }}>🔍</span>
              <input type="text" placeholder="Search events..." style={{ background:'none', border:'none', outline:'none', color:'var(--text)', fontSize:13, width:'100%', padding:0 }} />
            </div>

            {/* Notifications bell */}
            <button style={{ background:'var(--bg3)', border:'1px solid var(--border)', width:36, height:36, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:16, position:'relative', transition:'all 0.2s' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor='var(--purple)'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
              🔔
              <span style={{ position:'absolute', top:7, right:7, width:7, height:7, background:'var(--coral)', borderRadius:'50%', border:'1.5px solid var(--card)' }} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main style={{ padding:'24px 28px', flex:1 }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          aside { transform: translateX(-100%); }
          aside.open { transform: translateX(0) !important; }
          .mobile-menu-btn { display: flex !important; }
          main { padding: 16px !important; }
        }
      `}</style>
    </div>
  );
}
