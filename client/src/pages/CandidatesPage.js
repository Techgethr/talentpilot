// client/src/pages/CandidatesPage.js
import React, { useState, useRef, useEffect } from 'react';
import { candidateAPI } from '../services/api';
import './CandidatesPage.css';

const CandidatesPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [cvFile, setCvFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const fileInputRef = useRef(null);

  // Load candidates when component mounts
  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const response = await candidateAPI.getAllCandidates();
      setCandidates(response.data.data || []);
    } catch (error) {
      console.error('Error loading candidates:', error);
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
    
    if (!cvFile) {
      setSubmitError('Please select a CV file to upload');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      // Create FormData object to send file
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('cvFile', cvFile);

      await candidateAPI.uploadCV(formDataToSend);
      setSubmitSuccess(true);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: ''
      });
      setCvFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Reload candidates list
      loadCandidates();
    } catch (error) {
      console.error('Error uploading CV:', error);
      setSubmitError(error.response?.data?.error || 'Failed to upload CV. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="candidates-page">
      <div className="page-header">
        <h2>Candidates</h2>
        <p>Manage candidate profiles and upload new CVs</p>
      </div>

      <div className="content-grid">
        <div className="form-section">
          <h3>Upload New Candidate</h3>
          <form onSubmit={handleSubmit} className="candidate-form">
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
                required
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
              <label htmlFor="cvFile">CV File</label>
              <input
                ref={fileInputRef}
                type="file"
                id="cvFile"
                name="cvFile"
                onChange={handleFileChange}
                accept=".pdf,.docx,.txt"
                required
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

            {submitError && <div className="error-message">{submitError}</div>}
            {submitSuccess && <div className="success-message">Candidate uploaded successfully!</div>}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Uploading...' : 'Upload Candidate'}
            </button>
          </form>
        </div>

        <div className="candidates-list">
          <h3>Candidate List</h3>
          {loading ? (
            <p>Loading candidates...</p>
          ) : candidates.length === 0 ? (
            <p>No candidates uploaded yet.</p>
          ) : (
            <div className="candidates-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((candidate) => (
                    <tr key={candidate.id}>
                      <td>{candidate.name}</td>
                      <td>{candidate.email || '-'}</td>
                      <td>{candidate.phone || '-'}</td>
                      <td>{new Date(candidate.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidatesPage;