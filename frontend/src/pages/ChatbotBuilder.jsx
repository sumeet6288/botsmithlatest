import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Slider } from '../components/ui/slider';
import { Plus, FileText, Globe, Trash2, Loader2, MessageSquare, ArrowLeft, Settings, Palette, BarChart3, User, Clock, ChevronDown, ChevronUp, TrendingUp, Zap, Link2, Copy, Check, ExternalLink, Download, Webhook, Code } from 'lucide-react';
import { Progress } from '../components/ui/progress';
import UserProfileDropdown from '../components/UserProfileDropdown';
import AddSourceModal from '../components/AddSourceModal';
import ChatPreviewModal from '../components/ChatPreviewModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import AppearanceTab from '../components/AppearanceTab';
import AdvancedAnalytics from '../components/AdvancedAnalytics';
import ChatbotIntegrations from '../components/ChatbotIntegrations';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { chatbotAPI, sourceAPI, chatAPI } from '../utils/api';
import { AI_PROVIDERS, getAllModels } from '../utils/models';
import axios from 'axios';

const ChatbotBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [chatbot, setChatbot] = useState(null);
  const [sources, setSources] = useState([]);
  const [isAddSourceModalOpen, setIsAddSourceModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sourceToDelete, setSourceToDelete] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [activeTab, setActiveTab] = useState('sources');
  const [publicAccess, setPublicAccess] = useState(true); // Always on by default
  const [copied, setCopied] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    loadChatbot();
  }, [id]);

  // Sync public access state with chatbot data
  useEffect(() => {
    if (chatbot) {
      setPublicAccess(chatbot.public_access !== undefined ? chatbot.public_access : true);
      setWebhookUrl(chatbot.webhook_url || '');
      setWebhookEnabled(chatbot.webhook_enabled || false);
    }
  }, [chatbot]);

  // Auto-load conversations when analytics tab is opened
  useEffect(() => {
    if (activeTab === 'analytics' && chatbot && conversations.length === 0 && !loadingConversations) {
      loadConversations();
    }
  }, [activeTab, chatbot]);

  const loadChatbot = async () => {
    try {
      setLoading(true);
      const [chatbotResponse, sourcesResponse] = await Promise.all([
        chatbotAPI.get(id),
        sourceAPI.list(id)
      ]);
      setChatbot(chatbotResponse.data);
      setSources(sourcesResponse.data);
    } catch (error) {
      console.error('Error loading chatbot:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chatbot',
        variant: 'destructive'
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const refreshChatbot = async () => {
    try {
      const chatbotResponse = await chatbotAPI.get(id);
      setChatbot(chatbotResponse.data);
    } catch (error) {
      console.error('Error refreshing chatbot:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh chatbot',
        variant: 'destructive'
      });
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await chatbotAPI.update(id, {
        name: chatbot.name,
        model: chatbot.model,
        provider: chatbot.provider,
        temperature: chatbot.temperature,
        instructions: chatbot.instructions,
        welcome_message: chatbot.welcome_message,
        status: chatbot.status
      });
      toast({
        title: 'Success',
        description: 'Settings saved successfully'
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSource = async (sourceId) => {
    try {
      await sourceAPI.delete(sourceId);
      setSources(sources.filter(s => s.id !== sourceId));
      toast({
        title: 'Success',
        description: 'Source deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting source:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete source',
        variant: 'destructive'
      });
    }
    setIsDeleteModalOpen(false);
    setSourceToDelete(null);
  };

  const loadConversations = async () => {
    try {
      setLoadingConversations(true);
      const response = await chatAPI.getConversations(id);
      setConversations(response.data);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat logs',
        variant: 'destructive'
      });
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      setLoadingMessages(true);
      const response = await chatAPI.getMessages(conversationId);
      setMessages(response.data);
      setSelectedConversation(conversationId);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive'
      });
    } finally {
      setLoadingMessages(false);
    }
  };

  const toggleConversation = (conversationId) => {
    if (selectedConversation === conversationId) {
      setSelectedConversation(null);
      setMessages([]);
    } else {
      loadMessages(conversationId);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteChatbot = async () => {
    try {
      await chatbotAPI.delete(id);
      toast({
        title: 'Success',
        description: 'Chatbot deleted successfully'
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting chatbot:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete chatbot',
        variant: 'destructive'
      });
    }
  };

  const handleModelChange = (model) => {
    const allModels = getAllModels();
    const selectedModel = allModels.find(m => m.value === model);
    if (selectedModel) {
      setChatbot({
        ...chatbot,
        model: model,
        provider: selectedModel.provider
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Public access and sharing functions
  const publicChatUrl = chatbot ? `${window.location.origin}/public-chat/${chatbot.id}` : '';

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast({
        title: 'Copied!',
        description: 'Copied to clipboard successfully'
      });
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy to clipboard',
        variant: 'destructive'
      });
    }
  };

  const handleSavePublicAccess = async () => {
    try {
      await chatbotAPI.update(id, {
        public_access: publicAccess,
        webhook_url: webhookUrl,
        webhook_enabled: webhookEnabled
      });
      toast({
        title: 'Success',
        description: 'Public access settings saved successfully'
      });
      await refreshChatbot();
    } catch (error) {
      console.error('Error updating public access:', error);
      toast({
        title: 'Error',
        description: 'Failed to update settings',
        variant: 'destructive'
      });
    }
  };

  const handleExport = async (format) => {
    try {
      const api = axios.create({
        baseURL: process.env.REACT_APP_BACKEND_URL || ''
      });
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
      
      toast({
        title: 'Success',
        description: `Exported conversations as ${format.toUpperCase()}`
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Error',
        description: 'Failed to export conversations',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-pink-600 rounded-full animate-spin animation-delay-300"></div>
        </div>
      </div>
    );
  }

  if (!chatbot) {
    return null;
  }

  const allModels = getAllModels();
  const embedCode = `<iframe src="${window.location.origin}/embed/${chatbot.id}" width="100%" height="600px" frameborder="0"></iframe>`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      </div>

      {/* Top Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-purple-200/50 sticky top-0 z-50 shadow-sm">
        <div className="px-4 sm:px-8 py-4 flex items-center justify-between max-w-[95%] mx-auto">
          <div className="flex items-center gap-2 sm:gap-6 animate-fade-in-right">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="group hover:bg-purple-50 transition-all duration-300 p-2">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent truncate">{chatbot.name}</h1>
              <p className="text-xs text-gray-500 truncate hidden sm:block">ID: {chatbot.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 animate-fade-in">
            <Button 
              variant="outline" 
              onClick={() => setIsPreviewModalOpen(true)}
              className="border-2 border-purple-300 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white hover:border-transparent transition-all duration-300 transform hover:scale-105 group text-xs sm:text-sm px-2 sm:px-4"
            >
              <MessageSquare className="w-4 h-4 sm:mr-2 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Preview</span>
            </Button>
            <UserProfileDropdown user={user} onLogout={handleLogout} />
          </div>
        </div>
      </nav>

      <div className="p-4 sm:p-6 max-w-[95%] mx-auto relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Mobile: Horizontal scrolling tabs */}
          <div className="mb-6 overflow-x-auto scrollbar-hide">
            <TabsList className="inline-flex w-max min-w-full lg:grid lg:w-full lg:grid-cols-7 gap-2 bg-white/80 backdrop-blur-sm border-2 border-purple-200/50 p-1 rounded-xl shadow-lg animate-fade-in-up">
              <TabsTrigger value="sources" className="whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-lg transition-all duration-300 flex-shrink-0">
                <FileText className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Sources</span>
                <span className="sm:hidden">Sources</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-lg transition-all duration-300 flex-shrink-0">
                <Settings className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Settings</span>
                <span className="sm:hidden">Settings</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-lg transition-all duration-300 flex-shrink-0">
                <Palette className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Appearance</span>
                <span className="sm:hidden">Appear</span>
              </TabsTrigger>
              <TabsTrigger value="widget" className="whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-lg transition-all duration-300 flex-shrink-0">
                <MessageSquare className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Widget</span>
                <span className="sm:hidden">Widget</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-lg transition-all duration-300 flex-shrink-0">
                <BarChart3 className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Analytics</span>
                <span className="sm:hidden">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="advanced-analytics" className="whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-lg transition-all duration-300 flex-shrink-0">
                <TrendingUp className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Insights</span>
                <span className="sm:hidden">Insights</span>
              </TabsTrigger>
              <TabsTrigger value="integrations" className="whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-lg transition-all duration-300 flex-shrink-0">
                <Zap className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Integrations</span>
                <span className="sm:hidden">Integrations</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Sources Tab */}
          <TabsContent value="sources" className="animate-fade-in-up">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-purple-200/50 p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent">Training Sources</h2>
                  <p className="text-gray-600 text-sm mt-1">Add data to train your chatbot</p>
                </div>
                <Button 
                  onClick={() => setIsAddSourceModalOpen(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30 transform hover:scale-105 transition-all duration-300 group"
                >
                  <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                  Add Source
                </Button>
              </div>

              {sources.length === 0 ? (
                <div className="text-center py-16 animate-fade-in">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 transform hover:scale-110 transition-transform duration-300">
                    <FileText className="w-10 h-10 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">No sources yet</h3>
                  <p className="text-gray-600 mb-6">Add files, websites, or text to train your chatbot</p>
                  <Button 
                    onClick={() => setIsAddSourceModalOpen(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30 transform hover:scale-105 transition-all duration-300"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Source
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {sources.map((source, index) => (
                    <div 
                      key={source.id} 
                      className="group flex items-center justify-between p-5 border-2 border-purple-200/50 rounded-xl hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 bg-gradient-to-r from-white to-purple-50/30 transform hover:-translate-y-1 animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ${
                          source.type === 'file' ? 'bg-gradient-to-br from-blue-500 to-cyan-600 shadow-blue-500/30' :
                          source.type === 'website' ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/30' :
                          'bg-gradient-to-br from-purple-500 to-pink-600 shadow-purple-500/30'
                        }`}>
                          {source.type === 'file' && <FileText className="w-5 h-5 text-white" />}
                          {source.type === 'website' && <Globe className="w-5 h-5 text-white" />}
                          {source.type === 'text' && <FileText className="w-5 h-5 text-white" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all duration-300">{source.name}</p>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            {source.size && <span>{source.size}</span>}
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              source.status === 'processed' || source.status === 'completed' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm shadow-green-500/30' :
                              source.status === 'processing' ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-sm shadow-yellow-500/30' :
                              'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm shadow-red-500/30'
                            }`}>
                              {source.status}
                            </span>
                            {source.added_at && <span>Added {new Date(source.added_at).toLocaleDateString()}</span>}
                          </div>
                          {/* Processing Progress Bar */}
                          {source.status === 'processing' && (
                            <div className="mt-2 space-y-1">
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>Processing source...</span>
                                <span className="font-semibold text-orange-600">
                                  {source.progress || 50}%
                                </span>
                              </div>
                              <Progress 
                                value={source.progress || 50} 
                                className="h-2 bg-orange-100"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSourceToDelete(source);
                          setIsDeleteModalOpen(true);
                        }}
                        className="hover:bg-red-50 hover:text-red-600 transition-colors group"
                      >
                        <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="animate-fade-in-up">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-purple-200/50 p-8 shadow-xl space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent">Chatbot Settings</h2>
              </div>

              <div className="space-y-6">
                <div className="group">
                  <Label className="text-gray-700 font-medium">Chatbot Name</Label>
                  <Input
                    value={chatbot.name}
                    onChange={(e) => setChatbot({ ...chatbot, name: e.target.value })}
                    className="mt-2 border-2 border-purple-200 focus:border-purple-600 transition-colors"
                  />
                </div>

                <div className="group">
                  <Label className="text-gray-700 font-medium">Status</Label>
                  <Select value={chatbot.status} onValueChange={(value) => setChatbot({ ...chatbot, status: value })}>
                    <SelectTrigger className="mt-2 border-2 border-purple-200 focus:border-purple-600 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="group">
                  <Label className="text-gray-700 font-medium">AI Model</Label>
                  <Select value={chatbot.model} onValueChange={handleModelChange}>
                    <SelectTrigger className="mt-2 border-2 border-purple-200 focus:border-purple-600 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(AI_PROVIDERS).map(([provider, data]) => (
                        <React.Fragment key={provider}>
                          <div className="px-2 py-1.5 text-xs font-semibold text-purple-600">{data.name}</div>
                          {data.models.map((model) => (
                            <SelectItem key={model.value} value={model.value}>
                              {model.label}
                            </SelectItem>
                          ))}
                        </React.Fragment>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-purple-600 mt-2 font-medium">Provider: {chatbot.provider}</p>
                </div>

                <div className="group">
                  <Label className="text-gray-700 font-medium">Temperature: {chatbot.temperature}</Label>
                  <Slider
                    value={[chatbot.temperature]}
                    onValueChange={([value]) => setChatbot({ ...chatbot, temperature: value })}
                    min={0}
                    max={1}
                    step={0.1}
                    className="mt-3"
                  />
                  <p className="text-xs text-gray-500 mt-2">Higher values make output more random, lower values more focused</p>
                </div>

                <div className="group">
                  <Label className="text-gray-700 font-medium">System Instructions</Label>
                  <Textarea
                    value={chatbot.instructions}
                    onChange={(e) => setChatbot({ ...chatbot, instructions: e.target.value })}
                    rows={6}
                    placeholder="You are a helpful assistant..."
                    className="mt-2 border-2 border-purple-200 focus:border-purple-600 transition-colors"
                  />
                </div>

                <div className="group">
                  <Label className="text-gray-700 font-medium">Welcome Message</Label>
                  <Input
                    value={chatbot.welcome_message}
                    onChange={(e) => setChatbot({ ...chatbot, welcome_message: e.target.value })}
                    placeholder="Hello! How can I help you today?"
                    className="mt-2 border-2 border-purple-200 focus:border-purple-600 transition-colors"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleSaveSettings} 
                    disabled={saving}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30 transform hover:scale-105 transition-all duration-300"
                  >
                    {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save Settings'}
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteChatbot}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/30 transform hover:scale-105 transition-all duration-300"
                  >
                    Delete Chatbot
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Widget Tab */}
          <TabsContent value="widget" className="animate-fade-in-up">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Configuration Panel */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-purple-200/50 p-6 shadow-xl space-y-6">
                {/* Public Access Toggle - Always ON */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-300 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/30">
                        <Globe className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Public Access</h3>
                        <p className="text-sm text-gray-600">Your chatbot is publicly accessible</p>
                      </div>
                    </div>
                    <div className="px-4 py-2 bg-green-500 text-white rounded-full font-semibold text-sm shadow-lg">
                      Always ON
                    </div>
                  </div>
                  
                  {/* Public Chat Link */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <Link2 className="w-4 h-4 text-green-600" />
                      <span>Share this link:</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={publicChatUrl}
                        readOnly
                        className="flex-1 px-3 py-2 bg-white border-2 border-green-200 rounded-lg text-sm font-mono"
                      />
                      <Button
                        onClick={() => copyToClipboard(publicChatUrl, 'link')}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30"
                        size="sm"
                      >
                        {copied === 'link' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                      <a
                        href={publicChatUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => handleExport('json')}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-green-300 hover:bg-green-50"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Export JSON
                    </Button>
                    <Button
                      onClick={() => handleExport('csv')}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-green-300 hover:bg-green-50"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Export CSV
                    </Button>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent">Embed Your Chatbot</h2>
                  <p className="text-gray-600 text-sm">Choose how you want to integrate the chatbot into your website</p>
                </div>

                {/* Embed Options */}
                <div className="space-y-4">
                  {/* Chat Bubble Widget - NEW */}
                  <div className="group p-5 border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg shadow-blue-500/30 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        1
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">Chat Bubble Widget</h3>
                          <span className="px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-full shadow-sm">Recommended</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">Add a floating chat bubble to your website. Works on all pages and devices.</p>
                        <Textarea
                          value={`<!-- BotSmith Widget Script -->
<script>
  window.botsmithConfig = {
    chatbotId: "${chatbot.id}",
    domain: "${window.location.origin}"
  };
</script>
<script
  src="${window.location.origin}/fast-widget.js"
  chatbot-id="${chatbot.id}"
  domain="${window.location.origin}"
  defer>
</script>`}
                          readOnly
                          rows={8}
                          className="font-mono text-xs bg-white"
                        />
                        <Button 
                          className="mt-2 w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/30 transform hover:scale-105 transition-all duration-300" 
                          onClick={async () => {
                            const widgetScript = `<!-- BotSmith Widget Script -->
<script>
  window.botsmithConfig = {
    chatbotId: "${chatbot.id}",
    domain: "${window.location.origin}"
  };
</script>
<script
  src="${window.location.origin}/fast-widget.js"
  chatbot-id="${chatbot.id}"
  domain="${window.location.origin}"
  defer>
</script>`;
                            try {
                              // Try modern clipboard API first
                              await navigator.clipboard.writeText(widgetScript);
                              toast({ title: 'Copied!', description: 'Widget script copied to clipboard' });
                            } catch (err) {
                              // Fallback to textarea method for older browsers or permission issues
                              const textarea = document.createElement('textarea');
                              textarea.value = widgetScript;
                              textarea.style.position = 'fixed';
                              textarea.style.opacity = '0';
                              document.body.appendChild(textarea);
                              textarea.select();
                              try {
                                document.execCommand('copy');
                                toast({ title: 'Copied!', description: 'Widget script copied to clipboard' });
                              } catch (execErr) {
                                toast({ 
                                  title: 'Copy Failed', 
                                  description: 'Please manually copy the script above', 
                                  variant: 'destructive' 
                                });
                              }
                              document.body.removeChild(textarea);
                            }
                          }}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Copy Widget Script
                        </Button>
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs text-blue-800">
                            <strong>💡 Tip:</strong> Paste this code before the closing &lt;/body&gt; tag in your HTML. The chat bubble will appear in the bottom-right corner.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="group p-5 border-2 border-indigo-300 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg shadow-indigo-500/30 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        2
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">Iframe Embed</h3>
                        <p className="text-sm text-gray-600 mb-3">Add this code to your HTML to embed the chatbot as an iframe</p>
                        <Textarea
                          value={embedCode}
                          readOnly
                          rows={3}
                          className="font-mono text-xs bg-white"
                        />
                        <Button 
                          className="mt-2 w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30 transform hover:scale-105 transition-all duration-300" 
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(embedCode);
                              toast({ title: 'Copied!', description: 'Iframe code copied to clipboard' });
                            } catch (err) {
                              const textarea = document.createElement('textarea');
                              textarea.value = embedCode;
                              textarea.style.position = 'fixed';
                              textarea.style.opacity = '0';
                              document.body.appendChild(textarea);
                              textarea.select();
                              try {
                                document.execCommand('copy');
                                toast({ title: 'Copied!', description: 'Iframe code copied to clipboard' });
                              } catch (execErr) {
                                toast({ title: 'Copy Failed', description: 'Please manually copy the code above', variant: 'destructive' });
                              }
                              document.body.removeChild(textarea);
                            }
                          }}
                        >
                          Copy Iframe Code
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="group p-5 border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg shadow-purple-500/30 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        3
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">Direct Link</h3>
                        <p className="text-sm text-gray-600 mb-3">Share this link to let users chat directly</p>
                        <Input
                          value={`${window.location.origin}/chat/${chatbot.id}`}
                          readOnly
                          className="font-mono text-xs mb-2"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            variant="outline"
                            className="w-full" 
                            onClick={async () => {
                              const link = `${window.location.origin}/chat/${chatbot.id}`;
                              try {
                                await navigator.clipboard.writeText(link);
                                toast({ title: 'Copied!', description: 'Link copied to clipboard' });
                              } catch (err) {
                                const textarea = document.createElement('textarea');
                                textarea.value = link;
                                textarea.style.position = 'fixed';
                                textarea.style.opacity = '0';
                                document.body.appendChild(textarea);
                                textarea.select();
                                try {
                                  document.execCommand('copy');
                                  toast({ title: 'Copied!', description: 'Link copied to clipboard' });
                                } catch (execErr) {
                                  toast({ title: 'Copy Failed', description: 'Please manually copy the link above', variant: 'destructive' });
                                }
                                document.body.removeChild(textarea);
                              }
                            }}
                          >
                            Copy Link
                          </Button>
                          <Button 
                            variant="outline"
                            className="w-full" 
                            onClick={() => window.open(`${window.location.origin}/chat/${chatbot.id}`, '_blank')}
                          >
                            Test Link
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="group p-5 border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:border-green-500 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg shadow-green-500/30 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        4
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">Embed URL</h3>
                        <p className="text-sm text-gray-600 mb-3">Use this URL in your iframe or embed tools</p>
                        <Input
                          value={`${window.location.origin}/embed/${chatbot.id}`}
                          readOnly
                          className="font-mono text-xs mb-2"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            variant="outline"
                            className="w-full" 
                            onClick={async () => {
                              const embedUrl = `${window.location.origin}/embed/${chatbot.id}`;
                              try {
                                await navigator.clipboard.writeText(embedUrl);
                                toast({ title: 'Copied!', description: 'Embed URL copied to clipboard' });
                              } catch (err) {
                                const textarea = document.createElement('textarea');
                                textarea.value = embedUrl;
                                textarea.style.position = 'fixed';
                                textarea.style.opacity = '0';
                                document.body.appendChild(textarea);
                                textarea.select();
                                try {
                                  document.execCommand('copy');
                                  toast({ title: 'Copied!', description: 'Embed URL copied to clipboard' });
                                } catch (execErr) {
                                  toast({ title: 'Copy Failed', description: 'Please manually copy the URL above', variant: 'destructive' });
                                }
                                document.body.removeChild(textarea);
                              }
                            }}
                          >
                            Copy URL
                          </Button>
                          <Button 
                            variant="outline"
                            className="w-full" 
                            onClick={() => window.open(`${window.location.origin}/embed/${chatbot.id}`, '_blank')}
                          >
                            Preview
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Preview */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-purple-200/50 p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1 bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent">Live Preview</h3>
                    <p className="text-sm text-gray-600">See how your chatbot will look when embedded</p>
                  </div>
                  <Button
                    onClick={() => setIframeKey(prev => prev + 1)}
                    variant="outline"
                    size="sm"
                    className="border-purple-300 hover:bg-purple-50"
                  >
                    🔄 Refresh
                  </Button>
                </div>
                <div className="border-2 border-purple-300 rounded-xl overflow-hidden shadow-lg" style={{ height: '600px' }}>
                  <iframe
                    key={`embed-${chatbot.id}-${iframeKey}`}
                    src={`${window.location.origin}/embed/${chatbot.id}`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    title="Chatbot Preview"
                  />
                </div>
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-purple-300 rounded-xl shadow-sm">
                  <p className="text-sm text-purple-800 font-medium">
                    <strong>💡 Tip:</strong> The chatbot automatically adapts to your website's style and works on all devices.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="animate-fade-in-up">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-purple-200/50 p-8 shadow-xl mb-6">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent">Chatbot Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group p-6 border-2 border-purple-200/50 rounded-xl hover:border-purple-400 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-r from-white to-purple-50/30">
                  <p className="text-gray-600 text-sm font-medium mb-2">Total Conversations</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{chatbot.conversations_count || 0}</p>
                </div>
                <div className="group p-6 border-2 border-blue-200/50 rounded-xl hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-r from-white to-blue-50/30">
                  <p className="text-gray-600 text-sm font-medium mb-2">Total Messages</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{chatbot.messages_count || 0}</p>
                </div>
                <div className="group p-6 border-2 border-green-200/50 rounded-xl hover:border-green-400 hover:shadow-xl hover:shadow-green-500/20 transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-r from-white to-green-50/30">
                  <p className="text-gray-600 text-sm font-medium mb-2">Training Sources</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{sources.length}</p>
                </div>
              </div>
            </div>

            {/* Chat Logs Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-purple-200/50 p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent">Chat Logs</h2>
                <Button
                  onClick={loadConversations}
                  disabled={loadingConversations}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  {loadingConversations ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Refresh Chat Logs
                    </>
                  )}
                </Button>
              </div>

              {conversations.length === 0 && !loadingConversations && (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-10 h-10 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No conversations yet</h3>
                  <p className="text-gray-600">Chat logs will appear here once users start conversations</p>
                </div>
              )}

              {conversations.length > 0 && (
                <div className="space-y-4">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-purple-300 transition-all duration-300"
                    >
                      {/* Conversation Header */}
                      <div
                        onClick={() => toggleConversation(conversation.id)}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-purple-50/30 cursor-pointer hover:from-purple-50/50 hover:to-pink-50/50 transition-all"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-gray-900">
                                {conversation.user_name || 'Anonymous User'}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                conversation.status === 'active' 
                                  ? 'bg-green-100 text-green-700' 
                                  : conversation.status === 'resolved'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-orange-100 text-orange-700'
                              }`}>
                                {conversation.status}
                              </span>
                            </div>
                            {conversation.user_email && (
                              <p className="text-sm text-gray-500 mt-1">{conversation.user_email}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                {conversation.messages_count} messages
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {formatDate(conversation.updated_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          {selectedConversation === conversation.id ? (
                            <ChevronUp className="w-5 h-5 text-purple-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {/* Messages - Expanded View */}
                      {selectedConversation === conversation.id && (
                        <div className="border-t-2 border-gray-200 p-6 bg-gray-50/50">
                          {loadingMessages ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                            </div>
                          ) : messages.length === 0 ? (
                            <p className="text-center text-gray-500 py-4">No messages in this conversation</p>
                          ) : (
                            <div className="space-y-4">
                              {messages.map((message) => (
                                <div
                                  key={message.id}
                                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div
                                    className={`max-w-[70%] rounded-2xl p-4 ${
                                      message.role === 'user'
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                                        : 'bg-white border-2 border-gray-200 text-gray-900'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className={`text-xs font-semibold ${
                                        message.role === 'user' ? 'text-purple-100' : 'text-gray-500'
                                      }`}>
                                        {message.role === 'user' ? 'User' : 'Assistant'}
                                      </span>
                                      <span className={`text-xs ${
                                        message.role === 'user' ? 'text-purple-100' : 'text-gray-400'
                                      }`}>
                                        {formatDate(message.timestamp)}
                                      </span>
                                    </div>
                                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                                  </div>
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
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="animate-fade-in-up">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-purple-200/50 p-8 shadow-xl">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent">Customize Appearance</h2>
              <AppearanceTab chatbot={chatbot} onUpdate={refreshChatbot} />
            </div>
          </TabsContent>

          {/* Advanced Analytics Tab */}
          <TabsContent value="advanced-analytics" className="animate-fade-in-up">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-purple-200/50 p-8 shadow-xl">
              <AdvancedAnalytics chatbotId={id} />
            </div>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="animate-fade-in-up">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-purple-200/50 p-8 shadow-xl">
              <ChatbotIntegrations chatbot={chatbot} />
            </div>
          </TabsContent>

        </Tabs>
      </div>

      {/* Modals */}
      <AddSourceModal
        isOpen={isAddSourceModalOpen}
        onClose={() => setIsAddSourceModalOpen(false)}
        chatbotId={id}
        onSuccess={loadChatbot}
      />
      <ChatPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        chatbot={chatbot}
      />
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSourceToDelete(null);
        }}
        onConfirm={() => handleDeleteSource(sourceToDelete?.id)}
        title="Delete Source"
        description={`Are you sure you want to delete "${sourceToDelete?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default ChatbotBuilder;
