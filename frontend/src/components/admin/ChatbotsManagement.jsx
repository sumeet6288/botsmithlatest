import React, { useState, useEffect } from 'react';
import { Bot, Power, PowerOff, Trash2, Search, CheckSquare, MessageSquare, X, Eye, Download, User, Mail, Calendar, Clock } from 'lucide-react';
import { Button } from '../ui/button';

const ChatbotsManagement = ({ backendUrl }) => {
  const [chatbots, setChatbots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedChatbot, setSelectedChatbot] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [expandedConversation, setExpandedConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchChatbots();
  }, []);

  const fetchChatbots = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/api/admin/chatbots/detailed`);
      const data = await response.json();
      setChatbots(data.chatbots || []);
    } catch (error) {
      console.error('Error fetching chatbots:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleChatbot = async (chatbotId) => {
    try {
      const response = await fetch(`${backendUrl}/api/admin/chatbots/${chatbotId}/toggle`, {
        method: 'PUT'
      });
      const data = await response.json();
      if (data.success) {
        fetchChatbots();
      }
    } catch (error) {
      console.error('Error toggling chatbot:', error);
    }
  };

  const bulkOperation = async (operation) => {
    if (selectedIds.length === 0) {
      alert('Please select chatbots first');
      return;
    }

    if (operation === 'delete' && !window.confirm(`Delete ${selectedIds.length} chatbots?`)) {
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/admin/chatbots/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedIds,
          operation: operation
        })
      });
      const data = await response.json();
      if (data.success) {
        alert(`${operation} completed: ${data.affected} chatbots affected`);
        setSelectedIds([]);
        fetchChatbots();
      }
    } catch (error) {
      console.error('Error in bulk operation:', error);
    }
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const viewChatbotConversations = async (chatbot) => {
    setSelectedChatbot(chatbot);
    setConversationsLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/admin/conversations?chatbot_id=${chatbot.id}`);
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    } finally {
      setConversationsLoading(false);
    }
  };

  const viewConversationMessages = async (conversationId) => {
    if (expandedConversation === conversationId) {
      setExpandedConversation(null);
      setMessages([]);
      return;
    }

    setExpandedConversation(conversationId);
    try {
      const response = await fetch(`${backendUrl}/api/chat/messages/${conversationId}`);
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  const closeConversationsModal = () => {
    setSelectedChatbot(null);
    setConversations([]);
    setExpandedConversation(null);
    setMessages([]);
  };

  const exportConversations = async (format) => {
    if (!selectedChatbot) return;
    
    try {
      const response = await fetch(`${backendUrl}/api/admin/conversations/export?format=${format}&chatbot_id=${selectedChatbot.id}`);
      
      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedChatbot.name}_conversations_${new Date().toISOString().split('T')[0]}.csv`;
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
        a.download = `${selectedChatbot.name}_conversations_${new Date().toISOString().split('T')[0]}.json`;
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

  const filteredChatbots = chatbots.filter(bot =>
    bot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bot.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Chatbot Management</h2>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search chatbots..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="mb-4 p-4 bg-purple-50 rounded-lg flex items-center justify-between">
          <span className="text-sm font-medium">
            {selectedIds.length} chatbot(s) selected
          </span>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => bulkOperation('enable')} className="bg-green-600 hover:bg-green-700">
              <Power className="w-4 h-4 mr-2" />
              Enable
            </Button>
            <Button size="sm" onClick={() => bulkOperation('disable')} className="bg-yellow-600 hover:bg-yellow-700">
              <PowerOff className="w-4 h-4 mr-2" />
              Disable
            </Button>
            <Button size="sm" onClick={() => bulkOperation('delete')} className="bg-red-600 hover:bg-red-700">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      ) : filteredChatbots.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Bot className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No chatbots found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredChatbots.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(filteredChatbots.map(b => b.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                    className="rounded"
                  />
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Owner</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Provider</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Model</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Sources</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Conversations</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Messages</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredChatbots.map((bot) => (
                <tr key={bot.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(bot.id)}
                      onChange={() => toggleSelection(bot.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="py-3 px-4 font-medium">{bot.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{bot.user_id}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                      {bot.ai_provider}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">{bot.ai_model}</td>
                  <td className="py-3 px-4 text-center">{bot.sources_count}</td>
                  <td className="py-3 px-4 text-center">{bot.conversations_count}</td>
                  <td className="py-3 px-4 text-center">{bot.messages_count}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      bot.enabled !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {bot.enabled !== false ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => viewChatbotConversations(bot)}
                        title="View Conversations"
                      >
                        <MessageSquare className="w-4 h-4 text-purple-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleChatbot(bot.id)}
                        title={bot.enabled !== false ? 'Disable' : 'Enable'}
                      >
                        {bot.enabled !== false ? (
                          <PowerOff className="w-4 h-4 text-yellow-600" />
                        ) : (
                          <Power className="w-4 h-4 text-green-600" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Conversations Modal */}
      {selectedChatbot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-white" />
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedChatbot.name} - Conversations</h3>
                  <p className="text-purple-100 text-sm">Total: {conversations.length} conversations</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => exportConversations('json')}
                  className="bg-white text-purple-600 hover:bg-purple-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  JSON
                </Button>
                <Button
                  size="sm"
                  onClick={() => exportConversations('csv')}
                  className="bg-white text-purple-600 hover:bg-purple-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  CSV
                </Button>
                <button
                  onClick={closeConversationsModal}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {conversationsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading conversations...</p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No conversations found</p>
                  <p className="text-sm mt-2">This chatbot hasn't had any conversations yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {/* Conversation Header */}
                      <div 
                        className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => viewConversationMessages(conv.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="bg-purple-100 p-3 rounded-full">
                              <User className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {conv.user_name || 'Anonymous User'}
                              </h4>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Mail className="w-4 h-4" />
                                  {conv.user_email || 'N/A'}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageSquare className="w-4 h-4" />
                                  {conv.message_count || 0} messages
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(conv.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              conv.status === 'active' ? 'bg-green-100 text-green-700' :
                              conv.status === 'resolved' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {conv.status}
                            </span>
                            <Eye className={`w-5 h-5 transition-transform ${
                              expandedConversation === conv.id ? 'rotate-180' : ''
                            } text-gray-400`} />
                          </div>
                        </div>
                      </div>

                      {/* Expanded Messages */}
                      {expandedConversation === conv.id && (
                        <div className="p-4 bg-white border-t border-gray-200">
                          {messages.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                              <p>No messages in this conversation</p>
                            </div>
                          ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                              {messages.map((msg, idx) => (
                                <div
                                  key={idx}
                                  className={`p-4 rounded-lg ${
                                    msg.role === 'user'
                                      ? 'bg-blue-50 border border-blue-200'
                                      : 'bg-gray-50 border border-gray-200'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className={`text-xs font-semibold uppercase ${
                                      msg.role === 'user' ? 'text-blue-700' : 'text-gray-700'
                                    }`}>
                                      {msg.role === 'user' ? '👤 User' : '🤖 Assistant'}
                                    </span>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                      <Clock className="w-3 h-3" />
                                      {new Date(msg.timestamp).toLocaleString()}
                                    </div>
                                  </div>
                                  <p className="text-gray-800 whitespace-pre-wrap">{msg.content}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotsManagement;
