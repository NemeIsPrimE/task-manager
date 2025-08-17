import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import { tasksAPI } from '../services/api';

export default function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <div>
      <div className="header">
        <h1>Welcome, {user?.username || user?.email}</h1>
        <div>
          <button onClick={logout}>Logout</button>
        </div>
      </div>
      <TaskForm />
      <TaskList />
      <div style={{marginTop:20}}>
        <button onClick={async ()=>{ const s = await tasksAPI.stats(); alert(JSON.stringify(s.data)); }}>Show stats</button>
      </div>
    </div>
  );
}
