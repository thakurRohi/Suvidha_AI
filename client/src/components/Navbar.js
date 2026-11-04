import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">📸</span>
          InstaOptimizer
        </Link>

        {user ? (
          <div className="navbar-menu">
            <Link to="/dashboard" className="navbar-link">Dashboard</Link>
            <Link to="/upload" className="navbar-link">Upload</Link>
            <Link to="/posts" className="navbar-link">My Posts</Link>
            <Link to="/trends" className="navbar-link">Trends</Link>
            <Link to="/calendar" className="navbar-link">Calendar</Link>
            <Link to="/insights" className="navbar-link">Insights</Link>
            <div className="navbar-user">
              <span className="user-name">{user.name}</span>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="navbar-menu">
            <Link to="/login" className="navbar-link">Login</Link>
            <Link to="/register" className="btn btn-primary">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
