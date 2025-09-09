// client/src/pages/CandidatesPage.js
import React, { useState } from 'react';
import { candidateAPI } from '../services/api';
import './CandidatesPage.css';

const CandidatesPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cvText: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      await candidateAPI.uploadCV(formData);
      setSubmitSuccess(true);
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        cvText: ''
      });
      // In a real app, you might want to refresh the candidates list here
    } catch (error) {
      console.error('Error uploading CV:', error);
      setSubmitError('Failed to upload CV. Please try again.');
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
              <label htmlFor="cvText">CV Text</label>
              <textarea
                id="cvText"
                name="cvText"
                value={formData.cvText}
                onChange={handleChange}
                rows="10"
                required
                placeholder="Paste the candidate's CV text here..."
              />
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
          <p>Candidates will appear here once uploaded.</p>
          {/* In a real implementation, you would fetch and display candidates here */}
        </div>
      </div>
    </div>
  );
};

export default CandidatesPage;