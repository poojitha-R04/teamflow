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

  return (
    <aside style={{
      width: '240px', height: '100vh', position: 'fixed', left: 0, top: 0,
      background: 'var(--surface)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', padding: '24px 16px',
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '32px', paddingLeft: '8px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'Syne, sans-serif' }}>
          <span style={{ color: 'var(--accent)' }}>Team</span>Flow
        </h1>
        <p style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>Task Manager</p>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1 }}>
        {[
          { to: '/dashboard', icon: '📊', label: 'Dashboard' },
          { to: '/projects', icon: '📁', label: 'Projects' },
        ].map(link => (
          <NavLink key={link.to} to={link.to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: 'var(--radius-sm)',
            marginBottom: '4px', fontSize: '14px', fontWeight: '500',
            color: isActive ? 'var(--text)' : 'var(--text2)',
            background: isActive ? 'var(--surface2)' : 'transparent',
            transition: 'all 0.2s',
            textDecoration: 'none',
          })}>
            <span>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div style={{
        borderTop: '1px solid var(--border)', paddingTop: '16px',
        display: 'flex', flexDirection: 'column', gap: '8px',
      }}>
        <div style={{ padding: '8px 12px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600 }}>{user?.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>{user?.email}</div>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary btn-sm"
          style={{ justifyContent: 'center' }}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
