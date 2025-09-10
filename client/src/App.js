// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';
import HomePage from './pages/HomePage';
import ChatGPTPage from './pages/ChatGPTPage';
import CandidatesPage from './pages/CandidatesPage';
import EditCandidatePage from './pages/EditCandidatePage';
import SimilarCandidatesPage from './pages/SimilarCandidatesPage';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/chat" element={
                <ProtectedRoute>
                  <ChatGPTPage />
                </ProtectedRoute>
              } />
              <Route path="/candidates" element={
                <ProtectedRoute>
                  <CandidatesPage />
                </ProtectedRoute>
              } />
              <Route path="/candidates/:id/edit" element={
                <ProtectedRoute>
                  <EditCandidatePage />
                </ProtectedRoute>
              } />
              <Route path="/candidates/:id/similar" element={
                <ProtectedRoute>
                  <SimilarCandidatesPage />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;