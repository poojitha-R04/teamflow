import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import API from '../api';

const CreateProjectModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await API.post('/projects', form);
      onCreated(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>🚀 New Project</h2>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Project Name *</label>
            <input className="input" placeholder="e.g. Website Redesign"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="input" placeholder="What is this project about?"
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProjectCard = ({ project, onClick }) => {
  const initial = project.name.charAt(0).toUpperCase();
  const progress = project.task_count > 0 ? Math.round((project.done_count || 0) / project.task_count * 100) : 0;

  return (
    <div onClick={onClick} style={{
      background: 'rgba(139,92,246,0.06)',
      border: '1px solid rgba(139,92,246,0.1)',
      borderRadius: '14px', padding: '18px',
      cursor: 'pointer',
      transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1), border-color 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.35)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(124,58,237,0.15)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px',
          background: 'linear-gradient(135deg,#7C3AED,#A855F7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', fontWeight: 700, color: '#fff',
          boxShadow: '0 0 14px rgba(139,92,246,0.3)',
        }}>{initial}</div>
        <span className={`badge badge-${project.role}`}>{project.role}</span>
      </div>
      <div style={{ fontSize: '14px', fontWeight: 600, color: '#D4D0F0', marginBottom: '6px' }}>{project.name}</div>
      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.28)', marginBottom: '16px', minHeight: '32px' }}>
        {project.description || 'No description provided.'}
      </div>
      {/* Progress bar */}
      <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', marginBottom: '10px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: '10px',
          background: 'linear-gradient(90deg,#7C3AED,#A855F7)',
          width: `${progress}%`, transition: 'width 0.6s ease',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255,255,255,0.22)' }}>
        <span>📋 {project.task_count} tasks · 👥 {project.member_count} members</span>
        <span style={{ color: 'rgba(167,139,250,0.7)', fontWeight: 600 }}>{progress}%</span>
      </div>
    </div>
  );
};

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const res = await API.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        {/* Topbar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 28px', borderBottom: '1px solid rgba(139,92,246,0.08)',
        }}>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.5px', color: '#F0EEFF' }}>Projects</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>Manage your team projects and tasks.</div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            New Project
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }} className="fade-in">
          {loading ? <div className="spinner" /> : (
            projects.length === 0 ? (
              <div className="empty-state">
                <div className="icon">📁</div>
                <h3>No projects yet</h3>
                <p>Create your first project to get started.</p>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>Create Project</button>
              </div>
            ) : (
              <div className="grid-2">
                {projects.map(project => (
                  <ProjectCard key={project.id} project={project}
                    onClick={() => navigate(`/projects/${project.id}`)} />
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onCreated={(p) => setProjects([p, ...projects])}
        />
      )}
    </Layout>
  );
};

export default Projects;
