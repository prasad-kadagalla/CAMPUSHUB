import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { usersAPI } from '../services/api';
import { Badge, EmptyState, Spinner } from '../components/Shared/UI';

const ROLE_COLORS = { student:'purple', organizer:'teal', admin:'coral' };
const ROLE_GRAD   = { student:['#5a4df5','#7c6ffc'], organizer:['#0ab5a0','#19e3cb'], admin:['#d85a5a','#ff6b6b'] };

export default function UsersPage() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');
  const [search, setSearch]   = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter !== 'all') params.role = filter;
      if (search) params.search = search;
      const res = await usersAPI.getAll(params);
      setUsers(res.data.users);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [filter, search]);

  useEffect(() => { load(); }, [load]);

  const toggleStatus = async (id, name, isActive) => {
    try {
      await usersAPI.toggle(id);
      toast.success(`${name} ${isActive ? 'suspended' : 'reactivated'}`);
      load();
    } catch { toast.error('Failed to update status'); }
  };

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await usersAPI.delete(id);
      toast.success(`${name} deleted`);
      load();
    } catch { toast.error('Failed to delete user'); }
  };

  const initials = (name) => name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="animate-fadeIn">
      {/* Controls */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24, flexWrap:'wrap' }}>
        <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:10, padding:'8px 14px', display:'flex', alignItems:'center', gap:8, flex:1, maxWidth:280 }}>
          <span style={{ color:'var(--text3)' }}>🔍</span>
          <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ background:'none', border:'none', outline:'none', color:'var(--text)', fontSize:13, padding:0, width:'100%' }} />
        </div>
        {['all','student','organizer','admin'].map(r => (
          <button key={r} onClick={() => setFilter(r)}
            style={{ padding:'8px 16px', borderRadius:8, border:'1px solid', fontSize:12, fontWeight:500, cursor:'pointer', transition:'all 0.2s', textTransform:'capitalize',
              background: filter===r ? 'rgba(124,111,252,0.15)' : 'var(--bg3)',
              borderColor: filter===r ? 'var(--purple)' : 'var(--border)',
              color: filter===r ? 'var(--purple2)' : 'var(--text2)',
            }}>
            {r === 'all' ? 'All Users' : r}
          </button>
        ))}
      </div>

      {/* Count */}
      {!loading && <p style={{ fontSize:13, color:'var(--text2)', marginBottom:16 }}>{users.length} user{users.length !== 1 ? 's' : ''} found</p>}

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size={40} /></div>
      ) : users.length === 0 ? (
        <EmptyState emoji="👤" title="No users found" />
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:14 }}>
          {users.map(u => {
            const grad = ROLE_GRAD[u.role] || ROLE_GRAD.student;
            return (
              <div key={u._id} style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:14, padding:18, textAlign:'center', transition:'all 0.2s', opacity: u.isActive ? 1 : 0.55 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border2)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform=''; }}>
                <div style={{ width:52, height:52, borderRadius:'50%', background:`linear-gradient(135deg,${grad[0]},${grad[1]})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, color:'#fff', margin:'0 auto 10px' }}>
                  {initials(u.name)}
                </div>
                <div style={{ fontSize:14, fontWeight:600, marginBottom:3 }}>{u.name}</div>
                <div style={{ fontSize:11, color:'var(--text3)', marginBottom:8, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.email}</div>
                {u.rollNumber && <div style={{ fontSize:11, color:'var(--text2)', marginBottom:6 }}>Roll: {u.rollNumber}</div>}
                <Badge color={ROLE_COLORS[u.role]}>{u.role}</Badge>
                {!u.isActive && <Badge color="coral" style={{ marginLeft:6 }}>Suspended</Badge>}
                <div style={{ display:'flex', gap:6, justifyContent:'center', marginTop:12 }}>
                  <ActionBtn onClick={() => toast.success(`✉️ Message sent to ${u.name}`)}>Message</ActionBtn>
                  <ActionBtn danger onClick={() => toggleStatus(u._id, u.name, u.isActive)}>
                    {u.isActive ? 'Suspend' : 'Reactivate'}
                  </ActionBtn>
                  <ActionBtn danger onClick={() => deleteUser(u._id, u.name)}>Delete</ActionBtn>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ActionBtn({ children, onClick, danger }) {
  return (
    <button onClick={onClick}
      style={{ background:'none', border:'1px solid var(--border)', borderRadius:6, padding:'4px 10px', color:'var(--text2)', fontSize:11, cursor:'pointer', transition:'all 0.2s', fontFamily:"'DM Sans',sans-serif" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = danger ? 'var(--coral)' : 'var(--purple)'; e.currentTarget.style.color = danger ? 'var(--coral)' : 'var(--purple2)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)'; }}>
      {children}
    </button>
  );
}
