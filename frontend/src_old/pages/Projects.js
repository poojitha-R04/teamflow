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
          <div className="flex gap-8" style={{ justifyContent: 'flex-end', marginTop: '8px' }}>
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

const ProjectCard = ({ project, onClick }) => (
  <div className="card" onClick={onClick} style={{ cursor: 'pointer', transition: 'all 0.2s' }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
    <div className="flex-between" style={{ marginBottom: '12px' }}>
      <div style={{
        width: 40, height: 40, borderRadius: '10px',
        background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '18px', fontWeight: 800, color: 'white', fontFamily: 'Syne, sans-serif',
      }}>
        {project.name.charAt(0).toUpperCase()}
      </div>
      <span className={`badge badge-${project.role}`}>{project.role}</span>
    </div>
    <h3 style={{ fontSize: '15px', marginBottom: '6px' }}>{project.name}</h3>
    <p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '16px', minHeight: '36px' }}>
      {project.description || 'No description provided.'}
    </p>
    <div className="flex gap-16" style={{ fontSize: '12px', color: 'var(--text3)' }}>
      <span>📋 {project.task_count} tasks</span>
      <span>👥 {project.member_count} members</span>
    </div>
  </div>
);

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
      <div className="page fade-in">
        <div className="page-header flex-between">
          <div>
            <h1>Projects</h1>
            <p>Manage your team projects and tasks.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + New Project
          </button>
        </div>

        {loading ? <div className="spinner" /> : (
          projects.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📁</div>
              <h3>No projects yet</h3>
              <p>Create your first project to get started.</p>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                Create Project
              </button>
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

        {showModal && (
          <CreateProjectModal
            onClose={() => setShowModal(false)}
            onCreated={(p) => setProjects([p, ...projects])}
          />
        )}
      </div>
    </Layout>
  );
};

export default Projects;
