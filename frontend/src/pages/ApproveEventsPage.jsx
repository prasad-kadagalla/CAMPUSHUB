import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { eventsAPI } from '../services/api';
import { Badge, categoryColor, statusColor, EmptyState, Spinner, Modal } from '../components/Shared/UI';

export default function ApproveEventsPage() {
  const [events, setEvents]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('pending');
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectNote, setRejectNote]   = useState('');
  const [submitting, setSubmitting]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await eventsAPI.getAll({ status: filter, limit: 50 });
      setEvents(res.data.events);
    } catch { toast.error('Failed to load events'); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const approve = async (id, title) => {
    try {
      await eventsAPI.review(id, { status: 'approved' });
      toast.success(`✅ "${title}" approved and published!`);
      load();
    } catch { toast.error('Failed to approve'); }
  };

  const rejectConfirm = async () => {
    if (!rejectModal) return;
    setSubmitting(true);
    try {
      await eventsAPI.review(rejectModal._id, { status: 'rejected', adminNote: rejectNote });
      toast.success(`Event rejected`);
      setRejectModal(null);
      setRejectNote('');
      load();
    } catch { toast.error('Failed to reject'); }
    finally { setSubmitting(false); }
  };

  const STATUS_FILTERS = ['pending', 'approved', 'rejected', 'cancelled'];

  return (
    <div className="animate-fadeIn">
      {/* Filter tabs */}
      <div style={{ display:'flex', gap:6, marginBottom:24, flexWrap:'wrap' }}>
        {STATUS_FILTERS.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding:'8px 18px', borderRadius:8, border:'1px solid', fontSize:12, fontWeight:500, cursor:'pointer', transition:'all 0.2s', textTransform:'capitalize',
              background: filter===s ? '#EEF2FF' : 'var(--bg2)',
              borderColor: filter===s ? 'var(--purple)' : 'var(--border)',
              color: filter===s ? 'var(--purple)' : 'var(--text2)',
            }}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size={40} /></div>
      ) : events.length === 0 ? (
        <EmptyState emoji="✅" title={`No ${filter} events`} subtitle="All caught up!" />
      ) : (
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 80px 130px 100px 160px', padding:'10px 18px', background:'var(--bg3)', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text3)' }}>
            <div>Event</div><div>Category</div><div>Organizer</div><div>Date</div><div>Actions</div>
          </div>

          {events.map(ev => (
            <div key={ev._id} style={{ display:'grid', gridTemplateColumns:'1fr 80px 130px 100px 160px', padding:'14px 18px', borderTop:'1px solid var(--border)', alignItems:'center', transition:'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div>
                <div style={{ fontSize:13, fontWeight:600, marginBottom:2 }}>{ev.title}</div>
                <div style={{ fontSize:11, color:'var(--text3)', maxWidth:260, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ev.description}</div>
                {ev.adminNote && (
                  <div style={{ fontSize:11, color:'var(--amber)', marginTop:3 }}>Note: {ev.adminNote}</div>
                )}
              </div>
              <div><Badge color={categoryColor(ev.category)}>{ev.category}</Badge></div>
              <div style={{ fontSize:12, color:'var(--text2)' }}>{ev.organizer?.name}</div>
              <div style={{ fontSize:12, color:'var(--text2)' }}>{ev.date ? format(new Date(ev.date), 'MMM d, yyyy') : '—'}</div>
              <div style={{ display:'flex', gap:6 }}>
                {ev.status === 'pending' && (
                  <>
                    <button onClick={() => approve(ev._id, ev.title)}
                      style={{ background:'rgba(74,222,128,0.1)', border:'1px solid rgba(74,222,128,0.4)', borderRadius:6, padding:'5px 12px', color:'var(--green)', fontSize:11, cursor:'pointer', fontWeight:600, transition:'all 0.2s', fontFamily:"'DM Sans',sans-serif" }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(74,222,128,0.22)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(74,222,128,0.1)'}>
                      ✓ Approve
                    </button>
                    <button onClick={() => setRejectModal(ev)}
                      style={{ background:'rgba(255,107,107,0.1)', border:'1px solid rgba(255,107,107,0.4)', borderRadius:6, padding:'5px 12px', color:'var(--coral)', fontSize:11, cursor:'pointer', fontWeight:600, transition:'all 0.2s', fontFamily:"'DM Sans',sans-serif" }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,107,107,0.22)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,107,107,0.1)'}>
                      ✕ Reject
                    </button>
                  </>
                )}
                {ev.status !== 'pending' && <Badge color={statusColor(ev.status)}>{ev.status}</Badge>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      <Modal isOpen={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject Event" maxWidth="420px">
        <p style={{ fontSize:13, color:'var(--text2)', marginBottom:16 }}>
          Rejecting: <strong style={{ color:'var(--text)' }}>{rejectModal?.title}</strong>
        </p>
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text2)', display:'block', marginBottom:6 }}>
            Rejection Reason (optional)
          </label>
          <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)}
            placeholder="Provide feedback to the organizer..." rows={3} />
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={() => setRejectModal(null)}
            style={{ flex:1, background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:10, padding:11, color:'var(--text2)', fontFamily:"'Syne',sans-serif", fontWeight:600, fontSize:14, cursor:'pointer' }}>
            Cancel
          </button>
          <button onClick={rejectConfirm} disabled={submitting}
            style={{ flex:1, background:'rgba(255,107,107,0.15)', border:'1px solid rgba(255,107,107,0.5)', borderRadius:10, padding:11, color:'var(--coral)', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, cursor:'pointer' }}>
            {submitting ? 'Rejecting...' : 'Reject Event'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
