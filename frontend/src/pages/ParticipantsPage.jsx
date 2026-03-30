import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { eventsAPI, registrationsAPI, attendanceAPI } from '../services/api';
import { Badge, categoryColor, statusColor, EmptyState, Spinner, Modal, Button } from '../components/Shared/UI';

export default function ParticipantsPage() {
  const [events, setEvents]           = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [participants, setParticipants]   = useState([]);
  const [loading, setLoading]         = useState(false);
  const [evLoading, setEvLoading]     = useState(true);
  const [detailsModal, setDetailsModal] = useState(null);

  useEffect(() => {
    eventsAPI.getMy()
      .then(res => {
        const approved = res.data.events.filter(e => e.status === 'approved');
        setEvents(approved);
        if (approved.length > 0) setSelectedEvent(approved[0]._id);
      })
      .catch(() => toast.error('Failed to load events'))
      .finally(() => setEvLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedEvent) return;
    setLoading(true);
    registrationsAPI.getParticipants(selectedEvent)
      .then(res => setParticipants(res.data.participants))
      .catch(() => toast.error('Failed to load participants'))
      .finally(() => setLoading(false));
  }, [selectedEvent]);

  const handleCheckIn = async (userId) => {
    try {
      await attendanceAPI.checkIn({ userId, eventId: selectedEvent });
      setParticipants(prev => prev.map(p =>
        p.user?._id === userId ? { ...p, checkinStatus: true } : p
      ));
      toast.success('✅ Check-in recorded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    }
  };

  const handleVerify = async (regId) => {
    try {
      await registrationsAPI.verifyPayment(regId);
      toast.success('Payment verified! Registration confirmed.');
      setParticipants(prev => prev.map(p =>
        p._id === regId ? { ...p, status: 'confirmed' } : p
      ));
      setDetailsModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    }
  };

  const checkedIn  = participants.filter(p => p.checkinStatus).length;
  const total      = participants.length;
  const pct        = total > 0 ? Math.round((checkedIn / total) * 100) : 0;

  return (
    <div className="animate-fadeIn">
      {/* Event selector */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24, flexWrap:'wrap' }}>
        <label style={{ fontSize:13, color:'var(--text2)', fontWeight:500 }}>Select Event:</label>
        {evLoading ? <Spinner size={20} /> : (
          <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}
            style={{ width:'auto', minWidth:240 }}>
            {events.length === 0 && <option>No approved events</option>}
            {events.map(ev => <option key={ev._id} value={ev._id}>{ev.title}</option>)}
          </select>
        )}
      </div>

      {/* Attendance summary */}
      {!loading && participants.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
          {[
            { label:'Total Registered', value: total,      color:'var(--purple)' },
            { label:'Checked In',       value: checkedIn,  color:'var(--green)' },
            { label:'Not Checked In',   value: total - checkedIn, color:'var(--amber)' },
            { label:'Attendance Rate',  value: `${pct}%`,  color:'var(--teal)' },
          ].map(s => (
            <div key={s.label} style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:'16px 18px' }}>
              <div style={{ fontSize:24, fontWeight:800, fontFamily:"'Syne',sans-serif", color:s.color, marginBottom:4 }}>{s.value}</div>
              <div style={{ fontSize:12, color:'var(--text2)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size={40} /></div>
      ) : participants.length === 0 ? (
        <EmptyState emoji="👥" title="No participants yet" subtitle="Registrations for this event will appear here." />
      ) : (
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 90px 80px 80px 80px 140px', padding:'10px 18px', background:'var(--bg3)', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text3)' }}>
            <div>Student</div><div>Roll No.</div><div>Registered</div><div>Status</div><div>Check-in</div><div>Action</div>
          </div>
          {participants.map((p) => (
            <div key={p._id} style={{ display:'grid', gridTemplateColumns:'1fr 90px 80px 80px 80px 140px', padding:'12px 18px', borderTop:'1px solid var(--border)', alignItems:'center', transition:'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div>
                <div style={{ fontSize:13, fontWeight:600 }}>{p.user?.name}</div>
                <div style={{ fontSize:11, color:'var(--text3)' }}>{p.user?.email}</div>
              </div>
              <div style={{ fontSize:12, color:'var(--text2)' }}>{p.user?.rollNumber || '—'}</div>
              <div style={{ fontSize:12, color:'var(--text2)' }}>{p.registeredAt ? format(new Date(p.registeredAt), 'MMM d') : '—'}</div>
              <div><Badge color={p.status === 'pending' ? 'amber' : 'green'}>{p.status}</Badge></div>
              <div>
                <Badge color={p.checkinStatus ? 'green' : 'gray'}>
                  {p.checkinStatus ? '✓ In' : 'Pending'}
                </Badge>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                <button onClick={() => setDetailsModal(p)}
                  style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:6, padding:'4px 10px', color:'var(--text)', fontSize:11, cursor:'pointer', transition:'all 0.2s', fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--purple)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                  Details
                </button>
                {!p.checkinStatus && p.status === 'confirmed' && (
                  <button onClick={() => handleCheckIn(p.user?._id)}
                    style={{ background:'rgba(74,222,128,0.1)', border:'1px solid rgba(74,222,128,0.4)', borderRadius:6, padding:'4px 10px', color:'var(--green)', fontSize:11, cursor:'pointer', transition:'all 0.2s', fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(74,222,128,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(74,222,128,0.1)'}>
                    Check In
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      <Modal isOpen={!!detailsModal} onClose={() => setDetailsModal(null)} title="Registration Details" maxWidth="480px">
        {detailsModal && (
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
              <div style={{ width:48, height:48, borderRadius:24, background:'var(--purple)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:700 }}>
                {detailsModal.user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <div style={{ fontSize:16, fontWeight:700 }}>{detailsModal.user?.name}</div>
                <div style={{ fontSize:13, color:'var(--text2)' }}>{detailsModal.user?.email} • {detailsModal.user?.rollNumber}</div>
              </div>
              <Badge color={detailsModal.status === 'pending' ? 'amber' : 'green'} style={{ marginLeft:'auto' }}>
                {detailsModal.status}
              </Badge>
            </div>

            {detailsModal.customAnswers && detailsModal.customAnswers.length > 0 && (
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text3)', marginBottom:8 }}>Custom Answers</div>
                <div style={{ background:'var(--bg3)', borderRadius:12, padding:14, border:'1px solid var(--border)' }}>
                  {detailsModal.customAnswers.map((ans, i) => (
                    <div key={i} style={{ marginBottom: i===detailsModal.customAnswers.length-1 ? 0 : 12 }}>
                      <div style={{ fontSize:11, color:'var(--text2)', marginBottom:2 }}>{ans.fieldLabel}</div>
                      <div style={{ fontSize:14, fontWeight:500, color:'var(--text)' }}>{ans.answer || '—'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detailsModal.paymentScreenshot && (
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text3)', marginBottom:8 }}>Payment Screenshot</div>
                <div style={{ background:'var(--bg3)', borderRadius:12, padding:8, border:'1px solid var(--border)', display:'flex', justifyContent:'center' }}>
                  <img src={`http://localhost:5000${detailsModal.paymentScreenshot}`} alt="Payment Proof" style={{ maxWidth:'100%', maxHeight:300, objectFit:'contain', borderRadius:8 }} />
                </div>
              </div>
            )}

            {detailsModal.status === 'pending' && (
              <Button fullWidth onClick={() => handleVerify(detailsModal._id)} style={{ marginTop: 10 }}>
                ✓ Verify Payment & Confirm Registration
              </Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
