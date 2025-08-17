import React, { useState } from 'react';
import { tasksAPI } from '../services/api';

export default function TaskForm() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState('medium');

  const submit = async (e) => {
    e.preventDefault();
    if (!title) return alert('Title required');
    await tasksAPI.create({ title, description: desc, priority });
    setTitle(''); setDesc(''); setPriority('medium');
    // simple refresh by reloading window (small demo)
    window.location.reload();
  };

  return (
    <form className="form" onSubmit={submit}>
      <h3>Create Task</h3>
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" />
      <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Description"></textarea>
      <select value={priority} onChange={e=>setPriority(e.target.value)}>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <button type="submit">Add Task</button>
    </form>
  );
}
