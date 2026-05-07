const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticate, requireProjectAdmin } = require('../middleware/auth');

// GET /api/projects — get all projects for logged-in user
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, pm.role, u.name as owner_name,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as task_count,
        (SELECT COUNT(*) FROM project_members pm2 WHERE pm2.project_id = p.id) as member_count
       FROM projects p
       JOIN project_members pm ON pm.project_id = p.id
       JOIN users u ON u.id = p.owner_id
       WHERE pm.user_id = $1
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch projects.' });
  }
});

// POST /api/projects — create new project
router.post('/', authenticate, async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Project name is required.' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const proj = await client.query(
      'INSERT INTO projects (name, description, owner_id) VALUES ($1, $2, $3) RETURNING *',
      [name, description, req.user.id]
    );

    // Creator is automatically admin
    await client.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
      [proj.rows[0].id, req.user.id, 'admin']
    );

    await client.query('COMMIT');
    res.status(201).json(proj.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to create project.' });
  } finally {
    client.release();
  }
});

// GET /api/projects/:projectId — get project details
router.get('/:projectId', authenticate, async (req, res) => {
  const { projectId } = req.params;
  try {
    // Check membership
    const memberCheck = await pool.query(
      'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, req.user.id]
    );
    if (memberCheck.rows.length === 0)
      return res.status(403).json({ error: 'Access denied.' });

    const project = await pool.query(
      `SELECT p.*, u.name as owner_name FROM projects p
       JOIN users u ON u.id = p.owner_id WHERE p.id = $1`,
      [projectId]
    );

    const members = await pool.query(
      `SELECT u.id, u.name, u.email, pm.role, pm.joined_at
       FROM project_members pm JOIN users u ON u.id = pm.user_id
       WHERE pm.project_id = $1`,
      [projectId]
    );

    res.json({ ...project.rows[0], members: members.rows, my_role: memberCheck.rows[0].role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch project.' });
  }
});

// DELETE /api/projects/:projectId — delete project (admin only)
router.delete('/:projectId', authenticate, requireProjectAdmin, async (req, res) => {
  const { projectId } = req.params;
  try {
    // Only owner can delete
    const proj = await pool.query('SELECT owner_id FROM projects WHERE id = $1', [projectId]);
    if (!proj.rows[0] || proj.rows[0].owner_id !== req.user.id)
      return res.status(403).json({ error: 'Only the project owner can delete.' });

    await pool.query('DELETE FROM projects WHERE id = $1', [projectId]);
    res.json({ message: 'Project deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete project.' });
  }
});

// POST /api/projects/:projectId/members — add member (admin only)
router.post('/:projectId/members', authenticate, requireProjectAdmin, async (req, res) => {
  const { projectId } = req.params;
  const { email, role = 'member' } = req.body;

  if (!email) return res.status(400).json({ error: 'Email is required.' });

  try {
    const user = await pool.query('SELECT id, name, email FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0)
      return res.status(404).json({ error: 'No user found with that email.' });

    const existing = await pool.query(
      'SELECT id FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, user.rows[0].id]
    );
    if (existing.rows.length > 0)
      return res.status(409).json({ error: 'User is already a member.' });

    await pool.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
      [projectId, user.rows[0].id, role]
    );

    res.status(201).json({ message: 'Member added.', user: user.rows[0], role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add member.' });
  }
});

// DELETE /api/projects/:projectId/members/:userId — remove member (admin only)
router.delete('/:projectId/members/:userId', authenticate, requireProjectAdmin, async (req, res) => {
  const { projectId, userId } = req.params;
  try {
    await pool.query('DELETE FROM project_members WHERE project_id = $1 AND user_id = $2', [projectId, userId]);
    res.json({ message: 'Member removed.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove member.' });
  }
});

module.exports = router;
