import { useState, useEffect, useRef } from 'react';
import '../styles/Chatbot.css';

// Helper function to format message content with Notion-like styling
const formatMessageContent = (content) => {
  // Convert URLs to clickable links
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const withLinks = content.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // Add paragraph styling
  const withParagraphs = withLinks.split('\n').map(line => 
    line ? `<p>${line}</p>` : '<p><br/></p>'
  ).join('');
  
  return withParagraphs;
};

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Add initial greeting message when component mounts
  useEffect(() => {
    setMessages([
      {
        sender: 'bot',
        message: 'Hello! I\'m your real estate assistant. How can I help you today?',
        timestamp: new Date()
      }
    ]);
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Get UI size dimensions
  const getUiSize = () => {
    const container = document.querySelector('.chatbot-container');
    if (container) {
      return {
        width: container.offsetWidth,
        height: container.offsetHeight
      };
    }
    return { width: 400, height: 600 }; // Default fallback values
  };

  // Send message to backend API
  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to chat
    const userMessage = {
      sender: 'user',
      message: input,
      timestamp: new Date()
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const uiSize = getUiSize();
      const response = await fetch('https://real-estate-server-25im.onrender.com/api/chatbot/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: input,
          userId: userId,
          uiSize: uiSize
        })
      });

      const data = await response.json();

      if (data.success) {
        // Save userId if it's a new conversation
        if (!userId && data.userId) {
          setUserId(data.userId);
        }

        // Add bot response to chat
        const botMessage = {
          sender: 'bot',
          message: data.response,
          timestamp: new Date()
        };

        setMessages(prevMessages => [...prevMessages, botMessage]);
      } else {
        // Handle error
        console.error('Error from server:', data.error);
        const errorMessage = {
          sender: 'bot',
          message: 'Sorry, I\'m having trouble processing your request. Please try again.',
          timestamp: new Date()
        };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        sender: 'bot',
        message: 'Sorry, I\'m having trouble connecting to the server. Please try again later.',
        timestamp: new Date()
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h2>Real Estate Assistant</h2>
        <div className="chatbot-subtitle">Notion-style AI Chat</div>
      </div>
      
      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <div 
              className="message-content"
              dangerouslySetInnerHTML={{ __html: formatMessageContent(msg.message) }}
            />
            <div className="message-timestamp">
              {msg.sender === 'bot' ? '🤖' : '👤'} {formatTime(msg.timestamp)}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message bot loading">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chatbot-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type / for commands or ask anything..."
          disabled={isLoading}
        />
        <button 
          onClick={sendMessage} 
          disabled={isLoading || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;