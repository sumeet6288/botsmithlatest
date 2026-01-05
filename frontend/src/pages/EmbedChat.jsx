import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Send, Loader2, X, Minimize2 } from 'lucide-react';
import { chatAPI, chatbotAPI } from '../utils/api';

const EmbedChat = () => {
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
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    loadChatbot();
  }, [id]);

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
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!chatbot) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <p className="text-gray-600">Chatbot not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-2 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
            {chatbot.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">{chatbot.name}</h1>
            <p className="text-xs text-gray-500">Online</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto py-3 space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex px-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[95%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                      : message.error
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-100'
                  }`}
                >
                  <p className="text-base whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-indigo-100' : 'text-gray-400'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start px-2">
                <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    <span className="text-base text-gray-600">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="bg-white border-t border-gray-200 px-2 py-3">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={sending}
                className="flex-1 text-base"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || sending}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                {sending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EmbedChat;
