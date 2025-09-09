// client/src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <h1>TalentPilot Chat</h1>
        </Link>
        <nav className="nav">
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/chat">Chat</Link></li>
            <li><Link to="/candidates">Candidates</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;