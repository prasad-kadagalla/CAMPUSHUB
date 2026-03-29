import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { registrationsAPI, qrAPI } from '../services/api';
import { Badge, statusColor, EmptyState, Spinner, Modal, Button } from '../components/Shared/UI';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';

export default function MyEventsPage() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [qrModal, setQrModal]             = useState(null);
  const [certModal, setCertModal]         = useState(null);
  const [qrData, setQrData]               = useState('');

  useEffect(() => {
    registrationsAPI.getMy()
      .then(res => setRegistrations(res.data.registrations))
      .catch(() => toast.error('Failed to load registrations'))
      .finally(() => setLoading(false));
  }, []);

  const openQR = async (eventId, title) => {
    try {
      const res = await qrAPI.getEventQR(eventId);
      setQrData(res.data.qrCode);
      setQrModal(title);
    } catch {
      toast.error('Could not load QR code');
    }
  };

  const cancelReg = async (eventId) => {
    if (!window.confirm('Cancel your registration for this event?')) return;
    try {
      await registrationsAPI.cancel(eventId);
      setRegistrations(prev => prev.filter(r => r.event?._id !== eventId));
      toast.success('Registration cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size={40} /></div>;

  return (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: 20 }}>
        <p style={{ color:'var(--text2)', fontSize:13 }}>
          {registrations.length} registered event{registrations.length !== 1 ? 's' : ''}
        </p>
      </div>

      {registrations.length === 0 ? (
        <EmptyState emoji="📅" title="No registrations yet" subtitle="Browse events and register to see them here." />
      ) : (
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
          {/* Header */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 110px 90px 90px 160px', padding:'10px 18px', background:'var(--bg3)', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text3)' }}>
            <div>Event</div><div>Date</div><div>Venue</div><div>Status</div><div>Actions</div>
          </div>

          {registrations.map((reg, i) => {
            const ev = reg.event;
            if (!ev) return null;
            return (
              <div key={reg._id} style={{ display:'grid', gridTemplateColumns:'1fr 110px 90px 90px 160px', padding:'14px 18px', borderTop:'1px solid var(--border)', alignItems:'center', transition:'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, marginBottom:2 }}>{ev.title}</div>
                  <div style={{ fontSize:11, color:'var(--text2)' }}>🎙️ {ev.organizer?.name}</div>
                </div>
                <div style={{ fontSize:12, color:'var(--text2)' }}>
                  {ev.date ? format(new Date(ev.date), 'MMM d, yyyy') : '—'}
                </div>
                <div style={{ fontSize:12, color:'var(--text2)' }}>{ev.venue}</div>
                <div><Badge color={statusColor(reg.status)}>{reg.status}</Badge></div>
                <div style={{ display:'flex', gap:6 }}>
                  <ActionBtn onClick={() => openQR(ev._id, ev.title)}>QR</ActionBtn>
                  <ActionBtn onClick={() => setCertModal(ev)} color="green">🏆</ActionBtn>
                  <ActionBtn onClick={() => cancelReg(ev._id)} color="coral">✕</ActionBtn>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Modal */}
      <Modal isOpen={!!qrModal} onClose={() => setQrModal(null)} title="Your Check-in QR Code" maxWidth="320px">
        <div style={{ textAlign:'center' }}>
          <p style={{ fontSize:13, color:'var(--text2)', marginBottom:16 }}>{qrModal}</p>
          <div style={{ display:'inline-flex', padding:16, background:'#fff', borderRadius:12, marginBottom:16 }}>
            {qrData
              ? <img src={qrData} alt="QR Code" style={{ width:160, height:160 }} />
              : <QRCodeSVG value={`campushub:${user?._id}:${qrModal}`} size={160} />
            }
          </div>
          <p style={{ fontSize:11, color:'var(--text3)', marginBottom:16 }}>Show this QR at the event entrance for check-in</p>
          <Button fullWidth onClick={() => toast.success('QR downloaded!')}>Download QR</Button>
        </div>
      </Modal>

      {/* Certificate Modal */}
      <Modal isOpen={!!certModal} onClose={() => setCertModal(null)} title="Certificate of Participation" maxWidth="520px">
        {certModal && <CertificateView event={certModal} user={user} onDownload={() => toast.success('📥 Certificate downloaded!')} />}
      </Modal>
    </div>
  );
}

function ActionBtn({ children, onClick, color }) {
  const colors = {
    green: { bg:'rgba(74,222,128,0.1)', border:'rgba(74,222,128,0.4)', text:'var(--green)' },
    coral: { bg:'rgba(255,107,107,0.1)', border:'rgba(255,107,107,0.4)', text:'var(--coral)' },
  };
  const c = colors[color] || {};
  return (
    <button onClick={onClick}
      style={{ background: c.bg||'none', border:`1px solid ${c.border||'var(--border)'}`, borderRadius:6, padding:'4px 10px', color:c.text||'var(--text2)', fontSize:11, cursor:'pointer', transition:'all 0.2s', fontFamily:"'DM Sans',sans-serif" }}
      onMouseEnter={e => { if (!color) { e.currentTarget.style.borderColor='var(--purple)'; e.currentTarget.style.color='var(--purple2)'; }}}
      onMouseLeave={e => { if (!color) { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text2)'; }}}>
      {children}
    </button>
  );
}

function CertificateView({ event, user, onDownload }) {
  return (
    <div>
      <div style={{ background:'linear-gradient(135deg,#0d0f22,#1a1c40)', border:'2px solid var(--purple)', borderRadius:16, padding:28, textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, opacity:0.04, background:'repeating-linear-gradient(45deg,var(--purple) 0,var(--purple) 1px,transparent 0,transparent 50%)', backgroundSize:'20px 20px' }} />
        <div style={{ fontSize:11, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--purple2)', marginBottom:8, position:'relative' }}>Certificate of Participation</div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:800, marginBottom:16, background:'linear-gradient(90deg,var(--purple2),var(--teal))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', position:'relative' }}>CampusHub</div>
        <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.9, position:'relative' }}>
          This is to certify that<br />
          <strong style={{ fontFamily:"'Syne',sans-serif", fontSize:18, color:'var(--text)', display:'block', margin:'4px 0' }}>{user?.name}</strong>
          successfully participated in<br />
          <strong style={{ fontFamily:"'Syne',sans-serif", fontSize:15, color:'var(--purple2)', display:'block', margin:'4px 0' }}>{event.title}</strong>
          organized by {event.organizer?.name}<br />
          <span style={{ fontSize:11, color:'var(--text3)' }}>
            {event.date ? format(new Date(event.date), 'MMMM d, yyyy') : ''} · {event.venue}
          </span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:20, position:'relative' }}>
          <div style={{ textAlign:'left' }}>
            <div style={{ fontSize:12, fontWeight:600, fontFamily:"'Syne',sans-serif", color:'var(--text2)' }}>Principal</div>
            <div style={{ fontSize:10, color:'var(--text3)' }}>Dr. Ramesh Kumar</div>
          </div>
          <div style={{ width:48, height:48, borderRadius:'50%', background:'linear-gradient(135deg,var(--purple3),var(--teal2))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🏛️</div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:12, fontWeight:600, fontFamily:"'Syne',sans-serif", color:'var(--text2)' }}>Organizer</div>
            <div style={{ fontSize:10, color:'var(--text3)' }}>{event.organizer?.name}</div>
          </div>
        </div>
      </div>
      <Button fullWidth style={{ marginTop:16 }} onClick={onDownload}>📥 Download Certificate</Button>
    </div>
  );
}
