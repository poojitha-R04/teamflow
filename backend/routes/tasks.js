const express = require("express");
const router = express.Router();
const { pool } = require("../db");
const { authenticate } = require("../middleware/auth");

// Helper: check if user is member of project
const isMember = async (projectId, userId) => {
  const result = await pool.query(
    "SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2",
    [projectId, userId],
  );
  return result.rows[0] || null;
};

// GET /api/tasks/project/:projectId — get all tasks in a project
router.get("/project/:projectId", authenticate, async (req, res) => {
  const { projectId } = req.params;
  const member = await isMember(projectId, req.user.id);
  if (!member) return res.status(403).json({ error: "Access denied." });

  try {
    const result = await pool.query(
      `SELECT t.*, 
        u1.name as assigned_to_name, u1.email as assigned_to_email,
        u2.name as created_by_name
       FROM tasks t
       LEFT JOIN users u1 ON u1.id = t.assigned_to
       LEFT JOIN users u2 ON u2.id = t.created_by
       WHERE t.project_id = $1
       ORDER BY 
         CASE t.priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END,
         t.created_at DESC`,
      [projectId],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tasks." });
  }
});

// POST /api/tasks — create task (admin only)
router.post("/", authenticate, async (req, res) => {
  const {
    title,
    description,
    status = "todo",
    priority = "medium",
    due_date,
    project_id,
    assigned_to,
  } = req.body;

  if (!title || !project_id)
    return res
      .status(400)
      .json({ error: "Title and project_id are required." });

  const member = await isMember(project_id, req.user.id);
  if (!member) return res.status(403).json({ error: "Access denied." });
  if (member.role !== "admin")
    return res.status(403).json({ error: "Only admins can create tasks." });

  try {
    const result = await pool.query(
      `INSERT INTO tasks (title, description, status, priority, due_date, project_id, assigned_to, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        title,
        description,
        status,
        priority,
        due_date || null,
        project_id,
        assigned_to || null,
        req.user.id,
      ],
    );

    // Fetch full task with names
    const full = await pool.query(
      `SELECT t.*, u1.name as assigned_to_name, u2.name as created_by_name
       FROM tasks t
       LEFT JOIN users u1 ON u1.id = t.assigned_to
       LEFT JOIN users u2 ON u2.id = t.created_by
       WHERE t.id = $1`,
      [result.rows[0].id],
    );

    res.status(201).json(full.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create task." });
  }
});

// PATCH /api/tasks/:taskId — update task
router.patch("/:taskId", authenticate, async (req, res) => {
  const { taskId } = req.params;
  const { title, description, status, priority, due_date, assigned_to } =
    req.body;

  try {
    const task = await pool.query("SELECT * FROM tasks WHERE id = $1", [
      taskId,
    ]);
    if (!task.rows[0])
      return res.status(404).json({ error: "Task not found." });

    const member = await isMember(task.rows[0].project_id, req.user.id);
    if (!member) return res.status(403).json({ error: "Access denied." });

    // Members can only update status; admins can update everything
    let updateFields, values;
    if (member.role === "member") {
      if (!status)
        return res
          .status(400)
          .json({ error: "Members can only update task status." });
      updateFields = "status = $1, updated_at = NOW()";
      values = [status, taskId];
      await pool.query(
        `UPDATE tasks SET ${updateFields} WHERE id = $2`,
        values,
      );
    } else {
      await pool.query(
        `UPDATE tasks SET
          title = COALESCE($1, title),
          description = COALESCE($2, description),
          status = COALESCE($3, status),
          priority = COALESCE($4, priority),
          due_date = COALESCE($5, due_date),
          assigned_to = $6,
          updated_at = NOW()
         WHERE id = $7`,
        [
          title,
          description,
          status,
          priority,
          due_date || null,
          assigned_to || null,
          taskId,
        ],
      );
    }

    const updated = await pool.query(
      `SELECT t.*, u1.name as assigned_to_name, u2.name as created_by_name
       FROM tasks t
       LEFT JOIN users u1 ON u1.id = t.assigned_to
       LEFT JOIN users u2 ON u2.id = t.created_by
       WHERE t.id = $1`,
      [taskId],
    );

    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update task." });
  }
});

// DELETE /api/tasks/:taskId — delete task (admin only)
router.delete("/:taskId", authenticate, async (req, res) => {
  const { taskId } = req.params;
  try {
    const task = await pool.query("SELECT * FROM tasks WHERE id = $1", [
      taskId,
    ]);
    if (!task.rows[0])
      return res.status(404).json({ error: "Task not found." });

    const member = await isMember(task.rows[0].project_id, req.user.id);
    if (!member || member.role !== "admin")
      return res.status(403).json({ error: "Only admins can delete tasks." });

    await pool.query("DELETE FROM tasks WHERE id = $1", [taskId]);
    res.json({ message: "Task deleted." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete task." });
  }
});

// GET /api/tasks/dashboard — dashboard stats for logged-in user
router.get("/dashboard/stats", authenticate, async (req, res) => {
  try {
    const myTasks = await pool.query(
      `SELECT t.*, p.name as project_name FROM tasks t
       JOIN projects p ON p.id = t.project_id
       WHERE t.assigned_to = $1
       ORDER BY t.due_date ASC NULLS LAST`,
      [req.user.id],
    );

    const overdue = myTasks.rows.filter(
      (t) =>
        t.due_date && new Date(t.due_date) < new Date() && t.status !== "done",
    );

    const stats = {
      total: myTasks.rows.length,
      todo: myTasks.rows.filter((t) => t.status === "todo").length,
      in_progress: myTasks.rows.filter((t) => t.status === "in_progress")
        .length,
      done: myTasks.rows.filter((t) => t.status === "done").length,
      overdue: overdue.length,
    };

    const myProjects = await pool.query(
      `SELECT p.id, p.name, pm.role, COUNT(t.id) as total_tasks, COUNT(CASE WHEN t.status = 'done' THEN 1 END) as done_tasks, COUNT(DISTINCT pm2.user_id) as member_count FROM projects p JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $1 LEFT JOIN tasks t ON t.project_id = p.id LEFT JOIN project_members pm2 ON pm2.project_id = p.id GROUP BY p.id, p.name, pm.role ORDER BY p.created_at DESC`,
      [req.user.id],
    );
    res.json({
      stats,
      tasks: myTasks.rows,
      overdue,
      projects: myProjects.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch dashboard." });
  }
});

module.exports = router;
