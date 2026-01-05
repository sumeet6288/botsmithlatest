import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Send, Loader2, Bot, User } from 'lucide-react';
import { chatAPI, chatbotAPI } from '../utils/api';

const ChatPage = () => {
  const { id } = useParams();
  const [chatbot, setChatbot] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sessionId] = useState(() => {
    // Get or create session ID from localStorage for this chatbot
    const storageKey = `chatbot_session_${id}`;
    let storedSessionId = localStorage.getItem(storageKey);
    
    if (!storedSessionId) {
      // Create new session ID and store it
      storedSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(storageKey, storedSessionId);
    }
    
    return storedSessionId;
  });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChatbot();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatbot = async () => {
    try {
      const response = await chatbotAPI.get(id);
      setChatbot(response.data);
      
      // Add welcome message
      if (response.data.welcome_message) {
        setMessages([{
          role: 'assistant',
          content: response.data.welcome_message,
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Error loading chatbot:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || sending) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setSending(true);

    try {
      const response = await chatAPI.sendMessage({
        chatbot_id: id,
        message: inputMessage,
        session_id: sessionId
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.message,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
        error: true
      }]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading chatbot...</p>
        </div>
      </div>
    );
  }

  if (!chatbot) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-700">Chatbot not found</p>
          <p className="text-gray-500 mt-2">The chatbot you're looking for doesn't exist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {chatbot.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{chatbot.name}</h1>
              <p className="text-sm text-gray-600">{chatbot.description || 'AI Assistant'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                  : 'bg-gradient-to-br from-indigo-500 to-purple-600'
              } text-white shadow-md`}>
                {message.role === 'user' ? (
                  <User className="w-5 h-5" />
                ) : (
                  <Bot className="w-5 h-5" />
                )}
              </div>

              {/* Message Content */}
              <div className={`flex-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block max-w-[80%] rounded-2xl px-5 py-3 shadow-md ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                    : message.error
                    ? 'bg-red-50 text-red-700 border-2 border-red-200'
                    : 'bg-white text-gray-800 border border-gray-100'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-green-100' : 'text-gray-400'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {sending && (
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-white rounded-2xl px-5 py-3 shadow-md border border-gray-100">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                  <span className="text-gray-600">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex gap-3">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={sending}
              className="flex-1 h-12 text-base"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || sending}
              className="h-12 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Powered by {chatbot.name}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
