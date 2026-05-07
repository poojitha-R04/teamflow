import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import API from '../api';

const TaskCard = ({ task, myRole, onStatusChange, onDelete }) => {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
  return (
    <div className="card" style={{ marginBottom: '10px', padding: '14px 18px' }}>
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ flex: 1, minWidth: '180px' }}>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>{task.title}</div>
          {task.description && (
            <div style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '6px' }}>{task.description}</div>
          )}
          <div style={{ fontSize: '12px', color: 'var(--text2)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {task.assigned_to_name && <span>👤 {task.assigned_to_name}</span>}
            {task.due_date && (
              <span style={{ color: isOverdue ? 'var(--danger)' : 'var(--text2)' }}>
                📅 {isOverdue ? '⚠ ' : ''}{new Date(task.due_date).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-8" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <span className={`badge badge-${task.priority}`}>{task.priority}</span>
          <select className="input" style={{ width: 'auto', padding: '4px 8px', fontSize: '12px' }}
            value={task.status} onChange={e => onStatusChange(task.id, e.target.value)}>
            <option value="todo">📝 Todo</option>
            <option value="in_progress">🔄 In Progress</option>
            <option value="done">✅ Done</option>
          </select>
          {myRole === 'admin' && (
            <button className="btn btn-danger btn-sm" onClick={() => onDelete(task.id)}>🗑</button>
          )}
        </div>
      </div>
    </div>
  );
};

const CreateTaskModal = ({ projectId, members, onClose, onCreated }) => {
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', status: 'todo', due_date: '', assigned_to: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await API.post('/tasks', { ...form, project_id: projectId, assigned_to: form.assigned_to || null });
      onCreated(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create task.');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>📋 New Task</h2>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Task Title *</label>
            <input className="input" placeholder="e.g. Design landing page"
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="input" placeholder="Task details..."
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>Priority</label>
              <select className="input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="todo">📝 Todo</option>
                <option value="in_progress">🔄 In Progress</option>
                <option value="done">✅ Done</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>Due Date</label>
              <input className="input" type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Assign To</label>
              <select className="input" value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })}>
                <option value="">Unassigned</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-8" style={{ justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddMemberModal = ({ projectId, onClose, onAdded }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await API.post(`/projects/${projectId}/members`, { email, role });
      onAdded(); onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add member.');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>👥 Add Member</h2>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Member Email *</label>
            <input className="input" type="email" placeholder="teammate@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select className="input" value={role} onChange={e => setRole(e.target.value)}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-8" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Adding...' : 'Add Member'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProjectDetail = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchProject = useCallback(async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        API.get(`/projects/${projectId}`),
        API.get(`/tasks/project/${projectId}`),
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      if (err.response?.status === 403) navigate('/projects');
    } finally { setLoading(false); }
  }, [projectId, navigate]);

  useEffect(() => { fetchProject(); }, [fetchProject]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const updated = await API.patch(`/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => t.id === taskId ? updated.data : t));
    } catch (err) { alert(err.response?.data?.error || 'Failed to update.'); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await API.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err) { alert('Failed to delete task.'); }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await API.delete(`/projects/${projectId}/members/${memberId}`);
      fetchProject();
    } catch (err) { alert(err.response?.data?.error || 'Failed to remove.'); }
  };

  const filteredTasks = tasks.filter(t => filter === 'all' || t.status === filter);
  const myRole = project?.my_role;

  if (loading) return <Layout><div className="spinner" /></Layout>;
  if (!project) return <Layout><div className="page">Project not found.</div></Layout>;

  return (
    <Layout>
      <div className="page fade-in">
        <div style={{ marginBottom: '28px' }}>
          <button className="btn btn-secondary btn-sm" style={{ marginBottom: '16px' }} onClick={() => navigate('/projects')}>
            ← Back to Projects
          </button>
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontSize: '26px' }}>{project.name}</h1>
              {project.description && <p style={{ color: 'var(--text2)', marginTop: '4px' }}>{project.description}</p>}
              <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text3)' }}>
                Owner: {project.owner_name} · {project.members?.length} members · Your role: <strong>{myRole}</strong>
              </div>
            </div>
            {myRole === 'admin' && (
              <div className="flex gap-8">
                <button className="btn btn-secondary" onClick={() => setShowMemberModal(true)}>👥 Add Member</button>
                <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>+ Add Task</button>
              </div>
            )}
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {[
            { label: 'Total', value: tasks.length, color: 'var(--text2)' },
            { label: 'Todo', value: tasks.filter(t => t.status === 'todo').length, color: 'var(--text2)' },
            { label: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: 'var(--warning)' },
            { label: 'Done', value: tasks.filter(t => t.status === 'done').length, color: 'var(--success)' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '12px 20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '20px', fontWeight: 800, color: s.color, fontFamily: 'Syne, sans-serif' }}>{s.value}</span>
              <span style={{ fontSize: '12px', color: 'var(--text2)' }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid var(--border)' }}>
          {['tasks', 'members'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '10px 20px',
              fontSize: '14px', fontWeight: 500,
              color: activeTab === tab ? 'var(--accent)' : 'var(--text2)',
              borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: '-1px', transition: 'all 0.2s',
            }}>
              {tab === 'tasks' ? '📋 Tasks' : '👥 Members'}
            </button>
          ))}
        </div>

        {activeTab === 'tasks' && (
          <div>
            <div className="flex gap-8" style={{ marginBottom: '16px', flexWrap: 'wrap' }}>
              {['all', 'todo', 'in_progress', 'done'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}>
                  {f === 'all' ? 'All' : f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            {filteredTasks.length === 0 ? (
              <div className="empty-state">
                <div className="icon">📋</div>
                <h3>No tasks {filter !== 'all' ? `with status "${filter}"` : 'yet'}</h3>
                {myRole === 'admin' && (
                  <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>Create First Task</button>
                )}
              </div>
            ) : filteredTasks.map(task => (
              <TaskCard key={task.id} task={task} myRole={myRole}
                onStatusChange={handleStatusChange} onDelete={handleDeleteTask} />
            ))}
          </div>
        )}

        {activeTab === 'members' && (
          <div>
            {project.members?.map(member => (
              <div key={member.id} className="card flex-between" style={{ marginBottom: '10px', padding: '14px 18px' }}>
                <div className="flex gap-12 flex-center">
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '14px', color: 'white',
                  }}>
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>
                      {member.name} {member.id === user?.id && <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(you)</span>}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text2)' }}>{member.email}</div>
                  </div>
                </div>
                <div className="flex gap-8 flex-center">
                  <span className={`badge badge-${member.role}`}>{member.role}</span>
                  {myRole === 'admin' && member.id !== user?.id && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleRemoveMember(member.id)}>Remove</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showTaskModal && (
        <CreateTaskModal projectId={projectId} members={project.members || []}
          onClose={() => setShowTaskModal(false)} onCreated={(task) => setTasks([task, ...tasks])} />
      )}
      {showMemberModal && (
        <AddMemberModal projectId={projectId}
          onClose={() => setShowMemberModal(false)} onAdded={fetchProject} />
      )}
    </Layout>
  );
};

export default ProjectDetail;
