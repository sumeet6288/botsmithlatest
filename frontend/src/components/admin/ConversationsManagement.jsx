import React, { useState, useEffect } from 'react';
import { MessageSquare, Download, Filter, Calendar, X, User, Bot, ChevronDown, ChevronUp, Eye, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';

const ConversationsManagement = ({ backendUrl }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [filters, setFilters] = useState({
    chatbot_id: '',
    status: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchConversations();
  }, [filters]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.chatbot_id) params.append('chatbot_id', filters.chatbot_id);
      if (filters.status) params.append('status', filters.status);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      
      const response = await fetch(`${backendUrl}/api/admin/conversations?${params}`);
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      setLoadingMessages(true);
      const response = await fetch(`${backendUrl}/api/chat/messages/${conversationId}`);
      const data = await response.json();
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleViewConversation = async (conversation) => {
    setSelectedConversation(conversation);
    await fetchMessages(conversation.id);
  };

  const handleCloseModal = () => {
    setSelectedConversation(null);
    setMessages([]);
  };

  const exportConversations = async (format) => {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      if (filters.chatbot_id) params.append('chatbot_id', filters.chatbot_id);
      
      const response = await fetch(`${backendUrl}/api/admin/conversations/export?${params}`);
      
      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `conversations_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        const data = await response.json();
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `conversations_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      
      alert('Export completed successfully');
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Export failed');
    }
  };

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Conversations Management</h2>
          <p className="text-sm text-gray-600 mt-1">View and manage all chatbot conversations</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={fetchConversations} className="bg-purple-600 hover:bg-purple-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => exportConversations('json')} className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
          <Button size="sm" onClick={() => exportConversations('csv')} className="bg-green-600 hover:bg-green-700">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="resolved">Resolved</option>
              <option value="escalated">Escalated</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Start Date
            </label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters({...filters, start_date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              End Date
            </label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters({...filters, end_date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={() => setFilters({ chatbot_id: '', status: '', start_date: '', end_date: '' })}
              variant="outline"
              className="w-full hover:bg-white"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading conversations...</p>
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No conversations found</p>
          <p className="text-sm mt-2">Try adjusting your filters or check back later</p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => (
            <div 
              key={conv.id} 
              className="border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 bg-white overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-purple-600" />
                        <span className="font-semibold text-gray-900">
                          {conv.user_name || 'Anonymous User'}
                        </span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        conv.status === 'active' ? 'bg-green-100 text-green-700' :
                        conv.status === 'resolved' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {conv.status}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                        {conv.message_count || 0} messages
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Email:</span>
                        <p className="text-gray-900 font-medium">{conv.user_email || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Conversation ID:</span>
                        <p className="text-gray-900 font-mono text-xs">{conv.id?.substring(0, 12)}...</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Chatbot ID:</span>
                        <p className="text-gray-900 font-mono text-xs">{conv.chatbot_id?.substring(0, 12)}...</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Created:</span>
                        <p className="text-gray-900 font-medium">
                          {formatTimestamp(conv.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleViewConversation(conv)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white ml-4"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Messages
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Total: <span className="font-semibold text-gray-900">{conversations.length}</span> conversations
        </div>
      </div>

      {/* Conversation Details Modal */}
      {selectedConversation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Conversation Details</h3>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{selectedConversation.user_name || 'Anonymous'}</span>
                    </div>
                    <div>
                      {selectedConversation.user_email || 'No email'}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedConversation.status === 'active' ? 'bg-green-500 text-white' :
                      selectedConversation.status === 'resolved' ? 'bg-blue-500 text-white' :
                      'bg-yellow-500 text-white'
                    }`}>
                      {selectedConversation.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body - Messages */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {loadingMessages ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No messages found in this conversation</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      )}
                      <div
                        className={`rounded-lg p-4 max-w-[70%] ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-900'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold opacity-75">
                            {message.role === 'user' ? 'User' : 'Assistant'}
                          </span>
                          <span className="text-xs opacity-60">
                            {formatTimestamp(message.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      </div>
                      {message.role === 'user' && (
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-100 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">{messages.length}</span> messages in this conversation
                </div>
                <Button
                  onClick={handleCloseModal}
                  variant="outline"
                  className="hover:bg-gray-200"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationsManagement;
