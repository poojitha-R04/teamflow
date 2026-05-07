import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import API from '../api';

const StatCard = ({ icon, label, value, glowClass, pillLabel, pillClass }) => (
  <div className="card" style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1), border-color 0.2s, box-shadow 0.2s' }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.07) translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)'; e.currentTarget.style.boxShadow = '0 14px 36px rgba(124,58,237,0.18)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}>
    {/* Glow orb */}
    <div className={`stat-glow-orb ${glowClass}`} style={{
      position: 'absolute', top: '-30px', right: '-30px', width: '90px', height: '90px',
      borderRadius: '50%', opacity: 0.45, pointerEvents: 'none',
    }} />
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '10px',
        background: glowClass === 'glow-purple' ? 'rgba(124,58,237,0.18)'
          : glowClass === 'glow-violet' ? 'rgba(168,85,247,0.18)'
          : glowClass === 'glow-green' ? 'rgba(16,185,129,0.15)'
          : 'rgba(239,68,68,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{icon}</div>
      <span style={{
        fontSize: '10px', fontWeight: 600, padding: '3px 8px', borderRadius: '20px',
        background: pillClass === 'up' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
        color: pillClass === 'up' ? '#34D399' : '#F87171',
      }}>{pillLabel}</span>
    </div>
    <div style={{ fontSize: '30px', fontWeight: 700, letterSpacing: '-1.5px', color: '#F0EEFF', lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.28)', marginTop: '4px' }}>{label}</div>
  </div>
);

const TaskRow = ({ task, onStatusChange }) => {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
  const isDone = task.status === 'done';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '12px 20px', borderBottom: '1px solid rgba(139,92,246,0.05)',
      transition: 'transform 0.18s cubic-bezier(0.34,1.56,0.64,1), background 0.2s', cursor: 'pointer',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02) translateX(4px)'; e.currentTarget.style.background = 'rgba(139,92,246,0.05)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.background = ''; }}>
      {/* Checkbox */}
      <div style={{
        width: '17px', height: '17px', borderRadius: '5px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isDone ? 'linear-gradient(135deg,#7C3AED,#A855F7)' : 'transparent',
        border: isDone ? 'none' : '1.5px solid rgba(255,255,255,0.12)',
        boxShadow: isDone ? '0 0 10px rgba(124,58,237,0.45)' : 'none',
      }}>
        {isDone && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" width="10" height="10"><path d="M5 13l4 4L19 7"/></svg>}
      </div>
      {/* Body */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '13.5px', fontWeight: 500, color: isDone ? 'rgba(255,255,255,0.22)' : '#D4D0F0', textDecoration: isDone ? 'line-through' : 'none' }}>
          {task.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
          {task.project_name && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>📁 {task.project_name}</span>}
          <span className={`badge badge-${task.priority}`}>{task.priority}</span>
          <span className={`badge badge-${task.status}`}>{task.status === 'in_progress' ? 'In Progress' : task.status}</span>
          {isOverdue && <span style={{ fontSize: '10px', background: 'rgba(239,68,68,0.12)', color: '#FCA5A5', padding: '2px 7px', borderRadius: '20px', fontWeight: 600 }}>⚠ Overdue</span>}
        </div>
      </div>
      {task.due_date && (
        <div style={{ fontSize: '11px', color: isOverdue ? '#F87171' : 'rgba(255,255,255,0.2)', flexShrink: 0 }}>
          {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
      )}
      <select
        className="input"
        style={{ width: 'auto', padding: '4px 8px', fontSize: '12px' }}
        value={task.status}
        onChange={e => onStatusChange(task.id, e.target.value)}
        onClick={e => e.stopPropagation()}
      >
        <option value="todo">Todo</option>
        <option value="in_progress">In Progress</option>
        <option value="done">Done</option>
      </select>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const firstName = user?.name?.split(' ')[0] || 'there';

  const fetchData = async () => {
    try {
      const res = await API.get('/tasks/dashboard/stats');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await API.patch(`/tasks/${taskId}`, { status: newStatus });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        {/* Topbar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 28px', borderBottom: '1px solid rgba(139,92,246,0.08)',
        }}>
          <div style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.5px', color: '#F0EEFF' }}>
            Good {greeting},{' '}
            <span style={{ background: 'linear-gradient(135deg,#C4B5FD,#A855F7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {firstName}
            </span>{' '}👋
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              Search
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/projects')}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
              New Task
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }} className="fade-in">
          {loading ? <div className="spinner" /> : (
            <>
              {/* Stat cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '24px' }}>
                <StatCard
                  icon={<svg viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" width="17" height="17"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>}
                  label="Total Tasks" value={data.stats.total} glowClass="glow-purple" pillLabel="All tasks" pillClass="up"
                />
                <StatCard
                  icon={<svg viewBox="0 0 24 24" fill="none" stroke="#C084FC" strokeWidth="2" width="17" height="17"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>}
                  label="In Progress" value={data.stats.in_progress} glowClass="glow-violet" pillLabel="Active" pillClass="up"
                />
                <StatCard
                  icon={<svg viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2" width="17" height="17"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>}
                  label="Completed" value={data.stats.done} glowClass="glow-green" pillLabel="Done" pillClass="up"
                />
                <StatCard
                  icon={<svg viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2" width="17" height="17"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>}
                  label="Overdue" value={data.stats.overdue} glowClass="glow-red" pillLabel="Urgent" pillClass="dn"
                />
              </div>

              {/* Tasks panel */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '14px' }}>
                {/* My Tasks */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 20px', borderBottom: '1px solid rgba(139,92,246,0.07)',
                  }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#E2E2F0' }}>My Tasks</span>
                    <span style={{ fontSize: '12px', color: 'rgba(167,139,250,0.8)', cursor: 'pointer' }}
                      onClick={() => navigate('/projects')}>View all →</span>
                  </div>
                  {data.tasks.length === 0 ? (
                    <div className="empty-state" style={{ padding: '40px 20px' }}>
                      <div className="icon">🎉</div>
                      <h3>No tasks yet</h3>
                      <p>Join a project to get started.</p>
                      <button className="btn btn-primary" onClick={() => navigate('/projects')}>Browse Projects</button>
                    </div>
                  ) : (
                    [...(data.overdue || []), ...data.tasks.filter(t => !data.overdue?.find(o => o.id === t.id))]
                      .slice(0, 8)
                      .map(task => <TaskRow key={task.id} task={task} onStatusChange={handleStatusChange} />)
                  )}
                </div>

                {/* Stats summary panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Progress overview */}
                  <div className="card">
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#E2E2F0', marginBottom: '16px' }}>Overview</div>
                    {[
                      { label: 'Todo', value: data.stats.todo, total: data.stats.total, color: 'rgba(255,255,255,0.2)' },
                      { label: 'In Progress', value: data.stats.in_progress, total: data.stats.total, color: '#A855F7' },
                      { label: 'Done', value: data.stats.done, total: data.stats.total, color: '#10B981' },
                    ].map(item => (
                      <div key={item.label} style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>{item.label}</span>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: item.color }}>{item.value}</span>
                        </div>
                        <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: '10px', background: item.color,
                            width: item.total > 0 ? `${Math.round((item.value / item.total) * 100)}%` : '0%',
                            transition: 'width 0.6s ease',
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick actions */}
                  <div className="card">
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#E2E2F0', marginBottom: '14px' }}>Quick Actions</div>
                    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: '8px' }}
                      onClick={() => navigate('/projects')}>
                      + New Project
                    </button>
                    <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}
                      onClick={() => navigate('/projects')}>
                      View Projects →
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
