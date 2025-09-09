// client/src/pages/EditCandidatePage.js
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { candidateAPI } from '../services/api';
import './EditCandidatePage.css';

const EditCandidatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    linkedinUrl: ''
  });
  const [cvFile, setCvFile] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const fileInputRef = useRef(null);

  // Load candidate data when component mounts
  useEffect(() => {
    loadCandidate();
  }, [id]);

  const loadCandidate = async () => {
    try {
      setLoading(true);
      const response = await candidateAPI.getCandidate(id);
      const candidateData = response.data.data;
      
      setCandidate(candidateData);
      setFormData({
        name: candidateData.name || '',
        email: candidateData.email || '',
        phone: candidateData.phone || '',
        linkedinUrl: candidateData.linkedin_url || ''
      });
    } catch (error) {
      console.error('Error loading candidate:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    } else {
      setCvFile(null);
    }
  };

  const handleFileRemove = () => {
    setCvFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setUpdating(true);
    setUpdateError('');
    setUpdateSuccess(false);

    try {
      // Create FormData object to send data
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('linkedinUrl', formData.linkedinUrl);
      
      // Only append CV file if a new one was selected
      if (cvFile) {
        formDataToSend.append('cvFile', cvFile);
      }

      await candidateAPI.updateCandidate(id, formDataToSend);
      setUpdateSuccess(true);
      
      // Reload candidate data
      await loadCandidate();
    } catch (error) {
      console.error('Error updating candidate:', error);
      setUpdateError(error.response?.data?.error || 'Failed to update candidate. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-candidate-page">
        <div className="container">
          <h2>Loading candidate...</h2>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="edit-candidate-page">
        <div className="container">
          <h2>Candidate not found</h2>
          <button onClick={() => navigate('/candidates')}>Back to Candidates</button>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-candidate-page">
      <div className="container">
        <div className="header">
          <h2>Edit Candidate</h2>
          <button className="back-button" onClick={() => navigate('/candidates')}>
            ← Back to Candidates
          </button>
        </div>

        <div className="content">
          <div className="candidate-info">
            <h3>{candidate.name}</h3>
            <p><strong>Email:</strong> {candidate.email || 'Not provided'}</p>
            <p><strong>Phone:</strong> {candidate.phone || 'Not provided'}</p>
            {candidate.linkedin_url && (
              <p><strong>LinkedIn:</strong> <a href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer">{candidate.linkedin_url}</a></p>
            )}
            <p><strong>Created:</strong> {new Date(candidate.created_at).toLocaleDateString()}</p>
          </div>

          <form onSubmit={handleSubmit} className="edit-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="linkedinUrl">LinkedIn Profile URL</label>
              <input
                type="url"
                id="linkedinUrl"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cvFile">Update CV (Optional)</label>
              <input
                ref={fileInputRef}
                type="file"
                id="cvFile"
                name="cvFile"
                onChange={handleFileChange}
                accept=".pdf,.docx,.txt"
              />
              {cvFile && (
                <div className="file-preview">
                  <span>{cvFile.name}</span>
                  <button type="button" onClick={handleFileRemove} className="remove-file">
                    Remove
                  </button>
                </div>
              )}
              <div className="file-hint">
                Supported formats: PDF, Word (.docx), TXT
              </div>
            </div>

            {updateError && <div className="error-message">{updateError}</div>}
            {updateSuccess && <div className="success-message">Candidate updated successfully!</div>}

            <div className="form-actions">
              <button type="submit" disabled={updating}>
                {updating ? 'Updating...' : 'Update Candidate'}
              </button>
              <button type="button" onClick={() => navigate('/candidates')}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCandidatePage;