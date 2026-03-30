import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { eventsAPI, registrationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Badge, categoryColor, statusColor, EmptyState, Spinner, Modal, Button, FormField } from '../components/Shared/UI';

const CATEGORIES = ['all','technical','cultural','sports','workshop'];
const CAT_EMOJIS = { technical:'💻', cultural:'🎭', sports:'🏅', workshop:'🔧' };
const CAT_BG     = { technical:'#EEF2FF', cultural:'#FEF3C7', sports:'#E6FFFA', workshop:'#F3F4F6' };

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents]     = useState([]);
  const [myRegs, setMyRegs]     = useState(new Set());
  const [loading, setLoading]   = useState(true);
  const [cat, setCat]           = useState('all');
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(null);
  const [regLoading, setRegLoading] = useState(null);
  const [regModal, setRegModal] = useState(null);
  const [formAnswers, setFormAnswers] = useState({});
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 20 };
      if (cat !== 'all') params.category = cat;
      if (search) params.search = search;
      const res = await eventsAPI.getAll(params);
      setEvents(res.data.events);
      if (user.role === 'student') {
        const regRes = await registrationsAPI.getMy();
        setMyRegs(new Set(regRes.data.registrations.map(r => r.event?._id)));
      }
    } catch (e) { toast.error('Failed to load events'); }
    finally { setLoading(false); }
  }, [cat, search, user]);

  useEffect(() => { load(); }, [load]);

  const handleRegisterClick = (ev) => {
    if ((ev.customFields && ev.customFields.length > 0) || ev.requiresPayment) {
      setRegModal(ev);
      setFormAnswers({});
      setPaymentScreenshot(null);
      if (selected) setSelected(null);
    } else {
      submitRegistration(ev._id, new FormData());
    }
  };

  const submitRegistration = async (eventId, fd) => {
    setRegLoading(eventId);
    try {
      await registrationsAPI.register(eventId, fd);
      setMyRegs(prev => new Set([...prev, eventId]));
      toast.success('🎉 Registered successfully!');
      setRegModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setRegLoading(null); }
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    const answersArr = regModal.customFields?.map(f => ({
      fieldLabel: f.label,
      answer: formAnswers[f.label] || '',
    })) || [];
    
    const missing = regModal.customFields?.filter(f => f.required && !formAnswers[f.label]);
    if (missing?.length > 0) return toast.error('Please fill all required fields');

    fd.append('answers', JSON.stringify(answersArr));

    if (regModal.requiresPayment) {
      if (!paymentScreenshot) return toast.error('Payment screenshot is required.');
      fd.append('paymentScreenshot', paymentScreenshot);
    }

    submitRegistration(regModal._id, fd);
  };

  return (
    <div className="animate-fadeIn">
      {/* Filters */}
      <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:24 }}>
        <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:10, padding:'8px 14px', display:'flex', alignItems:'center', gap:8, flex:1, maxWidth:320 }}>
          <span style={{ color:'var(--text3)' }}>🔍</span>
          <input type="text" placeholder="Search events..." value={search} onChange={e=>setSearch(e.target.value)}
            style={{ background:'none', border:'none', outline:'none', color:'var(--text)', fontSize:13, padding:0, width:'100%' }} />
        </div>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCat(c)}
            style={{ padding:'8px 16px', borderRadius:8, border:'1px solid', fontSize:12, fontWeight:500, cursor:'pointer', transition:'all 0.2s', textTransform:'capitalize',
              background: cat===c ? '#EEF2FF' : 'var(--bg2)',
              borderColor: cat===c ? 'var(--purple)' : 'var(--border)',
              color: cat===c ? 'var(--purple)' : 'var(--text2)',
            }}>
            {c === 'all' ? 'All' : `${CAT_EMOJIS[c]} ${c.charAt(0).toUpperCase()+c.slice(1)}`}
          </button>
        ))}
      </div>

      {/* Count */}
      {!loading && <p style={{ fontSize:13, color:'var(--text2)', marginBottom:16 }}>{events.length} event{events.length !== 1 ? 's' : ''} found</p>}

      {/* Grid */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}><Spinner size={40} /></div>
      ) : events.length === 0 ? (
        <EmptyState emoji="🎪" title="No events found" subtitle="Try a different category or search term." />
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16 }}>
          {events.map(ev => (
            <EventCard key={ev._id} event={ev}
              isRegistered={myRegs.has(ev._id)}
              isStudent={user.role === 'student'}
              regLoading={regLoading === ev._id}
              onRegister={() => handleRegisterClick(ev)}
              onView={() => setSelected(ev)}
            />
          ))}
        </div>
      )}

      {/* Event Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.title || ''} maxWidth="640px">
        {selected && <EventDetail event={selected} isRegistered={myRegs.has(selected._id)} isStudent={user.role==='student'} onRegister={() => handleRegisterClick(selected)} regLoading={regLoading === selected._id} />}
      </Modal>

      {/* Dynamic Registration Modal */}
      <Modal isOpen={!!regModal} onClose={() => setRegModal(null)} title={`Register: ${regModal?.title}`} maxWidth="500px">
        {regModal && (
          <form onSubmit={handleModalSubmit}>
            {regModal.requiresPayment && (
              <div style={{ marginBottom:20, padding:16, background:'var(--card)', border:'1px solid var(--border)', borderRadius:12 }}>
                <div style={{ fontWeight:700, marginBottom:16, textAlign:'center' }}>Event Registration Fee: ₹{regModal.fee}</div>
                {regModal.paymentQr && (
                  <div style={{ display:'flex', justifyContent:'center', marginBottom:16 }}>
                    <img src={`http://localhost:5000${regModal.paymentQr}`} alt="Payment QR" style={{ width:200, height:200, objectFit:'contain', background:'#fff', padding:8, borderRadius:12, border:'1px solid var(--border)' }} />
                  </div>
                )}
                <FormField label="Upload Payment Screenshot" required>
                  <input type="file" accept="image/*" onChange={e => setPaymentScreenshot(e.target.files[0])} style={{ fontSize:13 }} required />
                </FormField>
              </div>
            )}

            {regModal.customFields && regModal.customFields.length > 0 && (
              <div style={{ marginBottom:20 }}>
                {regModal.customFields.map((f, i) => (
                  <FormField key={i} label={f.label} required={f.required}>
                    {f.type === 'textarea' ? (
                      <textarea rows={3} value={formAnswers[f.label] || ''} onChange={e => setFormAnswers({...formAnswers, [f.label]: e.target.value})} required={f.required} />
                    ) : f.type === 'dropdown' ? (
                      <select value={formAnswers[f.label] || ''} onChange={e => setFormAnswers({...formAnswers, [f.label]: e.target.value})} required={f.required}>
                        <option value="">Select an option</option>
                        {f.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <input type="text" value={formAnswers[f.label] || ''} onChange={e => setFormAnswers({...formAnswers, [f.label]: e.target.value})} required={f.required} />
                    )}
                  </FormField>
                ))}
              </div>
            )}
            
            <div style={{ display:'flex', gap:10 }}>
              <Button type="button" variant="secondary" fullWidth onClick={() => setRegModal(null)}>Cancel</Button>
              <Button type="submit" fullWidth loading={regLoading === regModal._id}>Confirm Registration</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

function EventCard({ event, isRegistered, isStudent, regLoading, onRegister, onView }) {
  const pct = event.participantLimit ? Math.min(Math.round(((event.registrationCount||0)/event.participantLimit)*100), 100) : 0;
  const isFull = (event.registrationCount||0) >= event.participantLimit;
  const deadlinePassed = new Date() > new Date(event.registrationDeadline);

  return (
    <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden', transition:'all 0.2s', display:'flex', flexDirection:'column' }}
      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='var(--shadow-md)';e.currentTarget.style.borderColor='var(--border2)';}}
      onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';e.currentTarget.style.borderColor='';}}>
      {/* Poster */}
      <div onClick={onView} style={{ height:140, background:CAT_BG[event.category]||'var(--bg2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:52, position:'relative', cursor:'pointer' }}>
        {event.poster
          ? <img src={`http://localhost:5000${event.poster}`} alt={event.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          : <span>{CAT_EMOJIS[event.category]||'🎪'}</span>
        }
        <Badge color={categoryColor(event.category)} style={{ position:'absolute', top:8, left:8 }}>{event.category}</Badge>
        <Badge color={statusColor(event.status)} style={{ position:'absolute', top:8, right:8 }}>{event.status}</Badge>
      </div>

      <div style={{ padding:14, flex:1, display:'flex', flexDirection:'column' }}>
        <div onClick={onView} style={{ cursor:'pointer' }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, marginBottom:8, lineHeight:1.3 }}>{event.title}</div>
          <div style={{ display:'flex', flexDirection:'column', gap:3, marginBottom:10 }}>
            <div style={{ fontSize:11, color:'var(--text2)' }}>📅 {event.date ? format(new Date(event.date), 'MMM d, yyyy') : '—'} · {event.time}</div>
            <div style={{ fontSize:11, color:'var(--text2)' }}>📍 {event.venue}</div>
            <div style={{ fontSize:11, color:'var(--text2)' }}>🎙️ {event.organizer?.name}</div>
          </div>
        </div>

        <div style={{ marginTop:'auto' }}>
          {event.participantLimit && (
            <div style={{ marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'var(--text3)', marginBottom:3 }}>
                <span>{event.registrationCount||0}/{event.participantLimit} registered</span><span>{pct}%</span>
              </div>
              <div style={{ height:3, background:'var(--bg3)', borderRadius:2 }}>
                <div style={{ height:'100%', width:`${pct}%`, background:'var(--purple)', borderRadius:2, transition:'width 0.5s' }} />
              </div>
            </div>
          )}

          {isStudent && (
            <button
              disabled={isRegistered || isFull || deadlinePassed || regLoading}
              onClick={onRegister}
              style={{
                width:'100%', border:'none', borderRadius:8, padding:'8px', fontSize:12, fontWeight:600, cursor: (isRegistered||isFull||deadlinePassed) ? 'default' : 'pointer', transition:'all 0.2s',
                background: isRegistered ? '#D1FAE5' : isFull||deadlinePassed ? 'var(--bg3)' : 'var(--purple)',
                color: isRegistered ? 'var(--green)' : isFull||deadlinePassed ? 'var(--text3)' : '#fff',
                border: isRegistered ? '1px solid var(--green)' : 'none',
              }}>
              {regLoading ? '⟳ Registering...' : isRegistered ? '✓ Registered' : isFull ? 'Event Full' : deadlinePassed ? 'Deadline Passed' : 'Register Now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function EventDetail({ event, isRegistered, isStudent, onRegister, regLoading }) {
  const isFull = (event.registrationCount||0) >= event.participantLimit;
  return (
    <div>
      <div style={{ height:200, background:CAT_BG[event.category]||'var(--bg2)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:80, marginBottom:20, position:'relative', overflow:'hidden' }}>
        {event.poster
          ? <img src={`http://localhost:5000${event.poster}`} alt={event.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          : <span>{CAT_EMOJIS[event.category]||'🎪'}</span>
        }
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
        {[
          ['📅 Date', event.date ? format(new Date(event.date), 'MMMM d, yyyy') : '—'],
          ['⏰ Time', event.time],
          ['📍 Venue', event.venue],
          ['🎙️ Organizer', event.organizer?.name],
          ['👥 Capacity', `${event.registrationCount||0} / ${event.participantLimit}`],
          ['⏳ Deadline', event.registrationDeadline ? format(new Date(event.registrationDeadline), 'MMM d, yyyy') : '—'],
        ].map(([label, value]) => (
          <div key={label} style={{ background:'var(--bg3)', borderRadius:10, padding:12 }}>
            <div style={{ fontSize:10, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:600, marginBottom:4 }}>{label}</div>
            <div style={{ fontSize:13, fontWeight:500 }}>{value}</div>
          </div>
        ))}
      </div>
      <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.7, marginBottom:20 }}>{event.description}</p>
      {isStudent && (
        <Button fullWidth loading={regLoading} disabled={isRegistered||isFull} variant={isRegistered?'success':'primary'} onClick={onRegister}>
          {isRegistered ? '✓ Already Registered' : isFull ? 'Event Full' : 'Register for this Event'}
        </Button>
      )}
    </div>
  );
}
