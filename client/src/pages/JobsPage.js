// client/src/pages/JobsPage.js
import React, { useState } from 'react';
import { jobAPI } from '../services/api';
import './JobsPage.css';

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
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
      await jobAPI.createJob(formData);
      setSubmitSuccess(true);
      // Reset form
      setFormData({
        title: '',
        description: ''
      });
      // In a real app, you might want to refresh the jobs list here
    } catch (error) {
      console.error('Error creating job:', error);
      setSubmitError('Failed to create job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="jobs-page">
      <div className="page-header">
        <h2>Job Postings</h2>
        <p>Create and manage job postings</p>
      </div>

      <div className="content-grid">
        <div className="form-section">
          <h3>Create New Job Posting</h3>
          <form onSubmit={handleSubmit} className="job-form">
            <div className="form-group">
              <label htmlFor="title">Job Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Job Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="10"
                required
                placeholder="Describe the job requirements, responsibilities, and qualifications..."
              />
            </div>

            {submitError && <div className="error-message">{submitError}</div>}
            {submitSuccess && <div className="success-message">Job posting created successfully!</div>}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Job Posting'}
            </button>
          </form>
        </div>

        <div className="jobs-list">
          <h3>Current Job Postings</h3>
          <p>Job postings will appear here once created.</p>
          {/* In a real implementation, you would fetch and display jobs here */}
        </div>
      </div>
    </div>
  );
};

export default JobsPage;