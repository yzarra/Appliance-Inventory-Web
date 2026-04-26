// registration page

import { useState } from 'react';

// register method
function Register({ onRegister, onSwitch }) {
// variables
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');   // confirm password field
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');   // success message after registering
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError('');
    setSuccess('');

    // validation
    if (!username || !password || !confirm) {
      return setError('All fields are required');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    // Check passwords match 
    if (password !== confirm) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    // calls register method in server
    try {
      const res = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        // if username is taken or rejected
        setError(data.error || 'Registration failed');
      } else {
        // if successful, switch to login page
        setSuccess('Account created! Redirecting to login...');
        setTimeout(() => onRegister(), 1500);
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

  return (
    <div style={cardStyle}>
      {/* Page title */}
      <h1 style={{ color: '#f5e0d8', fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
        Create account
      </h1>

      {/* Subtitle */}
      <p style={{ color: 'rgba(245,224,216,0.6)', fontSize: '13px', marginBottom: '28px' }}>
        Set up your appliance inventory
      </p>

      {/* Error message — only renders if error string is not empty */}
      {error && (
        <p style={{ color: '#d46a48', fontSize: '13px', marginBottom: '12px' }}>{error}</p>
      )}

      {/* Success message — only renders if success string is not empty */}
      {success && (
        <p style={{ color: '#9a98c8', fontSize: '13px', marginBottom: '12px' }}>{success}</p>
      )}

      {/* Username input */}
      <input
        style={inputStyle}
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />

      {/* Password input */}
      <input
        style={inputStyle}
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      {/* Confirm password input */}
      <input
        style={inputStyle}
        placeholder="Confirm password"
        type="password"
        value={confirm}
        onChange={e => setConfirm(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleRegister()}
      />

      {/* Register button */}
      <button style={btnStyle} onClick={handleRegister} disabled={loading}>
        {loading ? 'Creating account...' : 'Create Account'}
      </button>

      {/* Switch back to Login page */}
      <p style={{ color: 'rgba(245,224,216,0.6)', fontSize: '13px', marginTop: '20px', textAlign: 'center' }}>
        Already have an account?{' '}
        <span style={{ color: '#d46a48', cursor: 'pointer', fontWeight: '600' }} onClick={onSwitch}>
          Sign in here
        </span>
      </p>
    </div>
  );
}

// Makes this component importable by App.js
export default Register;