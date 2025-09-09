// client/src/pages/ChatPage.js
import React, { useState, useRef, useEffect } from 'react';
import { chatAPI } from '../services/api';
import './ChatPage.css';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

    try {
      // Send message to API
      const response = await chatAPI.sendMessage(inputValue);
      
      // Add bot response to chat
      const botMessage = { 
        id: Date.now() + 1, 
        text: formatBotResponse(response.data.data), 
        sender: 'bot',
        rawData: response.data.data
      };
      setMessages(prev => [...prev, botMessage]);
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

  const formatBotResponse = (data) => {
    if (!data.candidates || data.candidates.length === 0) {
      return "I couldn't find any candidates matching your requirements. Please try rephrasing your job description.";
    }

    let response = `I found ${data.candidates.length} candidate(s) matching your requirements:\n\n`;
    
    data.candidates.forEach((candidate, index) => {
      response += `${index + 1}. ${candidate.name} (Similarity: ${(candidate.similarity * 100).toFixed(1)}%)\n`;
      response += `   Skills: ${candidate.skills.join(', ')}\n`;
      response += `   Experience: ${candidate.experience}\n\n`;
    });
    
    return response;
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
              <p>Hello! I'm your Talent Search Assistant. Please describe the job requirements you're looking for and I'll find the best candidates for you.</p>
              <p>For example: "I need a senior React developer with 5+ years of experience and knowledge of Node.js"</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-content">
                  {message.sender === 'bot' ? (
                    <pre className="bot-response">{message.text}</pre>
                  ) : (
                    <p>{message.text}</p>
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="message bot">
              <div className="message-content">
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
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