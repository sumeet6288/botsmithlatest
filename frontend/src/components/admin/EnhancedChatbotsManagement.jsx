import React, { useState, useEffect } from 'react';
import {
  Bot, Power, PowerOff, Trash2, Search, Eye, Edit3, Download, 
  MessageSquare, FileText, Users, BarChart3, Settings, Link2, 
  RefreshCw, Filter, ChevronLeft, ChevronRight, X, Save, UserPlus,
  Copy, ExternalLink, AlertCircle, CheckCircle, Code, Database,
  Calendar, Clock, TrendingUp, Activity
} from 'lucide-react';
import { Button } from '../ui/button';

const EnhancedChatbotsManagement = ({ backendUrl }) => {
  const [chatbots, setChatbots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [itemsPerPage] = useState(20);
  
  // Filters
  const [aiProviderFilter, setAiProviderFilter] = useState('');
  const [enabledFilter, setEnabledFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Modals
  const [selectedChatbot, setSelectedChatbot] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSourcesModal, setShowSourcesModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  
  // Modal data
  const [chatbotDetails, setChatbotDetails] = useState(null);
  const [chatbotSources, setChatbotSources] = useState([]);
  const [chatbotAnalytics, setChatbotAnalytics] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [transferUserId, setTransferUserId] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  useEffect(() => {
    fetchChatbots();
  }, [currentPage, searchTerm, aiProviderFilter, enabledFilter, sortBy, sortOrder]);

  const fetchChatbots = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        skip: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
        sort_by: sortBy,
        sort_order: sortOrder
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (aiProviderFilter) params.append('ai_provider', aiProviderFilter);
      if (enabledFilter !== '') params.append('enabled', enabledFilter);
      
      const response = await fetch(`${backendUrl}/api/admin/chatbots/detailed?${params}`);
      const data = await response.json();
      
      setChatbots(data.chatbots || []);
      setTotalCount(data.total || 0);
    } catch (error) {
      console.error('Error fetching chatbots:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleChatbot = async (chatbotId) => {
    try {
      // Show loading state
      const chatbotToUpdate = chatbots.find(bot => bot.id === chatbotId);
      const action = chatbotToUpdate?.enabled ? 'disable' : 'enable';
      
      if (!window.confirm(`Are you sure you want to ${action} this chatbot?`)) {
        return;
      }
      
      const response = await fetch(`${backendUrl}/api/admin/chatbots/${chatbotId}/toggle`, {
        method: 'PUT'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Show success message
        const newState = data.enabled ? 'enabled' : 'disabled';
        alert(`Chatbot ${newState} successfully!`);
        
        // Refresh the list
        fetchChatbots();
      } else {
        throw new Error('Toggle operation failed');
      }
    } catch (error) {
      console.error('Error toggling chatbot:', error);
      alert(`Failed to toggle chatbot: ${error.message}`);
    }
  };

  const bulkOperation = async (operation) => {
    if (selectedIds.length === 0) {
      alert('Please select chatbots first');
      return;
    }

    if (operation === 'delete' && !window.confirm(`Delete ${selectedIds.length} chatbots? This action cannot be undone.`)) {
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
        alert(data.message);
        setSelectedIds([]);
        fetchChatbots();
      }
    } catch (error) {
      console.error('Error in bulk operation:', error);
      alert('Operation failed');
    }
  };

  const deleteChatbot = async (chatbotId) => {
    if (!window.confirm('Delete this chatbot? This will delete all conversations, messages, sources, and integrations. This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`${backendUrl}/api/admin/chatbots/${chatbotId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        alert('Chatbot deleted successfully');
        fetchChatbots();
      }
    } catch (error) {
      console.error('Error deleting chatbot:', error);
      alert('Delete failed');
    }
  };

  const viewDetails = async (chatbot) => {
    try {
      setSelectedChatbot(chatbot);
      const response = await fetch(`${backendUrl}/api/admin/chatbots/${chatbot.id}/details`);
      const data = await response.json();
      if (data.success) {
        setChatbotDetails(data);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Error fetching details:', error);
    }
  };

  const openEditModal = (chatbot) => {
    setSelectedChatbot(chatbot);
    setEditFormData({
      name: chatbot.name,
      description: chatbot.description,
      ai_provider: chatbot.ai_provider,
      ai_model: chatbot.ai_model,
      temperature: chatbot.temperature,
      max_tokens: chatbot.max_tokens,
      system_prompt: chatbot.system_prompt,
      welcome_message: chatbot.welcome_message,
      enabled: chatbot.enabled,
      public_access: chatbot.public_access,
      widget_position: chatbot.widget_settings?.position || 'bottom-right',
      widget_theme: chatbot.widget_settings?.theme || 'light',
      primary_color: chatbot.appearance?.primary_color || '#8B5CF6',
      secondary_color: chatbot.appearance?.secondary_color || '#EC4899'
    });
    setShowEditModal(true);
  };

  const saveEditChanges = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/admin/chatbots/${selectedChatbot.id}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      const data = await response.json();
      if (data.success) {
        alert('Chatbot updated successfully');
        setShowEditModal(false);
        fetchChatbots();
      }
    } catch (error) {
      console.error('Error updating chatbot:', error);
      alert('Update failed');
    }
  };

  const viewSources = async (chatbot) => {
    try {
      setSelectedChatbot(chatbot);
      const response = await fetch(`${backendUrl}/api/admin/chatbots/${chatbot.id}/sources`);
      const data = await response.json();
      if (data.success) {
        setChatbotSources(data.sources);
        setShowSourcesModal(true);
      }
    } catch (error) {
      console.error('Error fetching sources:', error);
    }
  };

  const deleteSource = async (sourceId) => {
    if (!window.confirm('Delete this source?')) return;
    
    try {
      const response = await fetch(`${backendUrl}/api/admin/chatbots/${selectedChatbot.id}/sources/${sourceId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        alert('Source deleted');
        viewSources(selectedChatbot);
      }
    } catch (error) {
      console.error('Error deleting source:', error);
    }
  };

  const viewAnalytics = async (chatbot) => {
    try {
      setSelectedChatbot(chatbot);
      const response = await fetch(`${backendUrl}/api/admin/chatbots/${chatbot.id}/analytics?days=30`);
      const data = await response.json();
      if (data.success) {
        setChatbotAnalytics(data.analytics);
        setShowAnalyticsModal(true);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/admin/users/enhanced?limit=100`);
      const data = await response.json();
      if (data.users) {
        setAvailableUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const openTransferModal = (chatbot) => {
    setSelectedChatbot(chatbot);
    setTransferUserId('');
    setUserSearchTerm('');
    setShowUserDropdown(false);
    setShowTransferModal(true);
    fetchAvailableUsers();
  };

  const transferOwnership = async () => {
    if (!transferUserId || transferUserId.trim() === '') {
      alert('Please enter a valid new owner User ID');
      return;
    }
    
    if (!window.confirm(`⚠️ Transfer ownership of "${selectedChatbot?.name}" to user ${transferUserId}?\n\nThis will give the new owner full control of this chatbot.`)) {
      return;
    }
    
    try {
      const response = await fetch(`${backendUrl}/api/admin/chatbots/${selectedChatbot.id}/transfer-ownership`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_owner_id: transferUserId })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Ownership transferred successfully!\n\n' +
              `Chatbot: ${selectedChatbot.name}\n` +
              `Previous Owner: ${data.old_owner_id}\n` +
              `New Owner: ${data.new_owner_id}`);
        setShowTransferModal(false);
        setTransferUserId('');
        fetchChatbots();
      } else {
        throw new Error('Transfer operation failed');
      }
    } catch (error) {
      console.error('Error transferring ownership:', error);
      alert(`❌ Transfer failed: ${error.message}`);
    }
  };

  const exportData = async (format) => {
    try {
      const response = await fetch(`${backendUrl}/api/admin/chatbots/export?format=${format}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chatbots_export_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      alert('Export successful');
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Export failed');
    }
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Enhanced Chatbot Management
          </h2>
          <p className="text-gray-600 mt-1">Complete control over all chatbots in the system</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => exportData('json')} className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
          <Button onClick={() => exportData('csv')} className="bg-green-600 hover:bg-green-700">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={fetchChatbots} className="bg-purple-600 hover:bg-purple-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search chatbots..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={aiProviderFilter}
          onChange={(e) => {
            setAiProviderFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="">All Providers</option>
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
          <option value="google">Google</option>
        </select>
        
        <select
          value={enabledFilter}
          onChange={(e) => {
            setEnabledFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="">All Status</option>
          <option value="true">Enabled</option>
          <option value="false">Disabled</option>
        </select>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="created_at">Date Created</option>
          <option value="updated_at">Last Updated</option>
          <option value="name">Name</option>
        </select>
      </div>

      {/* Statistics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Total Chatbots</p>
              <p className="text-2xl font-bold text-purple-900">{totalCount}</p>
            </div>
            <Bot className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Current Page</p>
              <p className="text-2xl font-bold text-green-900">{currentPage} / {totalPages}</p>
            </div>
            <FileText className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Selected</p>
              <p className="text-2xl font-bold text-blue-900">{selectedIds.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">On This Page</p>
              <p className="text-2xl font-bold text-orange-900">{chatbots.length}</p>
            </div>
            <Activity className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg flex items-center justify-between border border-purple-200">
          <span className="text-sm font-medium text-purple-900">
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
            <Button size="sm" onClick={() => setSelectedIds([])} variant="outline">
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Chatbots Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chatbots...</p>
        </div>
      ) : chatbots.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Bot className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No chatbots found</p>
          <p className="text-sm mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === chatbots.length && chatbots.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(chatbots.map(b => b.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                    className="rounded"
                  />
                </th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Chatbot</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Owner</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">AI Provider</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Statistics</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Last Activity</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {chatbots.map((bot) => (
                <tr key={bot.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(bot.id)}
                      onChange={() => toggleSelection(bot.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-2 rounded-lg">
                        <Bot className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{bot.name}</p>
                        <p className="text-xs text-gray-500 truncate max-w-xs">
                          {bot.description || 'No description'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{bot.owner.name}</p>
                      <p className="text-xs text-gray-500">{bot.owner.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {bot.owner.plan}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        bot.ai_provider === 'openai' ? 'bg-green-100 text-green-700' :
                        bot.ai_provider === 'anthropic' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {bot.ai_provider}
                      </span>
                      <p className="text-xs text-gray-600 mt-1">{bot.ai_model}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Database className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600">{bot.statistics.sources_count} sources</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600">{bot.statistics.conversations_count} chats</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600">{bot.statistics.messages_count} msgs</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        bot.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {bot.enabled ? (
                          <><CheckCircle className="w-3 h-3 mr-1" /> Enabled</>
                        ) : (
                          <><AlertCircle className="w-3 h-3 mr-1" /> Disabled</>
                        )}
                      </span>
                      {bot.public_access && (
                        <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
                          <ExternalLink className="w-3 h-3 mr-1" /> Public
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(bot.last_activity).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(bot.last_activity).toLocaleTimeString()}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => viewDetails(bot)}
                        title="View Details"
                        className="hover:bg-blue-50"
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditModal(bot)}
                        title="Edit"
                        className="hover:bg-purple-50"
                      >
                        <Edit3 className="w-4 h-4 text-purple-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => viewSources(bot)}
                        title="View Sources"
                        className="hover:bg-indigo-50"
                      >
                        <FileText className="w-4 h-4 text-indigo-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => viewAnalytics(bot)}
                        title="Analytics"
                        className="hover:bg-green-50"
                      >
                        <BarChart3 className="w-4 h-4 text-green-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openTransferModal(bot)}
                        title="Transfer Ownership"
                        className="hover:bg-orange-50"
                      >
                        <UserPlus className="w-4 h-4 text-orange-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleChatbot(bot.id)}
                        title={bot.enabled ? 'Disable' : 'Enable'}
                        className={bot.enabled ? 'hover:bg-yellow-50' : 'hover:bg-green-50'}
                      >
                        {bot.enabled ? (
                          <PowerOff className="w-4 h-4 text-yellow-600" />
                        ) : (
                          <Power className="w-4 h-4 text-green-600" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteChatbot(bot.id)}
                        title="Delete"
                        className="hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} chatbots
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  variant={currentPage === i + 1 ? 'default' : 'outline'}
                  size="sm"
                  className={currentPage === i + 1 ? 'bg-purple-600 hover:bg-purple-700' : ''}
                >
                  {i + 1}
                </Button>
              )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
            </div>
            <Button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && chatbotDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="w-6 h-6 text-white" />
                <h3 className="text-xl font-bold text-white">Chatbot Details</h3>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Bot className="w-5 h-5 text-purple-600" />
                    Basic Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium text-gray-700">Name:</span> {chatbotDetails.chatbot.name}</div>
                    <div><span className="font-medium text-gray-700">Description:</span> {chatbotDetails.chatbot.description || 'N/A'}</div>
                    <div><span className="font-medium text-gray-700">Provider:</span> {chatbotDetails.chatbot.ai_provider}</div>
                    <div><span className="font-medium text-gray-700">Model:</span> {chatbotDetails.chatbot.ai_model}</div>
                    <div><span className="font-medium text-gray-700">Temperature:</span> {chatbotDetails.chatbot.temperature}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Owner Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium text-gray-700">Name:</span> {chatbotDetails.owner.name}</div>
                    <div><span className="font-medium text-gray-700">Email:</span> {chatbotDetails.owner.email}</div>
                    <div><span className="font-medium text-gray-700">Plan:</span> <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">{chatbotDetails.owner.plan}</span></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Sources ({chatbotDetails.sources.length})
                </h4>
                <div className="space-y-2">
                  {chatbotDetails.sources.map((source) => (
                    <div key={source.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-gray-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{source.name}</p>
                          <p className="text-xs text-gray-500">{source.type}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${
                        source.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {source.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-green-600" />
                  Integrations ({chatbotDetails.integrations.length})
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {chatbotDetails.integrations.map((integration) => (
                    <div key={integration.id} className="p-2 bg-gray-50 rounded text-sm text-center">
                      <p className="font-medium">{integration.type}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${
                        integration.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {integration.enabled ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Edit3 className="w-6 h-6 text-white" />
                <h3 className="text-xl font-bold text-white">Edit Chatbot</h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">AI Provider</label>
                  <select
                    value={editFormData.ai_provider}
                    onChange={(e) => setEditFormData({...editFormData, ai_provider: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="google">Google</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                    rows="3"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={editFormData.temperature}
                    onChange={(e) => setEditFormData({...editFormData, temperature: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Tokens</label>
                  <input
                    type="number"
                    value={editFormData.max_tokens}
                    onChange={(e) => setEditFormData({...editFormData, max_tokens: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">System Prompt</label>
                  <textarea
                    value={editFormData.system_prompt}
                    onChange={(e) => setEditFormData({...editFormData, system_prompt: e.target.value})}
                    rows="3"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Message</label>
                  <input
                    type="text"
                    value={editFormData.welcome_message}
                    onChange={(e) => setEditFormData({...editFormData, welcome_message: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editFormData.enabled}
                      onChange={(e) => setEditFormData({...editFormData, enabled: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Enabled</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editFormData.public_access}
                      onChange={(e) => setEditFormData({...editFormData, public_access: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Public Access</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-200">
              <Button onClick={() => setShowEditModal(false)} variant="outline">
                Cancel
              </Button>
              <Button onClick={saveEditChanges} className="bg-purple-600 hover:bg-purple-700">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sources Modal */}
      {showSourcesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-white" />
                <h3 className="text-xl font-bold text-white">Sources ({chatbotSources.length})</h3>
              </div>
              <button
                onClick={() => setShowSourcesModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {chatbotSources.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No sources found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatbotSources.map((source) => (
                    <div key={source.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-indigo-100 p-2 rounded">
                            <FileText className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{source.name}</h4>
                            <p className="text-sm text-gray-500">{source.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 text-sm rounded ${
                            source.status === 'completed' ? 'bg-green-100 text-green-700' : 
                            source.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {source.status}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteSource(source.id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {source.content && (
                        <p className="text-sm text-gray-600 line-clamp-2">{source.content}</p>
                      )}
                      {source.url && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                          <Link2 className="w-4 h-4" />
                          <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {source.url}
                          </a>
                        </div>
                      )}
                      <div className="mt-2 text-xs text-gray-400">
                        Created: {new Date(source.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && chatbotAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-white" />
                <h3 className="text-xl font-bold text-white">Analytics (Last 30 Days)</h3>
              </div>
              <button
                onClick={() => setShowAnalyticsModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-600 font-medium">Total Messages</p>
                  <p className="text-3xl font-bold text-blue-900 mt-1">{chatbotAnalytics.total_messages}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-green-600 font-medium">Recent Messages</p>
                  <p className="text-3xl font-bold text-green-900 mt-1">{chatbotAnalytics.recent_messages}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-600 font-medium">Conversations</p>
                  <p className="text-3xl font-bold text-purple-900 mt-1">{chatbotAnalytics.total_conversations}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-600 font-medium">Active Chats</p>
                  <p className="text-3xl font-bold text-orange-900 mt-1">{chatbotAnalytics.active_conversations}</p>
                </div>
              </div>
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-3">Average Daily Messages</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">
                    {chatbotAnalytics.average_daily_messages.toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">messages per day</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Ownership Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserPlus className="w-6 h-6 text-white" />
                <h3 className="text-xl font-bold text-white">Transfer Ownership</h3>
              </div>
              <button
                onClick={() => setShowTransferModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4 bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-medium">Current Owner:</span> {selectedChatbot?.owner?.name || 'Unknown'} ({selectedChatbot?.owner?.email || 'N/A'})
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Chatbot:</span> {selectedChatbot?.name}
                </p>
              </div>
              
              <div className="space-y-4">
                {/* Search and select from existing users */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Users
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={userSearchTerm}
                      onChange={(e) => {
                        setUserSearchTerm(e.target.value);
                        setShowUserDropdown(true);
                      }}
                      onFocus={() => setShowUserDropdown(true)}
                      placeholder="Search by name or email..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    {showUserDropdown && userSearchTerm && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {availableUsers
                          .filter(user => 
                            user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                            user.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
                          )
                          .map(user => (
                            <button
                              key={user.id}
                              onClick={() => {
                                setTransferUserId(user.id);
                                setUserSearchTerm(`${user.name} (${user.email})`);
                                setShowUserDropdown(false);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-orange-50 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-600">{user.email}</div>
                              <div className="text-xs text-gray-500">ID: {user.id}</div>
                            </button>
                          ))}
                        {availableUsers.filter(user => 
                          user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                          user.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
                        ).length === 0 && (
                          <div className="px-4 py-3 text-sm text-gray-500">No users found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Or manually enter User ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or Enter User ID Manually
                  </label>
                  <input
                    type="text"
                    value={transferUserId}
                    onChange={(e) => setTransferUserId(e.target.value)}
                    placeholder="Enter user ID (e.g., admin-001)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    💡 Tip: Use the search above to find users easily
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button onClick={() => setShowTransferModal(false)} variant="outline">
                  Cancel
                </Button>
                <Button 
                  onClick={transferOwnership} 
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                  disabled={!transferUserId || transferUserId.trim() === ''}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Transfer Ownership
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedChatbotsManagement;
