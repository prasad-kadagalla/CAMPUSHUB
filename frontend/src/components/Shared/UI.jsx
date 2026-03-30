import React from 'react';
import { createPortal } from 'react-dom';

/* ─── Button ─────────────────────────────────────────────── */
export const Button = ({
  children, variant = 'primary', size = 'md',
  loading = false, fullWidth = false, className = '', ...props
}) => {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: '8px', fontFamily: "'Syne', sans-serif", fontWeight: 600,
    borderRadius: '10px', border: 'none', cursor: 'pointer',
    transition: 'all 0.2s', width: fullWidth ? '100%' : undefined,
    opacity: (loading || props.disabled) ? 0.7 : 1,
  };
  const sizes = {
    sm: { padding: '6px 14px', fontSize: '12px' },
    md: { padding: '10px 20px', fontSize: '14px' },
    lg: { padding: '13px 28px', fontSize: '15px' },
  };
  const variants = {
    primary:   { background: 'var(--purple)', color: '#fff', boxShadow: 'var(--shadow-sm)' },
    secondary: { background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)' },
    danger:    { background: '#FEE2E2', border: 'none', color: 'var(--coral)' },
    success:   { background: '#D1FAE5', border: 'none', color: 'var(--green)' },
    ghost:     { background: 'none', border: 'none', color: 'var(--text2)', padding: '6px 10px' },
  };
  return (
    <button style={{ ...base, ...sizes[size], ...variants[variant] }} {...props}>
      {loading ? <span className="animate-spin" style={{fontSize:14}}>⟳</span> : children}
    </button>
  );
};

/* ─── Badge ──────────────────────────────────────────────── */
export const Badge = ({ children, color = 'purple', style: s }) => {
  const colors = {
    purple: { bg: '#EEF2FF', text: 'var(--purple)', border: 'transparent' },
    teal:   { bg: '#E6FFFA',  text: 'var(--teal)',    border: 'transparent' },
    amber:  { bg: '#FEF3C7',  text: 'var(--amber)',   border: 'transparent' },
    coral:  { bg: '#FEE2E2', text: 'var(--coral)',   border: 'transparent' },
    green:  { bg: '#D1FAE5',  text: 'var(--green)',   border: 'transparent' },
    gray:   { bg: 'var(--bg2)',  text: 'var(--text2)',   border: 'transparent' },
  };
  const c = colors[color] || colors.gray;
  return (
    <span style={{
      display: 'inline-block', fontSize: '10px', fontWeight: 700,
      padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase',
      letterSpacing: '0.05em', background: c.bg, color: c.text,
      border: `1px solid ${c.border}`, ...s
    }}>
      {children}
    </span>
  );
};

export const statusColor = (status) => ({
  approved: 'green', pending: 'amber', rejected: 'coral', cancelled: 'coral',
  confirmed: 'green', waitlisted: 'amber',
}[status] || 'gray');

export const categoryColor = (cat) => ({
  technical: 'purple', cultural: 'coral', sports: 'teal', workshop: 'amber',
}[cat] || 'gray');

/* ─── Card ───────────────────────────────────────────────── */
export const Card = ({ children, style: s, onClick, hover = false }) => (
  <div
    onClick={onClick}
    style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: '16px', overflow: 'hidden',
      transition: hover ? 'transform 0.2s, box-shadow 0.2s, border-color 0.2s' : undefined,
      cursor: onClick ? 'pointer' : undefined, ...s,
    }}
    onMouseEnter={hover && onClick ? e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='var(--shadow-lg)'; e.currentTarget.style.borderColor='var(--border2)'; } : undefined}
    onMouseLeave={hover && onClick ? e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; e.currentTarget.style.borderColor=''; } : undefined}
  >
    {children}
  </div>
);

/* ─── Spinner ─────────────────────────────────────────────── */
export const Spinner = ({ size = 32, color = 'var(--purple)' }) => (
  <div style={{
    width: size, height: size, border: `3px solid var(--border)`,
    borderTop: `3px solid ${color}`, borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  }} />
);

export const LoadingScreen = () => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--bg)', flexDirection:'column', gap:16 }}>
    <Spinner size={48} />
    <p style={{ color:'var(--text2)', fontSize:14 }}>Loading CampusHub...</p>
  </div>
);

/* ─── Modal ──────────────────────────────────────────────── */
export const Modal = ({ isOpen, onClose, title, children, maxWidth = '560px' }) => {
  if (!isOpen) return null;
  return createPortal(
    <div
      style={{ position:'fixed', inset:0, background:'rgba(17,24,39,0.4)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)', padding:'16px' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'20px', padding:'28px', width:'100%', maxWidth, maxHeight:'90vh', overflowY:'auto', boxShadow:'var(--shadow-lg)', animation:'fadeIn 0.2s ease' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
          <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:'18px', fontWeight:700 }}>{title}</h3>
          <button type="button" onClick={onClose} style={{ background:'none', border:'none', color:'var(--text3)', fontSize:'20px', cursor:'pointer', lineHeight:1, transition:'color 0.2s' }}
            onMouseEnter={e=>e.target.style.color='var(--coral)'} onMouseLeave={e=>e.target.style.color='var(--text3)'}>✕</button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
};

/* ─── StatCard ───────────────────────────────────────────── */
export const StatCard = ({ icon, value, label, trend, trendUp = true, color = 'purple' }) => {
  const gradients = {
    purple: '#EEF2FF', teal: '#E6FFFA',
    amber: '#FEF3C7', coral: '#FEE2E2',
  };
  return (
    <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'14px', padding:'18px 20px', position:'relative', overflow:'hidden', transition:'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='var(--shadow-md)';}}
      onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';}}>
      <div style={{ position:'absolute', top:-30, right:-30, width:100, height:100, borderRadius:'50%', background:gradients[color]||gradients.purple, filter:'blur(20px)' }} />
      <div style={{ fontSize:22, marginBottom:10 }}>{icon}</div>
      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800, marginBottom:2, lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:12, color:'var(--text2)', fontWeight:500 }}>{label}</div>
      {trend && <div style={{ fontSize:11, marginTop:6, color:trendUp?'var(--green)':'var(--coral)', display:'flex', alignItems:'center', gap:3 }}>{trendUp?'↑':'↓'} {trend}</div>}
    </div>
  );
};

/* ─── Empty State ─────────────────────────────────────────── */
export const EmptyState = ({ emoji = '📭', title = 'Nothing here', subtitle }) => (
  <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text3)' }}>
    <div style={{ fontSize:48, marginBottom:12 }}>{emoji}</div>
    <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:18, marginBottom:6, color:'var(--text2)' }}>{title}</h3>
    {subtitle && <p style={{ fontSize:13 }}>{subtitle}</p>}
  </div>
);

/* ─── FormField ──────────────────────────────────────────── */
export const FormField = ({ label, error, children, required }) => (
  <div style={{ marginBottom:16 }}>
    {label && <label style={{ display:'block', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text2)', marginBottom:6 }}>
      {label}{required && <span style={{ color:'var(--coral)' }}> *</span>}
    </label>}
    {children}
    {error && <p style={{ fontSize:11, color:'var(--coral)', marginTop:4 }}>{error}</p>}
  </div>
);
