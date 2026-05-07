import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
          <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
          <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
        </svg>
      ),
    },
    {
      to: '/projects',
      label: 'Projects',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
          <path d="M2 7h20M6 3v4m12-4v4M4 21h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
      ),
    },
  ];

  const initials = user?.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <aside style={{
      width: '230px', height: '100vh', position: 'fixed', left: 0, top: 0,
      background: '#13121E',
      borderRight: '1px solid rgba(167,139,250,0.08)',
      display: 'flex', flexDirection: 'column',
      padding: '20px 14px',
      zIndex: 50,
    }}>
      {/* Glow bg */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(ellipse at top left,rgba(139,92,246,0.1) 0%,transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', marginBottom: '28px' }}>
        <div style={{
          width: '34px', height: '34px',
          background: 'linear-gradient(135deg,#7C3AED,#A855F7)',
          borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 22px rgba(139,92,246,0.5)',
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="18" height="18">
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
        </div>
        <span style={{
          fontSize: '16px', fontWeight: 700, letterSpacing: '-0.3px',
          background: 'linear-gradient(135deg,#C4B5FD,#E9D5FF)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>TaskFlow</span>
      </div>

      {/* Nav label */}
      <div style={{
        fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.18)',
        letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 12px', marginBottom: '4px',
      }}>Workspace</div>

      {/* Nav links */}
      <nav style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        {navLinks.map(link => (
          <NavLink key={link.to} to={link.to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '9px 12px', borderRadius: '10px',
            marginBottom: '2px', fontSize: '13.5px', fontWeight: 500,
            color: isActive ? '#E9D5FF' : 'rgba(255,255,255,0.35)',
            background: isActive ? 'rgba(139,92,246,0.18)' : 'transparent',
            border: isActive ? '1px solid rgba(139,92,246,0.28)' : '1px solid transparent',
            textDecoration: 'none',
            position: 'relative',
            transition: 'all 0.2s',
          })}>
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* User card */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          background: 'rgba(139,92,246,0.07)',
          border: '1px solid rgba(139,92,246,0.15)',
          borderRadius: '12px', padding: '12px',
          display: 'flex', alignItems: 'center', gap: '10px',
          marginBottom: '10px',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'linear-gradient(135deg,#7C3AED,#A855F7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 700, color: '#fff',
            boxShadow: '0 0 14px rgba(139,92,246,0.4)', flexShrink: 0,
          }}>{initials}</div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#E2E2F0' }}>{user?.name}</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '1px' }}>{user?.email}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
