import React, { useState, useEffect } from 'react';
import { Code, Link2, Download, Webhook, Copy, Check, ExternalLink, Globe } from 'lucide-react';
import { chatbotAPI } from '../utils/api';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || ''
});
import { toast } from 'sonner';

const SharingTab = ({ chatbot, onUpdate }) => {
  const [copied, setCopied] = useState('');
  const [webhookUrl, setWebhookUrl] = useState(chatbot?.webhook_url || '');
  const [webhookEnabled, setWebhookEnabled] = useState(chatbot?.webhook_enabled || false);
  const [publicAccess, setPublicAccess] = useState(chatbot?.public_access || false);
  const [saving, setSaving] = useState(false);

  // Update state when chatbot prop changes
  useEffect(() => {
    if (chatbot) {
      setWebhookUrl(chatbot.webhook_url || '');
      setWebhookEnabled(chatbot.webhook_enabled || false);
      setPublicAccess(chatbot.public_access || false);
    }
  }, [chatbot]);

  const publicChatUrl = `${window.location.origin}/public-chat/${chatbot?.id}`;
  
  const embedCode = `<!-- BotSmith Chat Widget -->
<script 
  src="${window.location.origin}/widget.js" 
  chatbot-id="${chatbot?.id}"
  domain="${window.location.origin}"
  defer>
</script>`;

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const response = await chatbotAPI.update(chatbot.id, {
        public_access: publicAccess,
        webhook_url: webhookUrl,
        webhook_enabled: webhookEnabled
      });
      
      // Update local state with saved values from backend
      if (response.data) {
        setPublicAccess(response.data.public_access || false);
        setWebhookUrl(response.data.webhook_url || '');
        setWebhookEnabled(response.data.webhook_enabled || false);
      }
      
      toast.success('Settings saved successfully! Your changes are now live.');
      
      // Trigger parent refresh to update chatbot data
      if (onUpdate) {
        await onUpdate();
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await api.get(`/api/public/conversations/${chatbot.id}/export?format=${format}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `chatbot_${chatbot.id}_export.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Exported conversations as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export conversations');
    }
  };

  return (
    <div className="space-y-6">
      {/* Public Access Toggle */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Globe className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="text-lg font-semibold">Public Access</h3>
              <p className="text-sm text-gray-600">Allow anyone to chat with your bot</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={publicAccess}
              onChange={(e) => setPublicAccess(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
      </div>

      {/* Public Chat Link */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <Link2 className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Public Chat Link</h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-3">
          Share this link to let anyone chat with your bot
        </p>
        
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={publicChatUrl}
            readOnly
            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
          />
          <button
            onClick={() => copyToClipboard(publicChatUrl, 'link')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            {copied === 'link' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied === 'link' ? 'Copied!' : 'Copy'}</span>
          </button>
          <a
            href={publicChatUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Embed Code */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <Code className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Embed on Your Website</h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-3">
          Copy and paste this code into your website's HTML
        </p>
        
        <div className="relative">
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
            <code>{embedCode}</code>
          </pre>
          <button
            onClick={() => copyToClipboard(embedCode, 'embed')}
            className="absolute top-3 right-3 px-3 py-1.5 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors flex items-center space-x-1"
          >
            {copied === 'embed' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copied === 'embed' ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Export Conversations */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <Download className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Export Conversations</h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Download all conversation data for analysis
        </p>
        
        <div className="flex space-x-3">
          <button
            onClick={() => handleExport('json')}
            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium"
          >
            Export as JSON
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors font-medium"
          >
            Export as CSV
          </button>
        </div>
      </div>

      {/* Webhook Configuration */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <Webhook className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Webhook Notifications</h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Receive real-time notifications when users send messages
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Webhook URL
            </label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-server.com/webhook"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Enable Webhooks</p>
              <p className="text-xs text-gray-500">Send POST requests to the URL above</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={webhookEnabled}
                onChange={(e) => setWebhookEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default SharingTab;
