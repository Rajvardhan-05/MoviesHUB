// src/Login.js
import React, { useState, useEffect, useRef } from 'react';
import SearchPage from './Searchpage';

/**
 * A reusable Login component
 * @param {object} props
 * @param {function} props.onLogin - A callback function to call on successful login.
 */
function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }

    onLogin(username); // Pass username up to parent (App)
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-gray-100">
      {/* ✨ Header: Welcome to MovieHUB */}
      <div className="absolute top-6 left-0 right-0 flex justify-center px-4">
        <div className="text-center">
          <div className="text-sm md:text-base text-gray-400 mb-1 tracking-wide">
            Welcome to
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            <span className="align-middle rounded-lg bg-yellow-400 px-3 py-1 text-black">
              Movie
            </span>{' '}
            <span className="align-middle text-glow-blue">HUB</span>
          </h1>
        </div>
      </div>

      {/* local CSS for neon glow */}
      <style>{`
        .text-glow-blue {
          color: #60a5fa; /* Tailwind blue-400 */
          text-shadow:
            0 0 6px rgba(96,165,250,0.9),
            0 0 12px rgba(96,165,250,0.7),
            0 0 20px rgba(96,165,250,0.6),
            0 0 32px rgba(96,165,250,0.5);
        }
      `}</style>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-sm mt-20"
      >
        <h2 className="text-3xl font-bold text-center text-blue-400 mb-8">
          Sign In to MovieHUB
        </h2>

        {error && (
          <div className="bg-red-900/50 text-red-300 p-3 rounded-lg mb-6 text-center text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., moviefan"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="• • • • • • • •"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg px-6 py-3 font-semibold text-lg text-white transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Sign In
          </button>
        </div>
      </form>
    </div>
  );
}

/** Root App (plays full video splash, then shows login, then search) */
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState("");
  const [showSplash, setShowSplash] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    // Hide splash ONLY when the video actually ends
    const v = videoRef.current;
    if (!v) return;

    const onEnded = () => setShowSplash(false);
    v.addEventListener('ended', onEnded);

    // (Optional) In case autoplay is blocked, as a fallback:
    const onCanPlay = () => {
      // Try to play; some browsers need an explicit call
      const p = v.play?.();
      if (p && typeof p.then === 'function') {
        p.catch(() => {
          // If it fails, unmute + attempt again (user might need to tap)
          v.muted = true; // keep muted for autoplay policies
          v.play().catch(() => {/* ignore */});
        });
      }
    };
    v.addEventListener('canplay', onCanPlay);

    return () => {
      v.removeEventListener('ended', onEnded);
      v.removeEventListener('canplay', onCanPlay);
    };
  }, []);

  const handleLogin = (username) => {
    setIsLoggedIn(true);
    setUser(username);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser("");
  };

  if (showSplash) {
    return (
      <div className="relative flex items-center justify-center min-h-screen bg-black overflow-hidden">
        {/* Fullscreen video splash */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          src={`${process.env.PUBLIC_URL}/MovieHUB_Netflix_Style_Intro_Video.mp4`}
          autoPlay
          muted
          playsInline
        />
        {/* Optional overlay for contrast */}
        <div className="pointer-events-none absolute inset-0 bg-black/20" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return <SearchPage user={user} onLogout={handleLogout} />;
}

export { Login };
export default App;
