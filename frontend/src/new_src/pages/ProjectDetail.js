import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import API from '../api';

const TaskCard = ({ task, myRole, onStatusChange, onDelete }) => {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
  const isDone = task.status === 'done';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '12px 20px', borderBottom: '1px solid rgba(139,92,246,0.05)',
      transition: 'transform 0.18s cubic-bezier(0.34,1.56,0.64,1), background 0.2s', cursor: 'pointer',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.01) translateX(4px)'; e.currentTarget.style.background = 'rgba(139,92,246,0.05)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.background = ''; }}>
      <div style={{
        width: '17px', height: '17px', borderRadius: '5px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isDone ? 'linear-gradient(135deg,#7C3AED,#A855F7)' : 'transparent',
        border: isDone ? 'none' : '1.5px solid rgba(255,255,255,0.12)',
        boxShadow: isDone ? '0 0 10px rgba(124,58,237,0.45)' : 'none',
      }}>
        {isDone && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" width="10" height="10"><path d="M5 13l4 4L19 7"/></svg>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13.5px', fontWeight: 500, color: isDone ? 'rgba(255,255,255,0.22)' : '#D4D0F0', textDecoration: isDone ? 'line-through' : 'none' }}>
          {task.title}
        </div>
        {task.description && (
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.28)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.description}</div>
        )}
        <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
          {task.assigned_to_name && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>👤 {task.assigned_to_name}</span>}
          <span className={`badge badge-${task.priority}`}>{task.priority}</span>
          {isOverdue && <span style={{ fontSize: '10px', background: 'rgba(239,68,68,0.12)', color: '#FCA5A5', padding: '2px 7px', borderRadius: '20px', fontWeight: 600 }}>⚠ Overdue</span>}
        </div>
      </div>
      {task.due_date && (
        <div style={{ fontSize: '11px', color: isOverdue ? '#F87171' : 'rgba(255,255,255,0.2)', flexShrink: 0 }}>
          {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
      )}
      <select className="input" style={{ width: 'auto', padding: '4px 8px', fontSize: '12px', flexShrink: 0 }}
        value={task.status} onChange={e => onStatusChange(task.id, e.target.value)}
        onClick={e => e.stopPropagation()}>
        <option value="todo">Todo</option>
        <option value="in_progress">In Progress</option>
        <option value="done">Done</option>
      </select>
      {myRole === 'admin' && (
        <button className="btn btn-danger btn-sm" style={{ flexShrink: 0 }}
          onClick={e => { e.stopPropagation(); onDelete(task.id); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
        </button>
      )}
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
      onCreated(res.data); onClose();
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
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
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
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
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
  const progress = tasks.length > 0 ? Math.round(tasks.filter(t => t.status === 'done').length / tasks.length * 100) : 0;

  if (loading) return <Layout><div className="spinner" /></Layout>;
  if (!project) return <Layout><div className="page">Project not found.</div></Layout>;

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        {/* Topbar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 28px', borderBottom: '1px solid rgba(139,92,246,0.08)', flexWrap: 'wrap', gap: '12px',
        }}>
          <div>
            <button className="btn btn-secondary btn-sm" style={{ marginBottom: '8px' }} onClick={() => navigate('/projects')}>
              ← Back to Projects
            </button>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#F0EEFF' }}>{project.name}</div>
            {project.description && <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{project.description}</div>}
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '4px' }}>
              Owner: {project.owner_name} · {project.members?.length} members · Your role:{' '}
              <span className={`badge badge-${myRole}`}>{myRole}</span>
            </div>
          </div>
          {myRole === 'admin' && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary" onClick={() => setShowMemberModal(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                Add Member
              </button>
              <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="13" height="13"><path d="M12 5v14M5 12h14"/></svg>
                Add Task
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '20px 28px', overflowY: 'auto' }} className="fade-in">
          {/* Stats */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {[
              { label: 'Total', value: tasks.length },
              { label: 'Todo', value: tasks.filter(t => t.status === 'todo').length },
              { label: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length },
              { label: 'Done', value: tasks.filter(t => t.status === 'done').length },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding: '10px 18px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '20px', fontWeight: 700, color: '#F0EEFF' }}>{s.value}</span>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.28)' }}>{s.label}</span>
              </div>
            ))}
            <div className="card" style={{ padding: '10px 18px', display: 'flex', gap: '10px', alignItems: 'center', flex: 1, minWidth: '160px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.28)' }}>Progress</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(167,139,250,0.8)' }}>{progress}%</span>
                </div>
                <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'linear-gradient(90deg,#7C3AED,#A855F7)', width: `${progress}%`, borderRadius: '10px', transition: 'width 0.6s ease' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', borderBottom: '1px solid rgba(139,92,246,0.08)' }}>
            {['tasks', 'members'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '10px 20px',
                fontSize: '13.5px', fontWeight: 500,
                color: activeTab === tab ? '#C4B5FD' : 'rgba(255,255,255,0.35)',
                borderBottom: activeTab === tab ? '2px solid #7C3AED' : '2px solid transparent',
                marginBottom: '-1px', transition: 'all 0.2s', fontFamily: 'Space Grotesk, sans-serif',
              }}>
                {tab === 'tasks' ? '📋 Tasks' : '👥 Members'}
              </button>
            ))}
          </div>

          {activeTab === 'tasks' && (
            <div>
              {/* Filter pills */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                {['all', 'todo', 'in_progress', 'done'].map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}>
                    {f === 'all' ? 'All' : f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {filteredTasks.length === 0 ? (
                  <div className="empty-state" style={{ padding: '40px 20px' }}>
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
            </div>
          )}

          {activeTab === 'members' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {project.members?.map((member, idx) => (
                <div key={member.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 20px',
                  borderBottom: idx < project.members.length - 1 ? '1px solid rgba(139,92,246,0.05)' : 'none',
                }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: 'linear-gradient(135deg,#7C3AED,#A855F7)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '13px', color: '#fff',
                      boxShadow: '0 0 10px rgba(139,92,246,0.3)',
                    }}>
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#D4D0F0' }}>
                        {member.name} {member.id === user?.id && <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 400 }}>(you)</span>}
                      </div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)' }}>{member.email}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
