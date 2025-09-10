// client/src/pages/CandidatesPage.js
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { candidateAPI } from '../services/api';
import './CandidatesPage.css';

const CandidatesPage = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    linkedinUrl: ''
  });
  const [cvFile, setCvFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // Pagination and search state
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const candidatesPerPage = 20;
  
  const fileInputRef = useRef(null);

  // Load candidates when component mounts
  useEffect(() => {
    loadCandidates();
  }, []);

  // Filter candidates when searchTerm changes
  useEffect(() => {
    const filtered = candidates.filter(candidate => 
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (candidate.email && candidate.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (candidate.phone && candidate.phone.includes(searchTerm))
    );
    setFilteredCandidates(filtered);
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchTerm, candidates]);

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
    
    if (!isAuthorized) {
      setSubmitError('Please authorize the processing of your data');
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
      formDataToSend.append('linkedinUrl', formData.linkedinUrl);
      formDataToSend.append('cvFile', cvFile);
      formDataToSend.append('authorized', isAuthorized);

      await candidateAPI.uploadCV(formDataToSend);
      setSubmitSuccess(true);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        linkedinUrl: ''
      });
      setCvFile(null);
      setIsAuthorized(false);
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

  // Pagination logic
  const indexOfLastCandidate = currentPage * candidatesPerPage;
  const indexOfFirstCandidate = indexOfLastCandidate - candidatesPerPage;
  const currentCandidates = filteredCandidates.slice(indexOfFirstCandidate, indexOfLastCandidate);
  const totalPages = Math.ceil(filteredCandidates.length / candidatesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="candidates-page">
      <div className="page-header">
        <h2>Candidates</h2>
        <p>Manage candidate profiles and upload new CVs</p>
      </div>

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

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isAuthorized}
                onChange={(e) => setIsAuthorized(e.target.checked)}
                required
              />
              <span className="checkbox-text">
                I confirm that I have the right to upload this candidate's data and CV for recruitment purposes
              </span>
            </label>
          </div>

          <button type="submit" disabled={isSubmitting || !isAuthorized}>
            {isSubmitting ? 'Uploading...' : 'Upload Candidate'}
          </button>
        </form>
      </div>

      <div className="candidates-list">
        <div className="candidates-list-header">
          <h3>Candidate List</h3>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
        </div>
        
        {loading ? (
          <p>Loading candidates...</p>
        ) : filteredCandidates.length === 0 ? (
          <p>No candidates found.</p>
        ) : (
          <>
            <div className="candidates-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>LinkedIn</th>
                    <th>Uploaded</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCandidates.map((candidate) => (
                    <tr key={candidate.id}>
                      <td>{candidate.name}</td>
                      <td>{candidate.email || '-'}</td>
                      <td>{candidate.phone || '-'}</td>
                      <td>
                        {candidate.linkedin_url ? (
                          <a href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer">
                            View Profile
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>{new Date(candidate.created_at).toLocaleDateString()}</td>
                      <td>
                        <button 
                          className="edit-button"
                          onClick={() => navigate(`/candidates/${candidate.id}/edit`)}
                        >
                          Edit
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
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="pagination-button"
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  // Only show first, last, current, and nearby pages
                  if (
                    pageNumber === 1 || 
                    pageNumber === totalPages || 
                    (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`pagination-button ${currentPage === pageNumber ? 'active' : ''}`}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (pageNumber === currentPage - 3 || pageNumber === currentPage + 3) {
                    // Show ellipsis for skipped pages
                    return <span key={pageNumber} className="pagination-ellipsis">...</span>;
                  }
                  return null;
                })}
                
                <button 
                  onClick={() => handlePageChange(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  className="pagination-button"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CandidatesPage;