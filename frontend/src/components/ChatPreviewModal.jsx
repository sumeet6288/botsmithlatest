import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { chatAPI } from '../utils/api';
import { useToast } from '../hooks/use-toast';

const ChatPreviewModal = ({ isOpen, onClose, chatbot }) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [sessionId] = useState(() => {
    // Get or create session ID from localStorage for this chatbot
    if (chatbot?.id) {
      const storageKey = `chatbot_session_${chatbot.id}`;
      let storedSessionId = localStorage.getItem(storageKey);
      
      if (!storedSessionId) {
        // Create new session ID and store it
        storedSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem(storageKey, storedSessionId);
      }
      
      return storedSessionId;
    }
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Log chatbot colors for debugging
  React.useEffect(() => {
    if (chatbot) {
      console.log('ChatPreviewModal - Chatbot colors:', {
        primary_color: chatbot.primary_color,
        secondary_color: chatbot.secondary_color,
        widget_theme: chatbot.widget_theme,
        bubble_style: chatbot.bubble_style
      });
    }
  }, [chatbot]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatAPI.sendMessage({
        chatbot_id: chatbot.id,
        message: input,
        session_id: sessionId
      });

      const aiMessage = { role: 'assistant', content: response.data.message };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to get response',
        variant: 'destructive'
      });
      // Remove the failed message
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Chat Preview - {chatbot?.name}</DialogTitle>
          <DialogDescription>
            Test your chatbot by sending messages and reviewing responses
          </DialogDescription>
        </DialogHeader>

        <div 
          className="flex-1 overflow-y-auto space-y-4 p-4 rounded-lg"
          style={{
            backgroundColor: chatbot?.widget_theme === 'dark' ? '#1f2937' : '#f9fafb'
          }}
        >
          {messages.length === 0 && (
            <div className="text-center py-12">
              <Bot 
                className="w-12 h-12 mx-auto mb-4" 
                style={{ color: chatbot?.primary_color || '#7c3aed' }}
              />
              <p 
                className="font-medium"
                style={{ 
                  color: chatbot?.widget_theme === 'dark' ? '#e5e7eb' : '#4b5563',
                  fontFamily: chatbot?.font_family || 'Inter, system-ui, sans-serif'
                }}
              >
                {chatbot?.welcome_message || 'Hello! How can I help you today?'}
              </p>
            </div>
          )}
          {messages.map((message, index) => (
            <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.role === 'assistant' && (
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ 
                    backgroundColor: chatbot?.primary_color || '#7c3aed',
                    backgroundImage: chatbot?.avatar_url ? `url(${chatbot.avatar_url})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {!chatbot?.avatar_url && <Bot className="w-5 h-5 text-white" />}
                </div>
              )}
              <div 
                className={`max-w-[70%] px-4 py-2 ${
                  chatbot?.bubble_style === 'square' ? 'rounded-md' : 
                  chatbot?.bubble_style === 'smooth' ? 'rounded-xl' : 
                  'rounded-2xl'
                } ${
                  chatbot?.font_size === 'small' ? 'text-sm' : 
                  chatbot?.font_size === 'large' ? 'text-base' : 
                  'text-sm'
                }`}
                style={{
                  backgroundColor: message.role === 'user' 
                    ? chatbot?.primary_color || '#7c3aed'
                    : chatbot?.widget_theme === 'dark' ? '#374151' : '#ffffff',
                  color: message.role === 'user' 
                    ? '#ffffff'
                    : chatbot?.widget_theme === 'dark' ? '#ffffff' : '#111827',
                  border: message.role === 'assistant' ? `1px solid ${chatbot?.widget_theme === 'dark' ? '#4b5563' : '#e5e7eb'}` : 'none',
                  fontFamily: chatbot?.font_family || 'Inter, system-ui, sans-serif'
                }}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-gray-700" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ 
                  backgroundColor: chatbot?.primary_color || '#7c3aed',
                  backgroundImage: chatbot?.avatar_url ? `url(${chatbot.avatar_url})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {!chatbot?.avatar_url && <Bot className="w-5 h-5 text-white" />}
              </div>
              <div 
                className={`px-4 py-2 border ${
                  chatbot?.bubble_style === 'square' ? 'rounded-md' : 
                  chatbot?.bubble_style === 'smooth' ? 'rounded-xl' : 
                  'rounded-2xl'
                }`}
                style={{
                  backgroundColor: chatbot?.widget_theme === 'dark' ? '#374151' : '#ffffff',
                  borderColor: chatbot?.widget_theme === 'dark' ? '#4b5563' : '#e5e7eb'
                }}
              >
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: chatbot?.primary_color || '#7c3aed' }} />
              </div>
            </div>
          )}
          {/* Invisible div for auto-scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <Button onClick={handleSend} disabled={!input.trim() || loading}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatPreviewModal;