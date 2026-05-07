import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import API from '../api';

const StatCard = ({ icon, label, value, color }) => (
  <div className="card" style={{ borderLeft: `3px solid ${color}` }}>
    <div style={{ fontSize: '28px', marginBottom: '8px' }}>{icon}</div>
    <div style={{ fontSize: '32px', fontWeight: 800, color, fontFamily: 'Syne, sans-serif' }}>{value}</div>
    <div style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '4px' }}>{label}</div>
  </div>
);

const TaskRow = ({ task, onStatusChange }) => {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
  return (
    <div className="card" style={{ marginBottom: '10px', padding: '14px 18px' }}>
      <div className="flex-between">
        <div>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>{task.title}</div>
          <div style={{ fontSize: '12px', color: 'var(--text2)' }}>
            📁 {task.project_name}
            {task.due_date && (
              <span style={{ marginLeft: '12px', color: isOverdue ? 'var(--danger)' : 'var(--text2)' }}>
                📅 {isOverdue ? '⚠ Overdue: ' : ''}{new Date(task.due_date).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-8">
          <span className={`badge badge-${task.priority}`}>{task.priority}</span>
          <select
            className="input"
            style={{ width: 'auto', padding: '4px 8px', fontSize: '12px' }}
            value={task.status}
            onChange={e => onStatusChange(task.id, e.target.value)}
          >
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
      <div className="page fade-in">
        <div className="page-header">
          <h1>Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.name?.split(' ')[0]} 👋</h1>
          <p>Here's what's happening with your tasks today.</p>
        </div>

        {loading ? <div className="spinner" /> : (
          <>
            {/* Stat cards */}
            <div className="grid-3" style={{ marginBottom: '32px' }}>
              <StatCard icon="📋" label="Total Tasks" value={data.stats.total} color="var(--accent)" />
              <StatCard icon="🔄" label="In Progress" value={data.stats.in_progress} color="var(--warning)" />
              <StatCard icon="✅" label="Completed" value={data.stats.done} color="var(--success)" />
              <StatCard icon="📝" label="Todo" value={data.stats.todo} color="var(--text2)" />
              <StatCard icon="⚠️" label="Overdue" value={data.stats.overdue} color="var(--danger)" />
            </div>

            {/* Overdue tasks */}
            {data.overdue.length > 0 && (
              <div style={{ marginBottom: '28px' }}>
                <h2 style={{ marginBottom: '14px', fontSize: '16px', color: 'var(--danger)' }}>
                  ⚠️ Overdue Tasks ({data.overdue.length})
                </h2>
                {data.overdue.map(task => (
                  <TaskRow key={task.id} task={task} onStatusChange={handleStatusChange} />
                ))}
              </div>
            )}

            {/* All tasks */}
            <div>
              <h2 style={{ marginBottom: '14px', fontSize: '16px' }}>
                🗂 My Tasks ({data.tasks.length})
              </h2>
              {data.tasks.length === 0 ? (
                <div className="empty-state">
                  <div className="icon">🎉</div>
                  <h3>No tasks assigned yet</h3>
                  <p>Join a project or wait for your admin to assign tasks.</p>
                  <button className="btn btn-primary" onClick={() => navigate('/projects')}>
                    Browse Projects
                  </button>
                </div>
              ) : (
                data.tasks.map(task => (
                  <TaskRow key={task.id} task={task} onStatusChange={handleStatusChange} />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
