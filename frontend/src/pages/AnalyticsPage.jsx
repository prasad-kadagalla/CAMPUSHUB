import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';
import { analyticsAPI } from '../services/api';
import { StatCard, Spinner, EmptyState } from '../components/Shared/UI';
import { format } from 'date-fns';

const COLORS = { technical:'#7c6ffc', cultural:'#ff6b6b', sports:'#19e3cb', workshop:'#fbbf24' };
const PIE_COLORS = ['#7c6ffc','#ff6b6b','#19e3cb','#fbbf24'];

const TooltipStyle = {
  contentStyle: { background:'#1a1c35', border:'1px solid rgba(124,111,252,0.35)', borderRadius:10, color:'#f0f0ff', fontSize:12 },
  cursor: { fill:'rgba(124,111,252,0.08)' },
};

export default function AnalyticsPage() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getAdmin()
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:80 }}><Spinner size={48} /></div>;
  if (!data)   return <EmptyState emoji="📊" title="No analytics data" />;

  const { stats, byCategory, popularEvents, monthlyRegs } = data;

  const catChartData = byCategory.map(c => ({
    name: c._id.charAt(0).toUpperCase() + c._id.slice(1),
    registrations: c.count,
    fill: COLORS[c._id] || '#7c6ffc',
  }));

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthData = (monthlyRegs || []).map(m => ({
    month: `${monthNames[m._id.month - 1]} ${m._id.year}`,
    registrations: m.count,
  }));

  return (
    <div className="animate-fadeIn">
      {/* Stats */}
      <div className="grid-cols-4" style={{ marginBottom:28 }}>
        <StatCard icon="🗓️" value={stats.totalEvents}        label="Total Events"    color="purple" trend={`${stats.pendingEvents} pending`} />
        <StatCard icon="📝" value={stats.totalRegistrations} label="Registrations"   color="teal"   trend="All time" />
        <StatCard icon="🎓" value={stats.totalStudents}       label="Students"        color="amber"  trend="Active" />
        <StatCard icon="✅" value={`${stats.attendanceRate}%`} label="Attendance Rate" color="coral" trend="Check-ins" />
      </div>

      <div className="grid-cols-2-1" style={{ marginBottom:16 }}>
        {/* Bar chart */}
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:14, padding:20 }}>
          <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, marginBottom:20 }}>Registrations by Category</h3>
          {catChartData.length === 0 ? (
            <EmptyState emoji="📊" title="No data yet" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={catChartData} margin={{ top:0, right:10, left:-20, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,111,252,0.1)" />
                <XAxis dataKey="name" tick={{ fill:'var(--text2)', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'var(--text3)', fontSize:10 }} axisLine={false} tickLine={false} />
                <Tooltip {...TooltipStyle} />
                <Bar dataKey="registrations" radius={[6,6,0,0]}>
                  {catChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart */}
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:14, padding:20 }}>
          <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, marginBottom:20 }}>Category Distribution</h3>
          {catChartData.length === 0 ? (
            <EmptyState emoji="🥧" title="No data yet" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={catChartData} dataKey="registrations" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                  {catChartData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={TooltipStyle.contentStyle} />
                <Legend wrapperStyle={{ fontSize:11, color:'var(--text2)' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Line chart + Popular */}
      <div className="grid-cols-2-1">
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:14, padding:20 }}>
          <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, marginBottom:20 }}>Monthly Registrations</h3>
          {monthData.length === 0 ? (
            <EmptyState emoji="📈" title="No monthly data yet" />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={monthData} margin={{ top:0, right:10, left:-20, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,111,252,0.1)" />
                <XAxis dataKey="month" tick={{ fill:'var(--text2)', fontSize:10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'var(--text3)', fontSize:10 }} axisLine={false} tickLine={false} />
                <Tooltip {...TooltipStyle} />
                <Line type="monotone" dataKey="registrations" stroke="#7c6ffc" strokeWidth={2.5} dot={{ fill:'#7c6ffc', r:4 }} activeDot={{ r:6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:14, padding:20 }}>
          <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, marginBottom:16 }}>Popular Events</h3>
          {(popularEvents || []).length === 0 ? (
            <EmptyState emoji="🔥" title="No data yet" />
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {popularEvents.map((ev, i) => (
                <div key={i} style={{ background:'var(--bg3)', borderRadius:10, padding:'10px 14px', display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:'var(--text3)', width:28 }}>{i + 1}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:500, marginBottom:1 }}>{ev.title}</div>
                    <div style={{ fontSize:11, color:'var(--text2)' }}>{ev.category}</div>
                  </div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700, color:'var(--purple2)' }}>{ev.count}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid-cols-3" style={{ marginTop:16 }}>
        {[
          { label:'Approved Events',  value: stats.approvedEvents,  color:'var(--green)',  icon:'✅' },
          { label:'Organizers',       value: stats.totalOrganizers, color:'var(--teal)',   icon:'🎪' },
          { label:'Total Attendances',value: stats.totalAttendance, color:'var(--purple2)',icon:'📍' },
        ].map(s => (
          <div key={s.label} style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:'18px 20px', display:'flex', alignItems:'center', gap:14 }}>
            <span style={{ fontSize:28 }}>{s.icon}</span>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:800, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:12, color:'var(--text2)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
