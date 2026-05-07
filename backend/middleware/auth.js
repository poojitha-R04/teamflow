const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, name, email }
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

// Check if user is admin of a project
const requireProjectAdmin = async (req, res, next) => {
  const { pool } = require('../db');
  const projectId = req.params.projectId || req.body.project_id;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2`,
      [projectId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'You are not a member of this project.' });
    }

    if (result.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required.' });
    }

    next();
  } catch (err) {
    res.status(500).json({ error: 'Server error checking permissions.' });
  }
};

module.exports = { authenticate, requireProjectAdmin };
