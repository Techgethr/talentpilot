// client/src/pages/ChatPage.js
import React, { useState, useRef, useEffect } from 'react';
import { chatAPI } from '../services/api';
import './ChatPage.css';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [jobResults, setJobResults] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    // Add user message to chat
    const userMessage = { id: Date.now(), text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setJobResults(null);

    try {
      // Send message to API
      const response = await chatAPI.sendMessage(inputValue);
      
      // Add bot response to chat
      const botMessage = { 
        id: Date.now() + 1, 
        text: "I've analyzed your job description and found matching candidates.", 
        sender: 'bot',
        rawData: response.data.data
      };
      
      setMessages(prev => [...prev, botMessage]);
      setJobResults(response.data.data);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { 
        id: Date.now() + 1, 
        text: 'Sorry, I encountered an error. Please try again.', 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="chat-header">
          <h2>Talent Search Assistant</h2>
          <p>Describe the job requirements and I'll find the best candidates for you</p>
        </div>
        
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="welcome-message">
              <h3>Welcome to TalentPilot Chat!</h3>
              <p>Please describe the job requirements you're looking for and I'll find the best candidates for you.</p>
              <p><strong>Example:</strong> "I need a senior React developer with 5+ years of experience, knowledge of Node.js, and experience working in agile teams. The role is remote-first with a competitive salary range of $90k-$120k."</p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div key={message.id} className={`message ${message.sender}`}>
                  <div className="message-content">
                    <p>{message.text}</p>
                  </div>
                </div>
              ))}
              
              {jobResults && (
                <div className="job-results">
                  <div className="results-header">
                    <h3>Job Analysis Results</h3>
                    <button 
                      className="copy-btn" 
                      onClick={() => copyToClipboard(JSON.stringify(jobResults.jobRequirements, null, 2))}
                    >
                      Copy Job Details
                    </button>
                  </div>
                  
                  <div className="job-summary">
                    <h4>Job Requirements</h4>
                    <div className="requirement-item">
                      <strong>Title:</strong> {jobResults.jobRequirements.jobTitle}
                    </div>
                    <div className="requirement-item">
                      <strong>Experience:</strong> {jobResults.jobRequirements.experienceLevel}
                    </div>
                    <div className="requirement-item">
                      <strong>Key Skills:</strong> {jobResults.jobRequirements.requiredSkills?.join(', ')}
                    </div>
                  </div>
                  
                  <div className="candidates-section">
                    <h4>Top Candidate Matches ({jobResults.candidates.length})</h4>
                    <div className="candidates-list">
                      {jobResults.candidates.map((candidate, index) => (
                        <div key={candidate.id} className="candidate-card">
                          <div className="candidate-header">
                            <h5>{index + 1}. {candidate.name}</h5>
                            <span className="match-score">Match: {candidate.similarity ? (candidate.similarity * 100).toFixed(1) : 'N/A'}%</span>
                          </div>
                          
                          <div className="candidate-contact">
                            <div className="contact-item">
                              <strong>Email:</strong> {candidate.email || 'Not provided'}
                            </div>
                            <div className="contact-item">
                              <strong>Phone:</strong> {candidate.phone || 'Not provided'}
                            </div>
                          </div>
                          
                          <div className="candidate-summary">
                            <h6>Profile Summary:</h6>
                            <p>{candidate.profileSummary}</p>
                          </div>
                          
                          <div className="communication-section">
                            <h6>Communication Templates</h6>
                            
                            <div className="template-section">
                              <h7>Email Template</h7>
                              <button 
                                className="copy-btn small"
                                onClick={() => copyToClipboard(`${candidate.communicationTemplates?.email?.subject}\n\n${candidate.communicationTemplates?.email?.body}`)}
                              >
                                Copy
                              </button>
                              <div className="template-content">
                                <strong>Subject:</strong> {candidate.communicationTemplates?.email?.subject}
                                <div className="email-body">
                                  {candidate.communicationTemplates?.email?.body}
                                </div>
                              </div>
                            </div>
                            
                            <div className="template-section">
                              <h7>LinkedIn Message</h7>
                              <button 
                                className="copy-btn small"
                                onClick={() => copyToClipboard(candidate.communicationTemplates?.linkedin?.message)}
                              >
                                Copy
                              </button>
                              <div className="template-content">
                                {candidate.communicationTemplates?.linkedin?.message}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {isLoading && (
                <div className="message bot">
                  <div className="message-content">
                    <div className="loading-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <p>Analyzing job requirements and searching for candidates...</p>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form className="chat-input" onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Describe the job requirements..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !inputValue.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;