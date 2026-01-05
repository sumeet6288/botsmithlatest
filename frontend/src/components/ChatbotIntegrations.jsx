import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '../hooks/use-toast';
import api from '../utils/api';
import { 
  MessageCircle, 
  Send, 
  CheckCircle, 
  Copy, 
  ExternalLink,
  AlertCircle,
  Zap,
  Globe,
  Phone,
  Settings,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  Activity,
  XCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Switch } from './ui/switch';

const ChatbotIntegrations = ({ chatbot }) => {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIntegration, setActiveIntegration] = useState(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [logs, setLogs] = useState([]);
  const [credentials, setCredentials] = useState({});
  const [showCredentials, setShowCredentials] = useState({});
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  const integrationDefinitions = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      description: 'Connect your chatbot to WhatsApp Business API',
      icon: <Phone className="w-6 h-6" />,
      gradient: 'from-green-500 to-green-600',
      fields: [
        { name: 'access_token', label: 'Access Token (from Meta Business Suite)', type: 'password', required: true },
        { name: 'phone_number_id', label: 'Phone Number ID', type: 'text', required: true },
        { name: 'verify_token', label: 'Verify Token (for webhook)', type: 'text', required: false, placeholder: 'botsmith_verify_token' }
      ]
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Deploy chatbot to your Slack workspace',
      icon: <Send className="w-6 h-6" />,
      gradient: 'from-purple-500 to-purple-600',
      fields: [
        { name: 'bot_token', label: 'Bot Token', type: 'password', required: true },
        { name: 'workspace_url', label: 'Workspace URL', type: 'text', required: false },
        { name: 'signing_secret', label: 'Signing Secret', type: 'password', required: false }
      ]
    },
    {
      id: 'telegram',
      name: 'Telegram',
      description: 'Create a Telegram bot for your chatbot',
      icon: <Send className="w-6 h-6" />,
      gradient: 'from-blue-500 to-blue-600',
      fields: [
        { name: 'bot_token', label: 'Bot Token', type: 'password', required: true },
        { name: 'username', label: 'Bot Username', type: 'text', required: false }
      ]
    },
    {
      id: 'discord',
      name: 'Discord',
      description: 'Add chatbot to your Discord server',
      icon: <MessageCircle className="w-6 h-6" />,
      gradient: 'from-indigo-500 to-indigo-600',
      fields: [
        { name: 'bot_token', label: 'Bot Token', type: 'password', required: true },
        { name: 'client_id', label: 'Client ID', type: 'text', required: false },
        { name: 'server_id', label: 'Server ID', type: 'text', required: false }
      ]
    },
    {
      id: 'msteams',
      name: 'Microsoft Teams',
      description: 'Deploy chatbot to Microsoft Teams',
      icon: <MessageCircle className="w-6 h-6" />,
      gradient: 'from-purple-600 to-blue-600',
      fields: [
        { name: 'app_id', label: 'Bot App ID', type: 'text', required: true },
        { name: 'app_password', label: 'App Password', type: 'password', required: true },
        { name: 'tenant_id', label: 'Tenant ID', type: 'text', required: false }
      ]
    },
    {
      id: 'api',
      name: 'REST API',
      description: 'Integrate via REST API for custom applications',
      icon: <Zap className="w-6 h-6" />,
      gradient: 'from-orange-500 to-orange-600',
      fields: [],
      isAPIIntegration: true
    },
    {
      id: 'messenger',
      name: 'Facebook Messenger',
      description: 'Connect to Facebook Messenger',
      icon: <MessageCircle className="w-6 h-6" />,
      gradient: 'from-blue-600 to-blue-700',
      fields: [
        { name: 'page_access_token', label: 'Page Access Token', type: 'password', required: true },
        { name: 'app_secret', label: 'App Secret', type: 'password', required: false },
        { name: 'verify_token', label: 'Verify Token', type: 'text', required: false }
      ]
    },
    {
      id: 'instagram',
      name: 'Instagram',
      description: 'Connect your chatbot to Instagram Direct Messages',
      icon: <MessageCircle className="w-6 h-6" />,
      gradient: 'from-pink-500 to-purple-600',
      fields: [
        { name: 'page_access_token', label: 'Page Access Token', type: 'password', required: true },
        { name: 'verify_token', label: 'Verify Token', type: 'text', required: false },
        { name: 'app_secret', label: 'App Secret', type: 'password', required: false }
      ]
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Connect your chatbot to Zapier for workflow automation',
      icon: <Zap className="w-6 h-6" />,
      gradient: 'from-orange-400 to-orange-600',
      fields: [
        { name: 'webhook_url', label: 'Webhook URL (from Zapier)', type: 'text', required: true },
        { name: 'api_key', label: 'API Key (optional)', type: 'password', required: false }
      ]
    }
  ];

  useEffect(() => {
    fetchIntegrations();
  }, [chatbot.id]);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/integrations/${chatbot.id}`);
      setIntegrations(response.data);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load integrations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await api.get(`/integrations/${chatbot.id}/logs`);
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const getIntegrationStatus = (integrationType) => {
    const integration = integrations.find(i => i.integration_type === integrationType);
    if (!integration) return null;
    return integration;
  };

  const openSetupModal = (definition) => {
    const existingIntegration = getIntegrationStatus(definition.id);
    setActiveIntegration(definition);
    setCredentials({});
    setShowCredentials({});
    setShowSetupModal(true);
  };

  const handleSaveIntegration = async () => {
    if (!activeIntegration) return;

    // Validate required fields
    const requiredFields = activeIntegration.fields.filter(f => f.required);
    const missingFields = requiredFields.filter(f => !credentials[f.name]);
    
    if (missingFields.length > 0) {
      toast({
        title: 'Missing Fields',
        description: `Please fill in: ${missingFields.map(f => f.label).join(', ')}`,
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);
      await api.post(`/integrations/${chatbot.id}`, {
        integration_type: activeIntegration.id,
        credentials: credentials,
        metadata: {}
      });

      toast({
        title: 'Success',
        description: `${activeIntegration.name} integration saved successfully`
      });

      setShowSetupModal(false);
      fetchIntegrations();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to save integration',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleIntegration = async (integrationId, currentStatus) => {
    try {
      await api.post(`/integrations/${chatbot.id}/${integrationId}/toggle`);
      
      toast({
        title: 'Success',
        description: `Integration ${currentStatus ? 'disabled' : 'enabled'}`
      });

      fetchIntegrations();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to toggle integration',
        variant: 'destructive'
      });
    }
  };

  const handleTestConnection = async (integrationId) => {
    try {
      setTesting(true);
      const response = await api.post(`/integrations/${chatbot.id}/${integrationId}/test`);
      
      if (response.data.success) {
        toast({
          title: 'Connection Successful',
          description: response.data.message
        });
      } else {
        toast({
          title: 'Connection Failed',
          description: response.data.message,
          variant: 'destructive'
        });
      }

      fetchIntegrations();
    } catch (error) {
      toast({
        title: 'Test Failed',
        description: error.response?.data?.detail || 'Failed to test connection',
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSetupTelegramWebhook = async (integrationId) => {
    try {
      setTesting(true);
      const baseUrl = process.env.REACT_APP_BACKEND_URL || window.location.origin;
      const response = await api.post(`/telegram/${chatbot.id}/setup-webhook`, {
        base_url: baseUrl
      });
      
      if (response.data.success) {
        toast({
          title: 'Webhook Configured',
          description: 'Telegram webhook has been set up successfully. Your bot is ready to receive messages!'
        });
        fetchIntegrations();
      }
    } catch (error) {
      toast({
        title: 'Webhook Setup Failed',
        description: error.response?.data?.detail || 'Failed to setup webhook',
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSetupSlackWebhook = async (integrationId) => {
    try {
      setTesting(true);
      const baseUrl = process.env.REACT_APP_BACKEND_URL || window.location.origin;
      const response = await api.post(`/slack/${chatbot.id}/setup-webhook`, {
        base_url: baseUrl
      });
      
      if (response.data.success) {
        // Show instructions in a modal or alert
        const instructions = response.data.instructions || [];
        const instructionsText = instructions.join('\n');
        
        toast({
          title: 'Webhook URL Generated',
          description: `Webhook URL: ${response.data.webhook_url}\n\nPlease complete setup in Slack App settings. Check console for detailed instructions.`
        });
        
        // Log instructions to console for easy access
        console.log('=== Slack Webhook Setup Instructions ===');
        console.log(`Webhook URL: ${response.data.webhook_url}`);
        console.log('\nSteps to complete:');
        instructions.forEach((instruction, index) => {
          console.log(instruction);
        });
        console.log('========================================');
        
        fetchIntegrations();
      }
    } catch (error) {
      toast({
        title: 'Webhook Setup Failed',
        description: error.response?.data?.detail || 'Failed to setup webhook',
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSetupInstagramWebhook = async (integrationId) => {
    try {
      setTesting(true);
      const baseUrl = process.env.REACT_APP_BACKEND_URL || window.location.origin;
      const response = await api.post(`/instagram/${chatbot.id}/setup-webhook`, {
        base_url: baseUrl
      });
      
      // Show instructions
      const instructions = response.data.instructions || [];
      
      toast({
        title: 'Webhook URL Generated',
        description: `Webhook URL: ${response.data.webhook_url}\nVerify Token: ${response.data.verify_token}\n\nCheck console for detailed instructions.`
      });
      
      // Log instructions to console for easy access
      console.log('=== Instagram Webhook Setup Instructions ===');
      console.log(`Webhook URL: ${response.data.webhook_url}`);
      console.log(`Verify Token: ${response.data.verify_token}`);
      console.log('\nSteps to complete:');
      instructions.forEach((instruction) => {
        console.log(instruction);
      });
      console.log('===========================================');
      
      fetchIntegrations();
    } catch (error) {
      toast({
        title: 'Webhook Setup Failed',
        description: error.response?.data?.detail || 'Failed to setup webhook',
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSetupWhatsAppWebhook = async (integrationId) => {
    try {
      setTesting(true);
      const response = await api.post(`/whatsapp/${chatbot.id}/setup-webhook`);
      
      // Show instructions
      const instructions = response.data.instructions || [];
      
      toast({
        title: 'WhatsApp Webhook URL Generated',
        description: `Webhook URL: ${response.data.webhook_url}\nVerify Token: ${response.data.verify_token}\n\nCheck console for detailed instructions.`
      });
      
      // Log instructions to console for easy access
      console.log('=== WhatsApp Webhook Setup Instructions ===');
      console.log(`Webhook URL: ${response.data.webhook_url}`);
      console.log(`Verify Token: ${response.data.verify_token}`);
      console.log('\nSteps to complete:');
      instructions.forEach((instruction) => {
        console.log(instruction);
      });
      console.log('===========================================');
      
      fetchIntegrations();
    } catch (error) {
      toast({
        title: 'Webhook Setup Failed',
        description: error.response?.data?.detail || 'Failed to setup WhatsApp webhook',
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSetupMessengerWebhook = async (integrationId) => {
    try {
      setTesting(true);
      const response = await api.post(`/messenger/${chatbot.id}/setup-webhook`);
      
      // Show instructions
      const instructions = response.data.instructions || [];
      
      toast({
        title: 'Messenger Webhook URL Generated',
        description: `Webhook URL: ${response.data.webhook_url}\nVerify Token: ${response.data.verify_token}\n\nCheck console for detailed instructions.`
      });
      
      // Log instructions to console for easy access
      console.log('=== Facebook Messenger Webhook Setup Instructions ===');
      console.log(`Webhook URL: ${response.data.webhook_url}`);
      console.log(`Verify Token: ${response.data.verify_token}`);
      console.log('\nSteps to complete:');
      instructions.forEach((instruction) => {
        console.log(instruction);
      });
      console.log('=======================================================');
      
      fetchIntegrations();
    } catch (error) {
      toast({
        title: 'Webhook Setup Failed',
        description: error.response?.data?.detail || 'Failed to setup Messenger webhook',
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleStartDiscordBot = async (integrationId) => {
    try {
      setTesting(true);
      const response = await api.post(`/discord/${chatbot.id}/start-bot`);
      
      if (response.data.success) {
        toast({
          title: 'Discord Bot Started',
          description: 'Your Discord bot is now online and listening for messages!',
        });
        
        fetchIntegrations();
      }
    } catch (error) {
      toast({
        title: 'Failed to Start Bot',
        description: error.response?.data?.detail || 'Failed to start Discord bot',
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleStopDiscordBot = async (integrationId) => {
    try {
      setTesting(true);
      const response = await api.post(`/discord/${chatbot.id}/stop-bot`);
      
      if (response.data.success) {
        toast({
          title: 'Discord Bot Stopped',
          description: 'Your Discord bot has been stopped.',
        });
        
        fetchIntegrations();
      }
    } catch (error) {
      toast({
        title: 'Failed to Stop Bot',
        description: error.response?.data?.detail || 'Failed to stop Discord bot',
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };


  const handleDeleteIntegration = async (integrationId, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name} integration?`)) {
      return;
    }

    try {
      await api.delete(`/integrations/${chatbot.id}/${integrationId}`);
      
      toast({
        title: 'Success',
        description: `${name} integration deleted`
      });

      fetchIntegrations();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete integration',
        variant: 'destructive'
      });
    }
  };

  const copyWebhookURL = async () => {
    const webhookURL = `${window.location.origin}/api/webhook/${chatbot.id}`;
    try {
      await navigator.clipboard.writeText(webhookURL);
      toast({
        title: 'Copied!',
        description: 'Webhook URL copied to clipboard'
      });
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = webhookURL;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        toast({ title: 'Copied!', description: 'Webhook URL copied to clipboard' });
      } catch (execErr) {
        toast({ title: 'Copy Failed', description: 'Could not copy to clipboard', variant: 'destructive' });
      }
      document.body.removeChild(textarea);
    }
  };

  const copyAPIKey = async () => {
    try {
      await navigator.clipboard.writeText(chatbot.id);
      toast({
        title: 'Copied!',
        description: 'Chatbot ID copied to clipboard'
      });
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = chatbot.id;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        toast({ title: 'Copied!', description: 'Chatbot ID copied to clipboard' });
      } catch (execErr) {
        toast({ title: 'Copy Failed', description: 'Could not copy to clipboard', variant: 'destructive' });
      }
      document.body.removeChild(textarea);
    }
  };

  const getStatusBadge = (status, enabled) => {
    if (!enabled) {
      return (
        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
          Disabled
        </span>
      );
    }

    switch (status) {
      case 'connected':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Connected
          </span>
        );
      case 'error':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Error
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
            Pending Test
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
            Available
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent">
            Platform Integrations
          </h2>
          <p className="text-gray-600">
            Connect your chatbot to various platforms and channels
          </p>
        </div>
        <Button
          onClick={() => {
            setShowLogsModal(true);
            fetchLogs();
          }}
          variant="outline"
          className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
        >
          <Activity className="w-4 h-4 mr-2" />
          View Activity Logs
        </Button>
      </div>

      {/* Global Webhook & API Info */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Integration Credentials</h3>
            <p className="text-sm text-gray-600">Use these credentials to connect your chatbot to external platforms</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Webhook URL</label>
            <div className="flex gap-2">
              <Input
                value={`${window.location.origin}/api/webhook/${chatbot.id}`}
                readOnly
                className="font-mono text-xs bg-white"
              />
              <Button
                onClick={copyWebhookURL}
                variant="outline"
                size="sm"
                className="flex-shrink-0"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Chatbot ID</label>
            <div className="flex gap-2">
              <Input
                value={chatbot.id}
                readOnly
                className="font-mono text-xs bg-white"
              />
              <Button
                onClick={copyAPIKey}
                variant="outline"
                size="sm"
                className="flex-shrink-0"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {integrationDefinitions.map((definition) => {
          const integration = getIntegrationStatus(definition.id);
          const isConfigured = !!integration;

          return (
            <Card
              key={definition.id}
              className={`p-6 hover:shadow-xl transition-all duration-300 border-2 ${
                integration?.enabled && integration?.status === 'connected'
                  ? 'border-green-200 bg-green-50/30' 
                  : isConfigured
                  ? 'border-purple-200/50'
                  : 'border-gray-200 hover:border-purple-400'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-12 h-12 bg-gradient-to-br ${definition.gradient} rounded-xl flex items-center justify-center text-white shadow-lg transform hover:scale-110 transition-transform flex-shrink-0`}>
                    {definition.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {definition.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {definition.description}
                    </p>
                  </div>
                </div>
                {isConfigured && getStatusBadge(integration.status, integration.enabled)}
              </div>

              {integration?.error_message && integration.enabled && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-red-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{integration.error_message}</span>
                  </p>
                </div>
              )}

              {definition.id === 'discord' && isConfigured && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Important:</strong> Enable "MESSAGE CONTENT INTENT" in Discord Developer Portal → Your App → Bot → Privileged Gateway Intents. 
                      Then click the ⚡ Start Bot button below.
                    </span>
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {isConfigured && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Enable Integration</span>
                    </div>
                    <Switch
                      checked={integration.enabled}
                      onCheckedChange={() => handleToggleIntegration(integration.id, integration.enabled)}
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    onClick={() => openSetupModal(definition)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    {isConfigured ? 'Reconfigure' : 'Setup'}
                  </Button>

                  {isConfigured && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => handleTestConnection(integration.id)}
                        disabled={testing}
                        className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                      >
                        <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
                      </Button>

                      {definition.id === 'telegram' && (
                        <Button
                          variant="outline"
                          onClick={() => handleSetupTelegramWebhook(integration.id)}
                          disabled={testing}
                          className="border-2 border-green-600 text-green-600 hover:bg-green-50"
                          title="Setup Telegram Webhook"
                        >
                          <Zap className="w-4 h-4" />
                        </Button>
                      )}

                      {definition.id === 'slack' && (
                        <Button
                          variant="outline"
                          onClick={() => handleSetupSlackWebhook(integration.id)}
                          disabled={testing}
                          className="border-2 border-green-600 text-green-600 hover:bg-green-50"
                          title="Setup Slack Webhook"
                        >
                          <Zap className="w-4 h-4" />
                        </Button>
                      )}

                      {definition.id === 'discord' && (
                        <Button
                          variant="outline"
                          onClick={() => handleStartDiscordBot(integration.id)}
                          disabled={testing}
                          className="border-2 border-green-600 text-green-600 hover:bg-green-50"
                          title="Start Discord Bot (Required for Messages)"
                        >
                          <Zap className="w-4 h-4" />
                        </Button>
                      )}

                      {definition.id === 'instagram' && (
                        <Button
                          variant="outline"
                          onClick={() => handleSetupInstagramWebhook(integration.id)}
                          disabled={testing}
                          className="border-2 border-green-600 text-green-600 hover:bg-green-50"
                          title="Setup Instagram Webhook"
                        >
                          <Zap className="w-4 h-4" />
                        </Button>
                      )}

                      {definition.id === 'whatsapp' && (
                        <Button
                          variant="outline"
                          onClick={() => handleSetupWhatsAppWebhook(integration.id)}
                          disabled={testing}
                          className="border-2 border-green-600 text-green-600 hover:bg-green-50"
                          title="Setup WhatsApp Webhook"
                        >
                          <Zap className="w-4 h-4" />
                        </Button>
                      )}

                      {definition.id === 'messenger' && (
                        <Button
                          variant="outline"
                          onClick={() => handleSetupMessengerWebhook(integration.id)}
                          disabled={testing}
                          className="border-2 border-green-600 text-green-600 hover:bg-green-50"
                          title="Setup Messenger Webhook"
                        >
                          <Zap className="w-4 h-4" />
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        onClick={() => handleDeleteIntegration(integration.id, definition.name)}
                        className="border-2 border-red-600 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Setup Modal */}
      <Dialog open={showSetupModal} onOpenChange={setShowSetupModal}>
        <DialogContent className={`${activeIntegration?.isAPIIntegration ? 'max-w-3xl' : 'max-w-md'} max-h-[80vh] overflow-y-auto`}>
          <DialogHeader>
            <DialogTitle>
              {activeIntegration?.isAPIIntegration ? (
                <span className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-600" />
                  {activeIntegration?.name} Documentation
                </span>
              ) : (
                `Setup ${activeIntegration?.name}`
              )}
            </DialogTitle>
            <DialogDescription>
              {activeIntegration?.isAPIIntegration 
                ? 'Use these API endpoints to integrate your chatbot programmatically'
                : `Enter your ${activeIntegration?.name} credentials to connect this integration`
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {activeIntegration?.isAPIIntegration ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-orange-600" />
                    REST API Integration
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Use these endpoints to integrate your chatbot into custom applications via REST API.
                  </p>
                </div>

                {/* Base URL */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Base URL</Label>
                  <div className="flex gap-2">
                    <Input
                      value={process.env.REACT_APP_BACKEND_URL || window.location.origin}
                      readOnly
                      className="font-mono text-xs bg-gray-50"
                    />
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(process.env.REACT_APP_BACKEND_URL || window.location.origin);
                        toast({ title: 'Copied!', description: 'Base URL copied to clipboard' });
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Chatbot ID */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Chatbot ID</Label>
                  <div className="flex gap-2">
                    <Input
                      value={chatbot.id}
                      readOnly
                      className="font-mono text-xs bg-gray-50"
                    />
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(chatbot.id);
                        toast({ title: 'Copied!', description: 'Chatbot ID copied to clipboard' });
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* API Endpoints */}
                <div className="space-y-3 mt-4">
                  <h4 className="font-semibold text-gray-900 text-sm">Available Endpoints</h4>
                  
                  {/* Send Message Endpoint */}
                  <div className="bg-white border-2 border-gray-200 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-mono font-bold rounded">POST</span>
                      <code className="text-xs text-gray-700 font-mono">/api/public/chat/{'{chatbot_id}'}</code>
                    </div>
                    <p className="text-xs text-gray-600">Send a message and get AI response</p>
                    <div className="bg-gray-50 rounded p-2 text-xs font-mono">
                      <div className="text-gray-500">// Request Body</div>
                      <div className="text-gray-700">{`{`}</div>
                      <div className="text-gray-700 pl-4">"message": "Your message here",</div>
                      <div className="text-gray-700 pl-4">"session_id": "unique-session-id",</div>
                      <div className="text-gray-700 pl-4">"user_name": "Optional User Name"</div>
                      <div className="text-gray-700">{`}`}</div>
                    </div>
                  </div>

                  {/* Get Chatbot Info */}
                  <div className="bg-white border-2 border-gray-200 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-mono font-bold rounded">GET</span>
                      <code className="text-xs text-gray-700 font-mono">/api/public/chatbot/{'{chatbot_id}'}</code>
                    </div>
                    <p className="text-xs text-gray-600">Get chatbot configuration and settings</p>
                  </div>

                  {/* Example cURL */}
                  <div className="bg-gray-900 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-xs font-semibold">Example cURL Request</span>
                      <Button
                        onClick={() => {
                          const curlCommand = `curl -X POST "${process.env.REACT_APP_BACKEND_URL || window.location.origin}/api/public/chat/${chatbot.id}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "Hello, how can you help me?",
    "session_id": "test-session-123",
    "user_name": "Test User"
  }'`;
                          navigator.clipboard.writeText(curlCommand);
                          toast({ title: 'Copied!', description: 'cURL command copied to clipboard' });
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-gray-800"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <pre className="text-xs text-green-400 overflow-x-auto">
{`curl -X POST "${process.env.REACT_APP_BACKEND_URL || window.location.origin}/api/public/chat/${chatbot.id}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "Hello!",
    "session_id": "session-123"
  }'`}
                    </pre>
                  </div>
                </div>

                {/* Documentation Link */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-blue-800 font-semibold mb-1">Full API Documentation</p>
                      <p className="text-xs text-blue-700 mb-2">
                        For complete API documentation including all endpoints, authentication, and examples:
                      </p>
                      <Button
                        onClick={() => window.open(`${process.env.REACT_APP_BACKEND_URL || window.location.origin}/docs`, '_blank')}
                        variant="outline"
                        size="sm"
                        className="text-xs border-blue-600 text-blue-600 hover:bg-blue-100"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Open API Docs
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {activeIntegration?.fields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name}>
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </Label>
                    <div className="relative">
                      <Input
                        id={field.name}
                        type={showCredentials[field.name] ? 'text' : field.type}
                        value={credentials[field.name] || ''}
                        onChange={(e) => setCredentials({...credentials, [field.name]: e.target.value})}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        className="pr-10"
                      />
                      {field.type === 'password' && (
                        <button
                          type="button"
                          onClick={() => setShowCredentials({...showCredentials, [field.name]: !showCredentials[field.name]})}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showCredentials[field.name] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {activeIntegration?.fields.length === 0 && !activeIntegration?.isAPIIntegration && (
                  <p className="text-sm text-gray-600 text-center py-4">
                    This integration doesn't require any credentials. Click save to activate.
                  </p>
                )}
              </>
            )}
          </div>

          <div className="flex gap-3">
            {activeIntegration?.isAPIIntegration ? (
              <Button
                onClick={() => setShowSetupModal(false)}
                className="flex-1 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white"
              >
                Close
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowSetupModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveIntegration}
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  {saving ? 'Saving...' : 'Save Integration'}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Activity Logs Modal */}
      <Dialog open={showLogsModal} onOpenChange={setShowLogsModal}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Integration Activity Logs</DialogTitle>
            <DialogDescription>
              Recent activity for all integrations
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-96 overflow-y-auto py-4">
            {logs.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No activity logs yet</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className={`p-4 rounded-lg border-2 ${
                  log.status === 'success' ? 'bg-green-50 border-green-200' :
                  log.status === 'failure' ? 'bg-red-50 border-red-200' :
                  'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        log.status === 'success' ? 'bg-green-500' :
                        log.status === 'failure' ? 'bg-red-500' :
                        'bg-yellow-500'
                      }`}></span>
                      <span className="font-semibold text-sm capitalize">
                        {log.integration_type}
                      </span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-600 capitalize">
                        {log.event_type.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{log.message}</p>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatbotIntegrations;
