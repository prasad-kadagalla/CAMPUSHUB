import React, { useState } from 'react';

const MOCK_NOTIFS = [
  { id:1, text:'You successfully registered for Tech Symposium 2025. Check-in QR sent to your email.', time:'2 hours ago', read:false, icon:'🎉' },
  { id:2, text:'ML Workshop: PyTorch starts in 3 days. Don\'t forget to bring your laptop!', time:'5 hours ago', read:false, icon:'⏰' },
  { id:3, text:'New event: Badminton Tournament. Registration is now open.', time:'1 day ago', read:true, icon:'🏸' },
  { id:4, text:'Hackathon 36hr is filling fast — only 22 spots remaining!', time:'2 days ago', read:true, icon:'⚡' },
  { id:5, text:'Spring Cultural Fest has been approved and is live. Inviting all students.', time:'3 days ago', read:true, icon:'🎭' },
  { id:6, text:'Your registration for Inter-College Cricket has been confirmed.', time:'4 days ago', read:true, icon:'🏏' },
];

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState(MOCK_NOTIFS);

  const markRead = (id) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAll  = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const remove   = (id) => setNotifs(prev => prev.filter(n => n.id !== id));

  const unread = notifs.filter(n => !n.read).length;

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 700 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <p style={{ fontSize:13, color:'var(--text2)' }}>
          {unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up!'}
        </p>
        {unread > 0 && (
          <button onClick={markAll}
            style={{ background:'none', border:'1px solid var(--border)', borderRadius:8, padding:'6px 14px', color:'var(--purple2)', fontSize:12, cursor:'pointer', transition:'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#EEF2FF'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
            Mark all as read
          </button>
        )}
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {notifs.map(n => (
          <div key={n.id} onClick={() => markRead(n.id)}
            style={{ background:'var(--card)', border:`1px solid ${n.read ? 'var(--border)' : 'var(--purple)'}`, borderRadius:12, padding:'14px 16px', display:'flex', gap:12, alignItems:'flex-start', cursor:'pointer', transition:'all 0.2s', background: n.read ? 'var(--card)' : '#EEF2FF' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--purple)'; e.currentTarget.style.transform='translateX(4px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = n.read ? 'var(--border)' : 'var(--purple)'; e.currentTarget.style.transform=''; }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'var(--bg3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
              {n.icon}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, lineHeight:1.6, color: n.read ? 'var(--text2)' : 'var(--text)' }}>{n.text}</div>
              <div style={{ fontSize:11, color:'var(--text3)', marginTop:4 }}>{n.time}</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
              {!n.read && <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--purple)', flexShrink:0 }} />}
              <button onClick={e => { e.stopPropagation(); remove(n.id); }}
                style={{ background:'none', border:'none', color:'var(--text3)', fontSize:14, cursor:'pointer', lineHeight:1, padding:'2px 4px', borderRadius:4, transition:'all 0.2s' }}
                onMouseEnter={e => { e.target.style.color='var(--coral)'; e.target.style.background='rgba(255,107,107,0.1)'; }}
                onMouseLeave={e => { e.target.style.color='var(--text3)'; e.target.style.background='none'; }}>
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {notifs.length === 0 && (
        <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text3)' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🔔</div>
          <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:18, marginBottom:6, color:'var(--text2)' }}>No notifications</h3>
          <p style={{ fontSize:13 }}>You're all caught up!</p>
        </div>
      )}
    </div>
  );
}
