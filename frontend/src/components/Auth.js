import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Auth() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('demo@taskapp.local');
  const [password, setPassword] = useState('demopassword');
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(username || 'New User', email, password);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed');
    }
  };

  return (
    <div>
      <div className="header">
        <h1>Task Manager</h1>
        <div>
          <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Create account' : 'Have an account?'}
          </button>
        </div>
      </div>

      <form className="form" onSubmit={submit}>
        {mode === 'register' && (
          <div>
            <label>Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Your name" />
          </div>
        )}
        <div>
          <label>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>

        <div>
          <button type="submit">{mode === 'login' ? 'Log in' : 'Register'}</button>
        </div>
        {error && <div style={{color:'red'}}>{error}</div>}
        <div style={{marginTop:12,fontSize:13,color:'#666'}}>Demo account: demo@taskapp.local / demopassword</div>
      </form>
    </div>
  );
}
