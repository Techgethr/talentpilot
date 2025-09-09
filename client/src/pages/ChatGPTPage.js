// client/src/pages/ChatGPTPage.js
import React, { useState, useEffect, useRef } from 'react';
import { conversationAPI } from '../services/api';
import './ChatGPTPage.css';

const ChatGPTPage = () => {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);

  // Load conversations when component mounts
  useEffect(() => {
    loadConversations();
  }, []);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, processingStep]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    try {
      const response = await conversationAPI.getAllConversations();
      setConversations(response.data.data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadConversation = async (conversationId) => {
    try {
      const response = await conversationAPI.getConversation(conversationId);
      setCurrentConversation(response.data.data);
      setMessages(response.data.data.messages || []);
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const createNewConversation = async () => {
    try {
      const response = await conversationAPI.createConversation('New Conversation');
      const newConversation = response.data.data;
      
      setConversations([newConversation, ...conversations]);
      setCurrentConversation(newConversation);
      setMessages([]);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const [candidatesDelivered, setCandidatesDelivered] = useState(false);
  const [processingSteps, setProcessingSteps] = useState([
    'Analyzing job requirements...',
    'Searching for candidates...',
    'Generating candidate profiles...',
    'Creating communication templates...',
    'Generating final summary...'
  ]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    try {
      setIsLoading(true);
      setProcessingStep('Analyzing job requirements...');
      setCurrentStepIndex(0);
      setCandidatesDelivered(false); // Reset the flag when sending a new message
      
      // Add user message to UI immediately
      const userMessage = {
        id: Date.now(),
        role: 'user',
        content: inputValue,
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
      
      // Simulate progress updates
      const steps = [
        'Analyzing job requirements...',
        'Searching for candidates...',
        'Generating candidate profiles...',
        'Creating communication templates...',
        'Generating final summary...'
      ];
      
      let stepIndex = 0;
      const progressInterval = setInterval(() => {
        if (stepIndex < steps.length - 1) {
          stepIndex++;
          setProcessingStep(steps[stepIndex]);
          setCurrentStepIndex(stepIndex);
        } else {
          clearInterval(progressInterval);
        }
      }, 1500);
      
      // Send message to API
      const requestData = {
        message: inputValue,
        conversationId: currentConversation?.id
      };
      
      const response = await conversationAPI.sendMessage(requestData);
      
      // Clear progress interval
      clearInterval(progressInterval);
      
      // Clear processing step
      setProcessingStep('');
      
      // Update conversation and messages
      if (response.data.data.conversation) {
        setCurrentConversation(response.data.data.conversation);
        
        // If this is a new conversation, add it to the list
        if (!currentConversation || currentConversation.id !== response.data.data.conversation.id) {
          setConversations(prev => [
            response.data.data.conversation,
            ...prev.filter(conv => conv.id !== response.data.data.conversation.id)
          ]);
        }
        
        setMessages(response.data.data.conversation.messages);
        
        // Check if candidates were delivered
        if (response.data.data.candidatesDelivered) {
          setCandidatesDelivered(true);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Clear processing step
      setProcessingStep('');
      
      // Add error message to UI
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setProcessingStep('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const deleteConversation = async (conversationId) => {
    try {
      await conversationAPI.deleteConversation(conversationId);
      
      // Remove from conversations list
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      // If we're viewing the deleted conversation, clear it
      if (currentConversation && currentConversation.id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  // Function to format markdown-like content
  const formatMessageContent = (content) => {
    if (!content) return content;
    
    // Convert markdown headers to HTML
    let formattedContent = content
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
      .replace(/^\- (.*$)/gm, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    
    // Wrap content in paragraphs
    if (!formattedContent.startsWith('<h') && !formattedContent.startsWith('<p')) {
      formattedContent = '<p>' + formattedContent + '</p>';
    }
    
    return { __html: formattedContent };
  };

  return (
    <div className="chatgpt-page">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>Conversations</h2>
          <button className="new-chat-btn" onClick={createNewConversation}>
            + New Chat
          </button>
        </div>
        
        <div className="conversations-list">
          {conversations.map(conversation => (
            <div 
              key={conversation.id} 
              className={`conversation-item ${currentConversation && currentConversation.id === conversation.id ? 'active' : ''}`}
              onClick={() => loadConversation(conversation.id)}
            >
              <div className="conversation-title">
                {conversation.title}
              </div>
              <div className="conversation-meta">
                <span className="conversation-date">
                  {new Date(conversation.updated_at).toLocaleDateString()}
                </span>
                <button 
                  className="delete-conversation-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conversation.id);
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Main Chat Area */}
      <div className="main-chat">
        <div className="chat-header">
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <h2>{currentConversation ? currentConversation.title : 'TalentPilot Chat'}</h2>
        </div>
        
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="welcome-message">
              <h3>Welcome to TalentPilot Chat!</h3>
              <p>Describe the job requirements you're looking for and I'll find the best candidates for you.</p>
              <p><strong>Example:</strong> "I need a senior React developer with 5+ years of experience, knowledge of Node.js, and experience working in agile teams."</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`message ${message.role}`}>
                <div className="message-content">
                  <div className="message-header">
                    {message.role === 'user' ? 'You' : 'Assistant'}
                  </div>
                  <div 
                    className="message-text"
                    dangerouslySetInnerHTML={formatMessageContent(message.content)}
                  />
                </div>
              </div>
            ))
          )}
          
          {isLoading && processingStep && (
            <div className="message assistant">
              <div className="message-content">
                <div className="message-header">Assistant</div>
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <p>{processingStep}</p>
                
                {/* Progress steps visualization */}
                <div className="progress-steps">
                  <div className={`progress-step ${currentStepIndex >= 0 ? 'active' : ''}`}>1. Analyze requirements</div>
                  <div className={`progress-step ${currentStepIndex >= 1 ? 'active' : ''}`}>2. Search candidates</div>
                  <div className={`progress-step ${currentStepIndex >= 2 ? 'active' : ''}`}>3. Generate profiles</div>
                  <div className={`progress-step ${currentStepIndex >= 3 ? 'active' : ''}`}>4. Create templates</div>
                  <div className={`progress-step ${currentStepIndex >= 4 ? 'active' : ''}`}>5. Final summary</div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Show completion message when candidates are delivered */}
        {candidatesDelivered && (
          <div className="conversation-complete-message">
            <p> candidates for this job search have been delivered. You can start a new conversation to search for other candidates.</p>
          </div>
        )}
        
        {/* Chat input - only show if candidates haven't been delivered */}
        {!candidatesDelivered && (
          <div className="chat-input-container">
            <div className="chat-input-wrapper">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe the job requirements..."
                disabled={isLoading}
                rows="1"
              />
              <button 
                className="send-button" 
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
              >
                Send
              </button>
            </div>
            <div className="input-hint">
              Press Enter to send, Shift + Enter for new line
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatGPTPage;