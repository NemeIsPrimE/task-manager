import React, { useEffect, useState } from 'react';
import { tasksAPI } from '../services/api';
import TaskItem from './TaskItem';

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    tasksAPI.list().then(res=>{ setTasks(res.data.tasks); }).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  if (loading) return <div>Loading tasks...</div>;
  if (!tasks.length) return <div>No tasks yet.</div>;

  return (
    <div style={{marginTop:16}}>
      {tasks.map(t => <TaskItem key={t.id} task={t} onChange={()=>window.location.reload()} />)}
    </div>
  );
}
