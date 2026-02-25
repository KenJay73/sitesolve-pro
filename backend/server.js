import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Initialize SQLite database with better-sqlite3
const dbPath = path.join(__dirname, 'database.db');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    icon TEXT,
    color TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS problems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    category_id INTEGER,
    category TEXT,
    priority TEXT NOT NULL DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'open',
    location TEXT,
    reportedBy TEXT,
    assignedTo TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolvedAt DATETIME,
    estimatedCost REAL,
    actualCost REAL,
    notes TEXT,
    FOREIGN KEY(category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS updates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    problemId INTEGER NOT NULL,
    message TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (problemId) REFERENCES problems(id) ON DELETE CASCADE
  );
`);

// Insert default categories
const defaultCategories = [
  { name: 'Safety Issues', icon: '⚠️', color: 'red' },
  { name: 'Material Delays', icon: '📦', color: 'orange' },
  { name: 'Equipment Failure', icon: '⚙️', color: 'yellow' },
  { name: 'Labor Shortage', icon: '👷', color: 'blue' },
  { name: 'Weather-Related', icon: '🌧️', color: 'cyan' },
  { name: 'Design Issues', icon: '📐', color: 'purple' },
  { name: 'Quality Control', icon: '✓', color: 'green' },
  { name: 'Site Access', icon: '🚧', color: 'pink' },
  { name: 'Communication', icon: '📞', color: 'indigo' },
  { name: 'Budget/Cost', icon: '💰', color: 'emerald' },
];

for (const category of defaultCategories) {
  try {
    db.prepare('INSERT INTO categories (name, icon, color) VALUES (?, ?, ?)').run(
      category.name,
      category.icon,
      category.color
    );
  } catch (e) {
    // Category already exists
  }
}

// ===== CATEGORIES =====
app.get('/api/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== PROBLEMS/ISSUES =====
app.get('/api/problems', (req, res) => {
  try {
    const { status, priority, category, category_id, search } = req.query;
    let query = 'SELECT * FROM problems WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (category_id) {
      query += ' AND category_id = ?';
      params.push(category_id);
    }
    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ? OR location LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY priority DESC, createdAt DESC';
    const problems = db.prepare(query).all(...params);
    res.json(problems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/problems/:id', (req, res) => {
  try {
    const problem = db.prepare('SELECT * FROM problems WHERE id = ?').get(req.params.id);

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const updates = db.prepare('SELECT * FROM updates WHERE problemId = ? ORDER BY createdAt DESC').all(req.params.id);
    problem.updates = updates;

    res.json(problem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/problems', (req, res) => {
  try {
    const { title, description, category, category_id, priority, status, location, reportedBy, assignedTo, estimatedCost, notes } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = db.prepare(`
      INSERT INTO problems (title, description, category, category_id, priority, status, location, reportedBy, assignedTo, estimatedCost, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(title, description || '', category || '', category_id, priority || 'medium', status || 'open', location || '', reportedBy || 'Anonymous', assignedTo || '', estimatedCost || 0, notes || '');

    const newProblem = db.prepare('SELECT * FROM problems WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newProblem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/problems/:id', (req, res) => {
  try {
    const { title, description, category, category_id, priority, status, location, assignedTo, actualCost, notes, resolvedAt } = req.body;
    
    const updates = [];
    const values = [];

    if (title !== undefined) { updates.push('title = ?'); values.push(title); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (category !== undefined) { updates.push('category = ?'); values.push(category); }
    if (category_id !== undefined) { updates.push('category_id = ?'); values.push(category_id); }
    if (priority !== undefined) { updates.push('priority = ?'); values.push(priority); }
    if (status !== undefined) { updates.push('status = ?'); values.push(status); }
    if (location !== undefined) { updates.push('location = ?'); values.push(location); }
    if (assignedTo !== undefined) { updates.push('assignedTo = ?'); values.push(assignedTo); }
    if (actualCost !== undefined) { updates.push('actualCost = ?'); values.push(actualCost); }
    if (notes !== undefined) { updates.push('notes = ?'); values.push(notes); }
    if (resolvedAt !== undefined) { updates.push('resolvedAt = ?'); values.push(resolvedAt); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(req.params.id);

    const query = `UPDATE problems SET ${updates.join(', ')} WHERE id = ?`;
    db.prepare(query).run(...values);

    const updatedProblem = db.prepare('SELECT * FROM problems WHERE id = ?').get(req.params.id);
    res.json(updatedProblem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/problems/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM problems WHERE id = ?').run(req.params.id);
    res.json({ message: 'Problem deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/problems/:id/updates', (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = db.prepare('INSERT INTO updates (problemId, message) VALUES (?, ?)').run(req.params.id, message);
    const newUpdate = db.prepare('SELECT * FROM updates WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newUpdate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== ANALYTICS =====
app.get('/api/statistics', (req, res) => {
  try {
    const statusData = db.prepare('SELECT COUNT(*) as total, status FROM problems GROUP BY status').all();
    const priorityData = db.prepare('SELECT COUNT(*) as total, priority FROM problems GROUP BY priority').all();
    
    res.json({
      byStatus: statusData,
      byPriority: priorityData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Civil Engineer Productivity Tool - Backend running on http://0.0.0.0:${PORT}`);
});