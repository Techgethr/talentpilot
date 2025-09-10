// client/src/pages/SimilarCandidatesPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { candidateAPI } from '../services/api';
import './CandidatesPage.css';

const SimilarCandidatesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [similarCandidates, setSimilarCandidates] = useState([]);
  const [baseCandidate, setBaseCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load base candidate and similar candidates when component mounts
  useEffect(() => {
    const loadCandidates = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Load the base candidate
        const baseResponse = await candidateAPI.getCandidate(id);
        setBaseCandidate(baseResponse.data.data);
        
        // Load similar candidates
        const response = await candidateAPI.getSimilarCandidates(id);
        setSimilarCandidates(response.data.data || []);
      } catch (error) {
        console.error('Error loading candidates:', error);
        setError('Failed to load similar candidates. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadCandidates();
  }, [id]);

  const getSimilarityPercentage = (similarity) => {
    // Convert similarity score to percentage (assuming 0 is most similar)
    // In TiDB, VEC_COSINE_DISTANCE returns 0 for identical vectors
    // We'll convert this to a percentage where 0 distance = 100% similarity
    const percentage = Math.max(0, Math.min(100, (1 - similarity) * 100));
    return `${percentage.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="candidates-page">
        <div className="page-header">
          <h2>Similar Candidates</h2>
          <p>Finding candidates similar to the selected one...</p>
        </div>
        <p>Loading similar candidates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="candidates-page">
        <div className="page-header">
          <h2>Similar Candidates</h2>
        </div>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="candidates-page">
      <div className="page-header">
        <h2>Similar Candidates</h2>
        {baseCandidate && (
          <p>
            Candidates similar to: <strong>{baseCandidate.name}</strong>
          </p>
        )}
        <Link to="/candidates" className="back-link">
          ← Back to Candidates
        </Link>
      </div>

      {similarCandidates.length === 0 ? (
        <p>No similar candidates found.</p>
      ) : (
        <div className="candidates-list">
          <div className="candidates-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>LinkedIn</th>
                  <th>Similarity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {similarCandidates.map((candidate) => (
                  <tr key={candidate.id}>
                    <td>{candidate.name}</td>
                    <td>{candidate.email || '-'}</td>
                    <td>{candidate.phone || '-'}</td>
                    <td>
                      {candidate.linkedinUrl ? (
                        <a href={candidate.linkedinUrl} target="_blank" rel="noopener noreferrer">
                          View Profile
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      <div className="similarity-bar">
                        <div 
                          className="similarity-fill"
                          style={{ width: getSimilarityPercentage(candidate.similarity) }}
                        ></div>
                        <span className="similarity-text">
                          {getSimilarityPercentage(candidate.similarity)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <button 
                        className="edit-button"
                        onClick={() => navigate(`/candidates/${candidate.id}/edit`)}
                      >
                        View
                      </button>
                      <button 
                        className="similar-button"
                        onClick={() => navigate(`/candidates/${candidate.id}/similar`)}
                      >
                        Find Similar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimilarCandidatesPage;