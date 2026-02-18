import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, Upload, LogOut, User } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, profile, loading, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/');
    setMenuOpen(false);
    setDropdownOpen(false);
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          SLATE<span>MAKER</span>
        </Link>

        <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <li><Link to="/" onClick={() => { setMenuOpen(false); window.scrollTo(0, 0); }}>Home</Link></li>
          <li><Link to="/designs" onClick={() => setMenuOpen(false)}>Designs</Link></li>
          <li><Link to="/guides" onClick={() => setMenuOpen(false)}>Guides</Link></li>
          <li><Link to="/community" onClick={() => setMenuOpen(false)}>Community</Link></li>
          <li><Link to="/about" onClick={() => setMenuOpen(false)}>About</Link></li>
          
          {!loading && (user ? (
            <>
              <li>
                <Link to="/upload" className="navbar-upload-btn" onClick={() => setMenuOpen(false)}>
                  <Upload size={16} />
                  Upload
                </Link>
              </li>
              <li className={`navbar-user-menu ${dropdownOpen ? 'open' : ''}`}>
                <button className="navbar-user-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                  <User size={16} />
                  {profile?.username || 'Account'}
                </button>
                <div className="navbar-dropdown">
                  <Link to="/profile" onClick={() => { setMenuOpen(false); setDropdownOpen(false); }}>My Profile</Link>
                  <Link to="/my-designs" onClick={() => { setMenuOpen(false); setDropdownOpen(false); }}>My Designs</Link>
                  <button onClick={handleSignOut}>
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login" onClick={() => setMenuOpen(false)}>Log In</Link></li>
              <li>
                <Link to="/signup" className="navbar-signup-btn" onClick={() => setMenuOpen(false)}>
                  Sign Up
                </Link>
              </li>
            </>
          ))}
        </ul>

        <button 
          className="navbar-hamburger" 
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
}
