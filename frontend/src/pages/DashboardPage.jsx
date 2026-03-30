import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventsAPI, registrationsAPI, analyticsAPI } from '../services/api';
import { StatCard, EmptyState, Badge, categoryColor, statusColor } from '../components/Shared/UI';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents]       = useState([]);
  const [myRegs, setMyRegs]       = useState([]);
  const [stats,  setStats]        = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (user.role === 'student') {
          const [evRes, regRes] = await Promise.all([eventsAPI.getAll({ limit:3 }), registrationsAPI.getMy()]);
          setEvents(evRes.data.events);
          setMyRegs(regRes.data.registrations);
        } else if (user.role === 'organizer') {
          const [evRes, statRes] = await Promise.all([eventsAPI.getMy(), analyticsAPI.getOrganizer()]);
          setEvents(evRes.data.events.slice(0, 3));
          setStats(statRes.data.stats);
        } else {
          const [evRes, statRes] = await Promise.all([eventsAPI.getAll({ limit:3 }), analyticsAPI.getAdmin()]);
          setEvents(evRes.data.events);
          setStats(statRes.data.stats);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [user]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const greetEmoji = hour < 12 ? '🌤️' : hour < 17 ? '☀️' : '🌙';

  const studentStats = [
    { icon:'🎪', value: events.length, label:'Upcoming Events', color:'purple', trend:'This week' },
    { icon:'📝', value: myRegs.length,  label:'Registered',      color:'teal',   trend:'Active' },
    { icon:'🏆', value: myRegs.filter(r=>r.event?.status==='approved').length, label:'Attended', color:'amber', trend:'Certificates' },
    { icon:'🔔', value: 2,              label:'Notifications',   color:'coral',  trend:'Unread', trendUp: false },
  ];

  const orgStats = stats ? [
    { icon:'📋', value: stats.totalEvents,        label:'My Events',           color:'purple' },
    { icon:'👥', value: stats.totalRegistrations, label:'Total Registered',     color:'teal' },
    { icon:'✅', value: stats.approvedEvents,      label:'Approved Events',      color:'amber' },
    { icon:'📊', value: `${stats.attendanceRate || 0}%`, label:'Attendance Rate', color:'coral' },
  ] : [];

  const adminStats = stats ? [
    { icon:'🗓️', value: stats.totalEvents,         label:'Total Events',    color:'purple', trend:`${stats.pendingEvents} pending` },
    { icon:'👥', value: stats.totalRegistrations,  label:'Registrations',   color:'teal',   trend:'This month' },
    { icon:'🎓', value: stats.totalStudents,        label:'Students',        color:'amber',  trend:'Active users' },
    { icon:'✅', value: stats.approvedEvents,       label:'Live Events',     color:'coral',  trend:'Published' },
  ] : [];

  const statCards = user.role === 'student' ? studentStats : user.role === 'organizer' ? orgStats : adminStats;

  return (
    <div className="animate-fadeIn">
      {/* Welcome banner */}
      <div style={{ background:'var(--card)', boxShadow:'var(--shadow-sm)', border:'1px solid var(--border)', borderRadius:16, padding:'20px 24px', marginBottom:24, display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:-30, top:-30, width:150, height:150, borderRadius:'50%', background:'linear-gradient(135deg,var(--purple),var(--teal))', opacity:0.1, filter:'blur(30px)' }} />
        <div>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, marginBottom:4 }}>
            {greeting}, {user?.name?.split(' ')[0]}! {greetEmoji}
          </h2>
          <p style={{ fontSize:13, color:'var(--text2)' }}>
            {user.role === 'student' && 'Discover amazing events happening on campus this week.'}
            {user.role === 'organizer' && 'Manage your events and track registrations.'}
            {user.role === 'admin' && 'Oversee platform activity and approve events.'}
          </p>
        </div>
        <span style={{ fontSize:40 }}>🎉</span>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="grid-cols-4" style={{ marginBottom:24 }}>
          {statCards.map((s, i) => <StatCard key={i} {...s} />)}
        </div>
      )}

      {/* Recent Events */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700 }}>
          {user.role === 'organizer' ? 'My Recent Events' : 'Upcoming Events'}
        </h3>
        <button onClick={() => navigate(user.role === 'organizer' ? '/manage-events' : '/events')}
          style={{ background:'none', border:'1px solid var(--border)', borderRadius:8, padding:'6px 14px', color:'var(--purple)', fontSize:12, cursor:'pointer', fontWeight:500, transition:'all 0.2s' }}
          onMouseEnter={e=>{e.currentTarget.style.background='#EEF2FF';}}
          onMouseLeave={e=>{e.currentTarget.style.background='none';}}>
          View all →
        </button>
      </div>

      {loading ? (
        <div className="grid-cols-3">
          {[1,2,3].map(i => <div key={i} style={{ background:'var(--card)', borderRadius:16, height:220, animation:'pulse 1.5s ease infinite' }} />)}
        </div>
      ) : events.length === 0 ? (
        <EmptyState emoji="🎪" title="No events yet" subtitle="Events will appear here once created and approved." />
      ) : (
        <div className="grid-cols-3">
          {events.map(ev => <MiniEventCard key={ev._id} event={ev} onClick={() => navigate(`/events`)} />)}
        </div>
      )}

      {/* Student: My Registrations */}
      {user.role === 'student' && myRegs.length > 0 && (
        <>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', margin:'24px 0 16px' }}>
            <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700 }}>My Registered Events</h3>
            <button onClick={() => navigate('/my-events')} style={{ background:'none', border:'1px solid var(--border)', borderRadius:8, padding:'6px 14px', color:'var(--purple)', fontSize:12, cursor:'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e=>{e.currentTarget.style.background='#EEF2FF';}}
              onMouseLeave={e=>{e.currentTarget.style.background='none';}}>View all →</button>
          </div>
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
            {myRegs.slice(0, 3).map((reg, i) => (
              <div key={reg._id} style={{ display:'grid', gridTemplateColumns:'1fr 100px 80px', padding:'12px 18px', borderBottom: i < 2 ? '1px solid var(--border)' : 'none', alignItems:'center' }}>
                <div style={{ fontSize:13, fontWeight:500 }}>{reg.event?.title || 'Unknown Event'}</div>
                <div style={{ fontSize:12, color:'var(--text2)' }}>{reg.event?.date ? format(new Date(reg.event.date), 'MMM d, yyyy') : '—'}</div>
                <Badge color={statusColor(reg.status)}>{reg.status}</Badge>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Admin: Pending approvals */}
      {user.role === 'admin' && stats?.pendingEvents > 0 && (
        <div style={{ marginTop:24, background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.3)', borderRadius:14, padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <p style={{ fontWeight:600, marginBottom:3 }}>⚠️ {stats.pendingEvents} events awaiting approval</p>
            <p style={{ fontSize:13, color:'var(--text2)' }}>Review and approve or reject pending events.</p>
          </div>
          <button onClick={() => navigate('/approve')} style={{ background:'var(--amber)', border:'none', borderRadius:8, padding:'8px 16px', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>
            Review Now
          </button>
        </div>
      )}
    </div>
  );
}

function MiniEventCard({ event, onClick }) {
  const catEmojis = { technical:'💻', cultural:'🎭', sports:'🏅', workshop:'🔧' };
  const catBg     = { technical:'#EEF2FF', cultural:'#FEF3C7', sports:'#E6FFFA', workshop:'#F3F4F6' };
  const pct = event.participantLimit ? Math.round((event.registrationCount / event.participantLimit) * 100) : 0;

  return (
    <div onClick={onClick} style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden', cursor:'pointer', transition:'all 0.2s' }}
      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='var(--shadow-md)';e.currentTarget.style.borderColor='var(--border2)';}}
      onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';e.currentTarget.style.borderColor='';}}>
      <div style={{ height:120, background:catBg[event.category]||'var(--bg2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:44, position:'relative' }}>
        <Badge color={categoryColor(event.category)} style={{ position:'absolute', top:8, left:8 }}>{event.category}</Badge>
        <span>{catEmojis[event.category]||'🎪'}</span>
        <Badge color={statusColor(event.status)} style={{ position:'absolute', top:8, right:8 }}>{event.status}</Badge>
      </div>
      <div style={{ padding:14 }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:700, marginBottom:6, lineHeight:1.3 }}>{event.title}</div>
        <div style={{ fontSize:11, color:'var(--text2)', marginBottom:8 }}>
          📅 {event.date ? format(new Date(event.date), 'MMM d, yyyy') : '—'} · 📍 {event.venue}
        </div>
        {event.participantLimit && (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'var(--text3)', marginBottom:3 }}>
              <span>{event.registrationCount||0}/{event.participantLimit}</span><span>{pct}%</span>
            </div>
            <div style={{ height:3, background:'var(--bg3)', borderRadius:2, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${Math.min(pct,100)}%`, background:'linear-gradient(90deg,var(--purple3),var(--teal))', borderRadius:2 }} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
