import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { eventsAPI, qrAPI } from '../services/api';
import { Badge, categoryColor, statusColor, EmptyState, Spinner, Modal, Button, FormField } from '../components/Shared/UI';

const EMPTY_FORM = { title:'', description:'', category:'technical', date:'', time:'', venue:'', participantLimit:'', registrationDeadline:'', requiresPayment: false, fee: '', customFields: [] };

export default function ManageEventsPage() {
  const [events, setEvents]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [poster, setPoster]       = useState(null);
  const [paymentQr, setPaymentQr] = useState(null);
  const [saving, setSaving]       = useState(false);
  const [qrModal, setQrModal]     = useState(null);
  const [qrCode, setQrCode]       = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await eventsAPI.getMy();
      setEvents(res.data.events);
    } catch { toast.error('Failed to load events'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(EMPTY_FORM); setEditEvent(null); setPoster(null); setPaymentQr(null); setModal(true); };
  const openEdit   = (ev) => {
    setEditEvent(ev);
    setForm({
      title: ev.title, description: ev.description, category: ev.category,
      date: ev.date ? format(new Date(ev.date), 'yyyy-MM-dd') : '',
      time: ev.time, venue: ev.venue,
      participantLimit: ev.participantLimit,
      registrationDeadline: ev.registrationDeadline ? format(new Date(ev.registrationDeadline), 'yyyy-MM-dd') : '',
      requiresPayment: ev.requiresPayment || false,
      fee: ev.fee || '',
      customFields: ev.customFields || [],
    });
    setPoster(null);
    setPaymentQr(null);
    setModal(true);
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addField = () => set('customFields', [...form.customFields, { label: '', type: 'text', options: [], required: false }]);
  const updateField = (idx, key, val) => {
    const arr = [...form.customFields];
    if (key === 'optionsStr') {
      arr[idx].options = val.split(',').map(s=>s.trim()).filter(Boolean);
    } else {
      arr[idx][key] = val;
    }
    set('customFields', arr);
  };
  const removeField = (idx) => set('customFields', form.customFields.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.venue) return toast.error('Please fill required fields');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'customFields') fd.append(k, JSON.stringify(v));
        else fd.append(k, v);
      });
      if (poster) fd.append('poster', poster);
      if (paymentQr) fd.append('paymentQr', paymentQr);
      if (editEvent) {
        await eventsAPI.update(editEvent._id, fd);
        toast.success('Event updated & resubmitted for approval');
      } else {
        await eventsAPI.create(fd);
        toast.success('🚀 Event submitted for admin approval!');
      }
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save event');
    } finally { setSaving(false); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this event?')) return;
    try {
      await eventsAPI.delete(id);
      toast.success('Event cancelled');
      load();
    } catch { toast.error('Failed to cancel event'); }
  };

  const openQR = async (ev) => {
    try {
      const res = await qrAPI.getCheckinQR(ev._id);
      setQrCode(res.data.qrCode);
      setQrModal(ev.title);
    } catch { toast.error('Could not generate QR'); }
  };

  return (
    <div className="animate-fadeIn">
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:20 }}>
        <Button onClick={openCreate}>+ Create Event</Button>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size={40} /></div>
      ) : events.length === 0 ? (
        <EmptyState emoji="📋" title="No events yet" subtitle="Create your first event to get started." />
      ) : (
        <div className="table-container" style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 90px 80px 80px 100px 130px', padding:'10px 18px', background:'var(--bg3)', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text3)' }}>
            <div>Event</div><div>Date</div><div>Category</div><div>Registered</div><div>Status</div><div>Actions</div>
          </div>
          {events.map((ev, i) => (
            <div key={ev._id} style={{ display:'grid', gridTemplateColumns:'1fr 90px 80px 80px 100px 130px', padding:'14px 18px', borderTop:'1px solid var(--border)', alignItems:'center', transition:'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div>
                <div style={{ fontSize:13, fontWeight:600, marginBottom:2 }}>{ev.title}</div>
                <div style={{ fontSize:11, color:'var(--text3)' }}>Limit: {ev.participantLimit}</div>
              </div>
              <div style={{ fontSize:12, color:'var(--text2)' }}>{ev.date ? format(new Date(ev.date), 'MMM d') : '—'}</div>
              <div><Badge color={categoryColor(ev.category)}>{ev.category}</Badge></div>
              <div style={{ fontSize:13, fontWeight:600 }}>{ev.registrationCount || 0} / {ev.participantLimit}</div>
              <div><Badge color={statusColor(ev.status)}>{ev.status}</Badge></div>
              <div style={{ display:'flex', gap:5 }}>
                <SmBtn onClick={() => openQR(ev)}>QR</SmBtn>
                <SmBtn onClick={() => openEdit(ev)}>Edit</SmBtn>
                <SmBtn onClick={() => handleCancel(ev._id)} danger>✕</SmBtn>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editEvent ? 'Edit Event' : 'Create New Event'} maxWidth="580px">
        <form onSubmit={handleSubmit}>
          <FormField label="Event Title" required>
            <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Tech Symposium 2025" />
          </FormField>
          <div className="grid-cols-2" style={{ marginBottom: 12 }}>
            <FormField label="Category" required>
              <select value={form.category} onChange={e => set('category', e.target.value)}>
                <option value="technical">Technical</option>
                <option value="cultural">Cultural</option>
                <option value="sports">Sports</option>
                <option value="workshop">Workshop</option>
              </select>
            </FormField>
            <FormField label="Venue" required>
              <input value={form.venue} onChange={e => set('venue', e.target.value)} placeholder="Auditorium A" />
            </FormField>
          </div>
          <div className="grid-cols-2" style={{ marginBottom: 12 }}>
            <FormField label="Date" required>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            </FormField>
            <FormField label="Time" required>
              <input type="time" value={form.time} onChange={e => set('time', e.target.value)} />
            </FormField>
          </div>
          <div className="grid-cols-2" style={{ marginBottom: 12 }}>
            <FormField label="Participant Limit" required>
              <input type="number" value={form.participantLimit} onChange={e => set('participantLimit', e.target.value)} placeholder="100" min="1" />
            </FormField>
            <FormField label="Registration Deadline" required>
              <input type="date" value={form.registrationDeadline} onChange={e => set('registrationDeadline', e.target.value)} />
            </FormField>
          </div>
          <FormField label="Description" required>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe your event..." rows={3} />
          </FormField>
          
          <div style={{ marginTop:24, paddingTop:24, borderTop:'1px solid var(--border)' }}>
            <div style={{ fontWeight:600, marginBottom:16 }}>Payment Configuration</div>
            <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:14, marginBottom:16, cursor:'pointer' }}>
              <input type="checkbox" checked={form.requiresPayment} onChange={e => set('requiresPayment', e.target.checked)} />
              This event requires a registration fee
            </label>
            {form.requiresPayment && (
              <div className="grid-cols-2" style={{ marginBottom: 16 }}>
                <FormField label="Registration Fee (₹)" required>
                  <input type="number" value={form.fee} onChange={e => set('fee', e.target.value)} placeholder="500" min="1" />
                </FormField>
                <FormField label="Payment QR Code Image" required={!editEvent || !editEvent.paymentQr}>
                  <div style={{ border:'2px dashed var(--border2)', borderRadius:10, padding:12, textAlign:'center', cursor:'pointer' }}
                    onClick={() => document.getElementById('qr-input').click()}>
                    <div style={{ fontSize:16, marginBottom:4 }}>📲</div>
                    <div style={{ fontSize:11, color:'var(--text2)' }}>{paymentQr ? paymentQr.name : 'Upload QR Code'}</div>
                    <input id="qr-input" type="file" accept="image/*" style={{ display:'none' }} onChange={e => setPaymentQr(e.target.files[0])} />
                  </div>
                </FormField>
              </div>
            )}
          </div>

          <div style={{ marginTop:24, paddingTop:24, borderTop:'1px solid var(--border)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div style={{ fontWeight:600 }}>Custom Registration Form</div>
              <button type="button" onClick={addField} style={{ background:'var(--purple)', color:'#fff', border:'none', padding:'4px 12px', borderRadius:6, fontSize:12, cursor:'pointer' }}>+ Add Question</button>
            </div>
            {form.customFields.map((f, idx) => (
              <div key={idx} style={{ background:'var(--bg3)', padding:16, borderRadius:10, marginBottom:12, position:'relative', border:'1px solid var(--border)' }}>
                <button type="button" onClick={() => removeField(idx)} style={{ position:'absolute', top:12, right:12, background:'none', color:'var(--coral)', border:'none', cursor:'pointer', fontSize:14 }}>✕</button>
                <div className="grid-cols-2" style={{ marginBottom: 12, marginTop: 4 }}>
                  <FormField label="Question Label" required>
                    <input value={f.label} onChange={e=>updateField(idx, 'label', e.target.value)} placeholder="e.g. T-Shirt Size" required />
                  </FormField>
                  <FormField label="Answer Type">
                    <select value={f.type} onChange={e=>updateField(idx, 'type', e.target.value)}>
                      <option value="text">Short Answer</option>
                      <option value="textarea">Paragraph</option>
                      <option value="dropdown">Dropdown Options</option>
                    </select>
                  </FormField>
                </div>
                {f.type === 'dropdown' && (
                  <FormField label="Dropdown Options (comma separated)" required>
                    <input value={f.options?.join(', ') || ''} onChange={e=>updateField(idx, 'optionsStr', e.target.value)} placeholder="Small, Medium, Large" required />
                  </FormField>
                )}
                <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, cursor:'pointer' }}>
                  <input type="checkbox" checked={f.required} onChange={e => updateField(idx, 'required', e.target.checked)} />
                  Required Field
                </label>
              </div>
            ))}
            {form.customFields.length === 0 && (
              <div style={{ fontSize:13, color:'var(--text3)', textAlign:'center', padding:'20px 0' }}>No custom questions added.</div>
            )}
          </div>

          <div style={{ marginTop:24, paddingTop:24, borderTop:'1px solid var(--border)' }}>
            <FormField label="Event Poster (optional)">
              <div style={{ border:'2px dashed var(--border2)', borderRadius:10, padding:20, textAlign:'center', cursor:'pointer', transition:'all 0.2s' }}
                onClick={() => document.getElementById('poster-input').click()}>
                <div style={{ fontSize:24, marginBottom:6 }}>🖼️</div>
                <div style={{ fontSize:13, color:'var(--text2)' }}>{poster ? poster.name : 'Click to upload poster image'}</div>
                <input id="poster-input" type="file" accept="image/*" style={{ display:'none' }} onChange={e => setPoster(e.target.files[0])} />
              </div>
            </FormField>
          </div>

          <div style={{ display:'flex', gap:10, marginTop:24 }}>
            <Button variant="secondary" fullWidth type="button" onClick={() => setModal(false)}>Cancel</Button>
            <Button fullWidth type="submit" loading={saving}>{editEvent ? 'Update Event' : 'Submit for Approval'}</Button>
          </div>
        </form>
      </Modal>

      {/* QR Modal */}
      <Modal isOpen={!!qrModal} onClose={() => setQrModal(null)} title="Event Check-in QR" maxWidth="300px">
        <div style={{ textAlign:'center' }}>
          <p style={{ fontSize:13, color:'var(--text2)', marginBottom:16 }}>{qrModal}</p>
          <div style={{ display:'inline-flex', padding:16, background:'#fff', borderRadius:12, marginBottom:12 }}>
            {qrCode
              ? <img src={qrCode} alt="QR" style={{ width:160, height:160 }} />
              : <div style={{ width:160, height:160, background:'var(--bg3)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'var(--text3)' }}>Loading...</div>
            }
          </div>
          <p style={{ fontSize:11, color:'var(--text3)', marginBottom:16 }}>Display at event entry for attendee check-in</p>
          <Button fullWidth onClick={() => toast.success('QR downloaded!')}>Download QR Code</Button>
        </div>
      </Modal>
    </div>
  );
}

function SmBtn({ children, onClick, danger }) {
  return (
    <button onClick={onClick}
      style={{ background:'none', border:'1px solid var(--border)', borderRadius:6, padding:'4px 9px', fontSize:11, cursor:'pointer', color:'var(--text2)', transition:'all 0.2s', fontFamily:"'DM Sans',sans-serif" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = danger ? 'var(--coral)' : 'var(--purple)'; e.currentTarget.style.color = danger ? 'var(--coral)' : 'var(--purple)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)'; }}>
      {children}
    </button>
  );
}
