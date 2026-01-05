import React, { useState, useEffect } from 'react';
import { Key, Webhook, FileText, AlertTriangle, Copy, Eye, EyeOff, Plus, Trash2, RefreshCw, Download, Check, X, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import axios from 'axios';

const TechManagement = ({ backendUrl }) => {
  const [apiKeys, setApiKeys] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);
  const [errors, setErrors] = useState([]);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [showNewWebhookModal, setShowNewWebhookModal] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState({});
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyDescription, setNewKeyDescription] = useState('');
  const [newKeyExpiry, setNewKeyExpiry] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookEvents, setNewWebhookEvents] = useState([]);
  const [newWebhookDescription, setNewWebhookDescription] = useState('');
  const [techStats, setTechStats] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState(null);

  const availableEvents = [
    'user.created', 'user.updated', 'user.deleted',
    'chatbot.created', 'chatbot.updated', 'chatbot.deleted',
    'conversation.started', 'conversation.completed',
    'message.sent', 'message.received',
    'source.uploaded', 'source.processed',
    'error.occurred'
  ];

  useEffect(() => {
    fetchAllData();
  }, [backendUrl]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchApiKeys(),
        fetchWebhooks(),
        fetchSystemLogs(),
        fetchErrors(),
        fetchTechStats()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApiKeys = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/tech/api-keys`);
      setApiKeys(response.data);
    } catch (error) {
      console.error('Error fetching API keys:', error);
    }
  };

  const fetchWebhooks = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/tech/webhooks`);
      setWebhooks(response.data);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
    }
  };

  const fetchSystemLogs = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/tech/system-logs?limit=50`);
      setSystemLogs(response.data);
    } catch (error) {
      console.error('Error fetching system logs:', error);
    }
  };

  const fetchErrors = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/tech/errors?resolved=false&limit=50`);
      setErrors(response.data);
    } catch (error) {
      console.error('Error fetching errors:', error);
    }
  };

  const fetchTechStats = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/tech/tech-stats`);
      setTechStats(response.data);
    } catch (error) {
      console.error('Error fetching tech stats:', error);
    }
  };

  const createApiKey = async () => {
    try {
      const response = await axios.post(`${backendUrl}/api/tech/api-keys`, {
        name: newKeyName,
        description: newKeyDescription,
        expires_in_days: newKeyExpiry ? parseInt(newKeyExpiry) : null
      });
      
      setNewlyCreatedKey(response.data);
      await fetchApiKeys();
      setShowNewKeyModal(false);
      setNewKeyName('');
      setNewKeyDescription('');
      setNewKeyExpiry('');
    } catch (error) {
      console.error('Error creating API key:', error);
      alert('Failed to create API key');
    }
  };

  const deleteApiKey = async (keyId) => {
    if (!window.confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }
    
    try {
      await axios.delete(`${backendUrl}/api/tech/api-keys/${keyId}`);
      await fetchApiKeys();
    } catch (error) {
      console.error('Error deleting API key:', error);
      alert('Failed to delete API key');
    }
  };

  const regenerateApiKey = async (keyId, keyName) => {
    if (!window.confirm(`Are you sure you want to regenerate "${keyName}"? The old key will stop working immediately.`)) {
      return;
    }
    
    try {
      const response = await axios.post(`${backendUrl}/api/tech/api-keys/${keyId}/regenerate`);
      setNewlyCreatedKey(response.data);
      await fetchApiKeys();
    } catch (error) {
      console.error('Error regenerating API key:', error);
      alert('Failed to regenerate API key');
    }
  };

  const createWebhook = async () => {
    try {
      await axios.post(`${backendUrl}/api/tech/webhooks`, {
        url: newWebhookUrl,
        events: newWebhookEvents,
        description: newWebhookDescription
      });
      
      await fetchWebhooks();
      setShowNewWebhookModal(false);
      setNewWebhookUrl('');
      setNewWebhookEvents([]);
      setNewWebhookDescription('');
    } catch (error) {
      console.error('Error creating webhook:', error);
      alert('Failed to create webhook');
    }
  };

  const deleteWebhook = async (webhookId) => {
    if (!window.confirm('Are you sure you want to delete this webhook?')) {
      return;
    }
    
    try {
      await axios.delete(`${backendUrl}/api/tech/webhooks/${webhookId}`);
      await fetchWebhooks();
    } catch (error) {
      console.error('Error deleting webhook:', error);
      alert('Failed to delete webhook');
    }
  };

  const testWebhook = async (webhookId) => {
    try {
      const response = await axios.post(`${backendUrl}/api/tech/webhooks/${webhookId}/test`);
      alert(response.data.message);
      await fetchWebhooks();
    } catch (error) {
      console.error('Error testing webhook:', error);
      alert('Failed to test webhook');
    }
  };

  const toggleWebhookStatus = async (webhookId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await axios.put(`${backendUrl}/api/tech/webhooks/${webhookId}`, {
        status: newStatus
      });
      await fetchWebhooks();
    } catch (error) {
      console.error('Error updating webhook:', error);
      alert('Failed to update webhook status');
    }
  };

  const exportSystemLogs = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/tech/system-logs/export`);
      const dataStr = JSON.stringify(response.data.logs, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `system-logs-${new Date().toISOString()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting logs:', error);
      alert('Failed to export logs');
    }
  };

  const resolveError = async (errorId) => {
    try {
      await axios.put(`${backendUrl}/api/tech/errors/${errorId}`, {
        resolved: true
      });
      await fetchErrors();
    } catch (error) {
      console.error('Error resolving error:', error);
      alert('Failed to resolve error');
    }
  };

  const deleteError = async (errorId) => {
    try {
      await axios.delete(`${backendUrl}/api/tech/errors/${errorId}`);
      await fetchErrors();
    } catch (error) {
      console.error('Error deleting error:', error);
      alert('Failed to delete error');
    }
  };

  const clearAllErrors = async () => {
    if (!window.confirm('Are you sure you want to clear all resolved errors?')) {
      return;
    }
    
    try {
      await axios.delete(`${backendUrl}/api/tech/errors?resolved_only=true`);
      await fetchErrors();
    } catch (error) {
      console.error('Error clearing errors:', error);
      alert('Failed to clear errors');
    }
  };

  const toggleKeyVisibility = (keyId) => {
    setVisibleKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const maskApiKey = (key) => {
    if (!key || key === '•'.repeat(40)) {
      return '•'.repeat(40);
    }
    const visible = key.substring(0, 12);
    const masked = '•'.repeat(20);
    return visible + masked;
  };

  const getLevelColor = (level) => {
    switch(level) {
      case 'error': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const toggleEventSelection = (event) => {
    setNewWebhookEvents(prev => 
      prev.includes(event) 
        ? prev.filter(e => e !== event)
        : [...prev, event]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      {techStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <Key className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">API Keys</h3>
            </div>
            <p className="text-3xl font-bold text-blue-900">{techStats.api_keys.active}</p>
            <p className="text-sm text-blue-700">of {techStats.api_keys.total} total</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center gap-3 mb-2">
              <Webhook className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">Webhooks</h3>
            </div>
            <p className="text-3xl font-bold text-purple-900">{techStats.webhooks.active}</p>
            <p className="text-sm text-purple-700">of {techStats.webhooks.total} total</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-900">System Logs</h3>
            </div>
            <p className="text-3xl font-bold text-green-900">{techStats.system_logs.total}</p>
            <p className="text-sm text-green-700">{techStats.system_logs.errors} errors</p>
          </div>
          
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-red-900">Errors</h3>
            </div>
            <p className="text-3xl font-bold text-red-900">{techStats.error_tracking.unresolved}</p>
            <p className="text-sm text-red-700">of {techStats.error_tracking.total} total</p>
          </div>
        </div>
      )}

      {/* Newly Created Key Modal */}
      {newlyCreatedKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">API Key Created Successfully!</h3>
                <p className="text-sm text-gray-600">Make sure to copy your API key now. You won't be able to see it again!</p>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800 font-medium mb-2">⚠️ Important Security Notice</p>
              <p className="text-sm text-yellow-700">Store this API key securely. It provides access to your account and cannot be retrieved again.</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your API Key</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-4 py-3 bg-gray-100 rounded-lg font-mono text-sm break-all">
                  {newlyCreatedKey.key}
                </code>
                <button
                  onClick={() => copyToClipboard(newlyCreatedKey.key)}
                  className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {copiedKey === newlyCreatedKey.key ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setNewlyCreatedKey(null)} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                I've Saved My Key
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* New API Key Modal */}
      {showNewKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Generate New API Key</h3>
              <button onClick={() => setShowNewKeyModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Key Name *</label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., Production API Key"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  value={newKeyDescription}
                  onChange={(e) => setNewKeyDescription(e.target.value)}
                  placeholder="What will this key be used for?"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expires In (Days)</label>
                <input
                  type="number"
                  value={newKeyExpiry}
                  onChange={(e) => setNewKeyExpiry(e.target.value)}
                  placeholder="Leave empty for no expiration"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowNewKeyModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={createApiKey}
                disabled={!newKeyName}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white"
              >
                Generate Key
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* New Webhook Modal */}
      {showNewWebhookModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Add New Webhook</h3>
              <button onClick={() => setShowNewWebhookModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL *</label>
                <input
                  type="url"
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                  placeholder="https://api.example.com/webhook"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                <input
                  type="text"
                  value={newWebhookDescription}
                  onChange={(e) => setNewWebhookDescription(e.target.value)}
                  placeholder="What is this webhook for?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Events to Subscribe *</label>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto p-2 border border-gray-300 rounded-lg">
                  {availableEvents.map(event => (
                    <label key={event} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newWebhookEvents.includes(event)}
                        onChange={() => toggleEventSelection(event)}
                        className="w-4 h-4 text-purple-600 focus:ring-purple-500 rounded"
                      />
                      <span className="text-sm">{event}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Selected: {newWebhookEvents.length} events</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowNewWebhookModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={createWebhook}
                disabled={!newWebhookUrl || newWebhookEvents.length === 0}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white"
              >
                Create Webhook
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* API Keys Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Key className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">API Keys</h2>
              <p className="text-sm text-gray-600">Manage your API keys and access tokens</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowNewKeyModal(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Generate New Key
          </Button>
        </div>

        <div className="space-y-4">
          {apiKeys.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Key className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No API keys generated yet</p>
              <p className="text-sm">Create your first API key to get started</p>
            </div>
          ) : (
            apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{apiKey.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      apiKey.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {apiKey.status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => regenerateApiKey(apiKey.id, apiKey.name)}
                      className="p-2 hover:bg-blue-50 rounded text-blue-600"
                      title="Regenerate key"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteApiKey(apiKey.id)}
                      className="p-2 hover:bg-red-50 rounded text-red-600"
                      title="Delete key"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {apiKey.description && (
                  <p className="text-sm text-gray-600 mb-2">{apiKey.description}</p>
                )}
                
                <div className="flex items-center gap-2 mb-3">
                  <code className="flex-1 px-3 py-2 bg-gray-100 rounded font-mono text-sm">
                    {visibleKeys[apiKey.id] && apiKey.key !== '•'.repeat(40) ? apiKey.key : maskApiKey(apiKey.key)}
                  </code>
                  <button
                    onClick={() => toggleKeyVisibility(apiKey.id)}
                    className="p-2 hover:bg-gray-100 rounded"
                    title={visibleKeys[apiKey.id] ? "Hide key" : "Show key"}
                  >
                    {visibleKeys[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(apiKey.key)}
                    className="p-2 hover:bg-gray-100 rounded"
                    title="Copy to clipboard"
                  >
                    {copiedKey === apiKey.key ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span>Created: {new Date(apiKey.created_at).toLocaleDateString()}</span>
                  {apiKey.last_used && (
                    <>
                      <span>•</span>
                      <span>Last used: {new Date(apiKey.last_used).toLocaleDateString()}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>Usage: {apiKey.usage_count.toLocaleString()} calls</span>
                  {apiKey.expires_at && (
                    <>
                      <span>•</span>
                      <span className="text-orange-600">Expires: {new Date(apiKey.expires_at).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Webhooks Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Webhook className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Webhooks</h2>
              <p className="text-sm text-gray-600">Configure webhook endpoints for real-time events</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowNewWebhookModal(true)}
            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Webhook
          </Button>
        </div>

        <div className="space-y-4">
          {webhooks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Webhook className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No webhooks configured yet</p>
              <p className="text-sm">Add a webhook to receive real-time events</p>
            </div>
          ) : (
            webhooks.map((webhook) => (
              <div key={webhook.id} className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{webhook.url}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                      webhook.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {webhook.status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => testWebhook(webhook.id)}
                      className="p-2 hover:bg-purple-50 rounded text-purple-600"
                      title="Test webhook"
                    >
                      <Zap className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleWebhookStatus(webhook.id, webhook.status)}
                      className="p-2 hover:bg-gray-100 rounded"
                      title={webhook.status === 'active' ? 'Disable' : 'Enable'}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteWebhook(webhook.id)}
                      className="p-2 hover:bg-red-50 rounded text-red-600"
                      title="Delete webhook"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {webhook.description && (
                  <p className="text-sm text-gray-600 mb-2">{webhook.description}</p>
                )}
                
                <div className="mb-2">
                  <p className="text-xs text-gray-500 mb-1">Subscribed Events:</p>
                  <div className="flex flex-wrap gap-1">
                    {webhook.events.map(event => (
                      <span key={event} className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">
                        {event}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-green-600" />
                    Success: {webhook.success_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <X className="w-3 h-3 text-red-600" />
                    Failed: {webhook.failure_count}
                  </span>
                  <span>•</span>
                  <span className="font-medium text-green-600">Success Rate: {webhook.success_rate}%</span>
                  <span>•</span>
                  <span>Created: {new Date(webhook.created_at).toLocaleDateString()}</span>
                  {webhook.last_triggered && (
                    <>
                      <span>•</span>
                      <span>Last triggered: {new Date(webhook.last_triggered).toLocaleString()}</span>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* System Logs Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">System Logs</h2>
              <p className="text-sm text-gray-600">View real-time system activity and events</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchSystemLogs}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={exportSystemLogs}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {systemLogs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No system logs available</p>
            </div>
          ) : (
            systemLogs.map((log) => (
              <div key={log.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(log.level)}`}>
                    {log.level.toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{log.message}</p>
                    {log.details && <p className="text-xs text-gray-600 mt-1">{log.details}</p>}
                    <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                      {log.user && <span>User: {log.user}</span>}
                      {log.endpoint && <span>• {log.method} {log.endpoint}</span>}
                      {log.ip_address && <span>• IP: {log.ip_address}</span>}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Error Tracking Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Error Tracking</h2>
              <p className="text-sm text-gray-600">Monitor and debug application errors</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="text-red-600 border-red-600 hover:bg-red-50"
            onClick={clearAllErrors}
          >
            Clear Resolved Errors
          </Button>
        </div>

        <div className="space-y-4">
          {errors.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <AlertTriangle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No unresolved errors</p>
              <p className="text-sm">Your system is running smoothly!</p>
            </div>
          ) : (
            errors.map((error) => (
              <div key={error.id} className="p-4 border border-red-200 bg-red-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-1 bg-red-600 text-white rounded text-xs font-medium">
                        {error.error_type}
                      </span>
                      <span className="px-2 py-1 bg-red-200 text-red-800 rounded text-xs font-medium">
                        Count: {error.count}
                      </span>
                      {error.endpoint && (
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                          {error.method} {error.endpoint}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-red-900 mb-1">{error.message}</h3>
                    <p className="text-xs text-gray-600">
                      First: {new Date(error.timestamp).toLocaleString()} | Last: {new Date(error.last_occurrence).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => resolveError(error.id)}
                      className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      title="Mark as resolved"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteError(error.id)}
                      className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      title="Delete error"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {error.stack_trace && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-red-700 font-medium hover:text-red-800">
                      View Stack Trace
                    </summary>
                    <pre className="mt-2 p-3 bg-white rounded text-xs overflow-x-auto border border-red-200">
                      {error.stack_trace}
                    </pre>
                  </details>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TechManagement;
