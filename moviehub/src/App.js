import React, { useState, useEffect } from 'react';
import Login from './Login';
import SearchPage from './Searchpage';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState('');
  const [showSplash, setShowSplash] = useState(true);

  // Simple 3s splash; swap to a video if you want later
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (username) => {
    setIsLoggedIn(true);
    setUser(username);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser('');
  };

  if (showSplash) {
    return (
      <div className="App min-h-screen flex items-center justify-center bg-black">
        {/* Splash logo from /public */}
      
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />; // ✅ pass onLogin
  }

  return <SearchPage user={user} onLogout={handleLogout} />;
}

export default App;
