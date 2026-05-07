import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div style={{ display: 'flex', background: '#0F0E17', minHeight: '100vh' }}>
      <div className="sidebar-wrap"><Sidebar /></div>
      <main className="main-content" style={{ marginLeft: '230px', flex: 1, minHeight: '100vh', position: 'relative' }}>
        {/* Ambient glows */}
        <div style={{
          position: 'fixed', top: '-80px', right: '-80px', width: '480px', height: '480px',
          background: 'radial-gradient(circle,rgba(124,58,237,0.07) 0%,transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />
        <div style={{
          position: 'fixed', bottom: '-80px', left: '310px', width: '360px', height: '360px',
          background: 'radial-gradient(circle,rgba(168,85,247,0.05) 0%,transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
