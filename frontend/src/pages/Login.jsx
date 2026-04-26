// login screen

import { useState } from 'react';

function Login({ onLogin, onSwitch }) {
  // variables 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // method when sign in button is clicked
  const handleLogin = async () => {
    setError('');
    setLoading(true);

    // validation
    try {
        // send login request to backend
      const res = await fetch('https://appliance-inventory-web-production.up.railway.app/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      // parse response
      const data = await res.json();

      // if login failed, show error message
      if (!res.ok) {
        setError(data.error || 'Login failed');
      } else {
        // pass token up to App.js
        onLogin(data.token); 
      }
    } catch (err) {
      setError('Could not connect to server');
    }

    setLoading(false);
  };

  // card style
  const cardStyle = {
    background: 'rgba(154, 152, 200, 0.15)',
    border: '1px solid rgba(154, 152, 200, 0.3)',
    backdropFilter: 'blur(12px)',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
  };

  // input field style  
  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid rgba(154,152,200,0.4)',
    background: 'rgba(154,152,200,0.1)',
    color: '#f5e0d8',
    outline: 'none',
    fontSize: '14px',
    marginBottom: '16px',
    boxSizing: 'border-box',
  };

  // main button style
  const btnStyle = {
    width: '100%',
    padding: '11px',
    borderRadius: '8px',
    border: '1.5px solid rgba(212,106,72,0.7)',
    background: 'rgba(212,106,72,0.2)',
    color: '#d46a48',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: '4px',
  };

// toString() what the user sees
  return (
    <div style={cardStyle}>
      {/* page title */}
      <h1 style={{ color: '#f5e0d8', fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
        Welcome back
      </h1>

      {/* subtitle */}
      <p style={{ color: 'rgba(245,224,216,0.6)', fontSize: '13px', marginBottom: '28px' }}>
        Sign in to your inventory
      </p>

      {/* error message */}
      {error && (
        <p style={{ color: '#d46a48', fontSize: '13px', marginBottom: '12px' }}>{error}</p>
      )}

      {/* input field for username */}
      <input
        style={inputStyle}
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />

        {/* input field for password */}
      <input
        style={inputStyle}
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleLogin()}
      />

      {/* sign in button */}
      <button style={btnStyle} onClick={handleLogin} disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      {/* switch to register page */}
      <p style={{ color: 'rgba(245,224,216,0.6)', fontSize: '13px', marginTop: '20px', textAlign: 'center' }}>
        No account?{' '}
        <span style={{ color: '#d46a48', cursor: 'pointer', fontWeight: '600' }} onClick={onSwitch}>
          Register here
        </span>
      </p>
    </div>
  );
}

// return statement
export default Login;