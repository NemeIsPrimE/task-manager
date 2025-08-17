import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

// For ES modules __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({ origin: true }));
app.use(express.json());
app.use(morgan('dev'));

// In-memory stores
const users = [];
const tasks = new Map(); // userId -> array of tasks

// Seed demo user
(function seed() {
  const demoEmail = 'demo@taskapp.local';
  if (!users.find(u => u.email === demoEmail)) {
    const id = uuidv4();
    users.push({
      id,
      username: 'Demo User',
      email: demoEmail,
      passwordHash: bcrypt.hashSync('demopassword', 10),
      createdAt: new Date().toISOString()
    });
    tasks.set(id, [
      {
        id: uuidv4(),
        title: 'Welcome task',
        description: 'This is a seeded demo task',
        priority: 'medium',
        dueDate: null,
        completed: false,
        createdAt: new Date().toISOString()
      }
    ]);
  }
})();

function createToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, username: user.username },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || '';
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'Missing token' });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', time: new Date().toISOString() });
});

// Auth routes
app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body || {};
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email, password required' });
  }
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  const id = uuidv4();
  const user = {
    id,
    username,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    createdAt: new Date().toISOString()
  };
  users.push(user);
  tasks.set(id, []);
  const token = createToken(user);
  res.status(201).json({
    token,
    user: { id: user.id, username: user.username, email: user.email }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = bcrypt.compareSync(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = createToken(user);
  res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.user.sub);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    }
  });
});

// Tasks CRUD
app.get('/api/tasks', authMiddleware, (req, res) => {
  const list = tasks.get(req.user.sub) || [];
  res.json({ tasks: list });
});

app.post('/api/tasks', authMiddleware, (req, res) => {
  const { title, description = '', priority = 'medium', dueDate = null } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title required' });
  const newTask = {
    id: uuidv4(),
    title,
    description,
    priority,
    dueDate,
    completed: false,
    createdAt: new Date().toISOString()
  };
  const list = tasks.get(req.user.sub) || [];
  list.unshift(newTask);
  tasks.set(req.user.sub, list);
  res.status(201).json({ task: newTask });
});

app.put('/api/tasks/:id', authMiddleware, (req, res) => {
  const id = req.params.id;
  const list = tasks.get(req.user.sub) || [];
  const idx = list.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Task not found' });
  const updated = { ...list[idx], ...req.body, updatedAt: new Date().toISOString() };
  list[idx] = updated;
  tasks.set(req.user.sub, list);
  res.json({ task: updated });
});

app.delete('/api/tasks/:id', authMiddleware, (req, res) => {
  const id = req.params.id;
  const list = tasks.get(req.user.sub) || [];
  const newList = list.filter(t => t.id !== id);
  tasks.set(req.user.sub, newList);
  res.status(204).send();
});

app.get('/api/tasks/analytics/stats', authMiddleware, (req, res) => {
  const list = tasks.get(req.user.sub) || [];
  const total = list.length;
  const completed = list.filter(t => t.completed).length;
  const pending = total - completed;
  const highPriority = list.filter(t => t.priority === 'high' && !t.completed).length;
  const overdue = list.filter(
    t => t.dueDate && new Date(t.dueDate) < new Date() && !t.completed
  ).length;
  res.json({ total, completed, pending, highPriority, overdue });
});

// ✅ Serve frontend (React build)
app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// 404 fallback (for API only, after React catch-all)
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () =>
  console.log(`Backend + Frontend running on http://localhost:${PORT}`)
);
