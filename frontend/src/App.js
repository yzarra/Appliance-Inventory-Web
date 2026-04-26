// Driver of the frontend
// main menu that switches screens based on selection

// imports
import { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

// main function
function App() {
  // token is like a boolean "isLoggedIn"
  // useState is like an instance variable that re-renders the UI when it changes
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [showRegister, setShowRegister] = useState(false);

  // If logged in, show Dashboard
  if (token) {
    return <Dashboard token={token} onLogout={() => {
      localStorage.removeItem('token');
      setToken(null);
    }} />;
  }

  // If not logged in, show Login or Register
  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #22223a 0%, #32325e 100%)' }}>
      {showRegister
        ? <Register onSwitch={() => setShowRegister(false)} onRegister={() => setShowRegister(false)} />
        : <Login onSwitch={() => setShowRegister(true)} onLogin={(t) => {
            localStorage.setItem('token', t);
            setToken(t);
          }} />
      }
    </div>
  );
}

// return statement
export default App;