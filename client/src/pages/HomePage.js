// client/src/pages/HomePage.js
import React from 'react';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <div className="hero">
        <h2>Welcome to TalentPilot Chat</h2>
        <p>Find the perfect candidates for your job openings using AI-powered chat</p>
      </div>
      
      <div className="features">
        <div className="feature-card">
          <h3>AI-Powered Matching</h3>
          <p>Describe your job requirements and let our AI find the best candidates</p>
        </div>
        
        <div className="feature-card">
          <h3>Vector Database Search</h3>
          <p>Leverage TiDB's vector capabilities for semantic search of candidate CVs</p>
        </div>
        
        <div className="feature-card">
          <h3>Real-time Chat</h3>
          <p>Interact with our AI assistant to refine your search and find perfect matches</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;