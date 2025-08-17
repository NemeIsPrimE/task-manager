import React from 'react';
import { tasksAPI } from '../services/api';

export default function TaskItem({ task, onChange }) {
  const toggle = async () => {
    await tasksAPI.update(task.id, { completed: !task.completed });
    onChange && onChange();
  };
  const remove = async () => {
    if (!confirm('Delete this task?')) return;
    await tasksAPI.remove(task.id);
    onChange && onChange();
  };
  return (
    <div className="task">
      <div style={{display:'flex', justifyContent:'space-between'}}>
        <strong>{task.title}</strong>
        <div>
          <button onClick={toggle}>{task.completed ? 'Undo' : 'Done'}</button>{' '}
          <button onClick={remove}>Delete</button>
        </div>
      </div>
      <div className="meta">{task.priority} • {task.createdAt && new Date(task.createdAt).toLocaleString()}</div>
      {task.description && <div style={{marginTop:8}}>{task.description}</div>}
    </div>
  );
}
