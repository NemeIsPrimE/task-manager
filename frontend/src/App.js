import React from 'react';
import { useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';

function App() {
  const { isAuthenticated } = useAuth();
  return <div className="app">{isAuthenticated ? <Dashboard /> : <Auth />}</div>;
}

export default App;
