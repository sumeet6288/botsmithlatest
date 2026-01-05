import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Slider } from '../components/ui/slider';
import { Plus, FileText, Globe, Trash2, Loader2, MessageSquare, ArrowLeft, Settings, Palette, BarChart3 } from 'lucide-react';
import UserProfileDropdown from '../components/UserProfileDropdown';
import AddSourceModal from '../components/AddSourceModal';
import ChatPreviewModal from '../components/ChatPreviewModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { chatbotAPI, sourceAPI } from '../utils/api';
import { AI_PROVIDERS, getAllModels } from '../utils/models';

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

  useEffect(() => {
    loadChatbot();
  }, [id]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-gray-600" />
      </div>
    );
  }

  if (!chatbot) {
    return null;
  }

  const allModels = getAllModels();
  const embedCode = `<iframe src="${window.location.origin}/embed/${chatbot.id}" width="100%" height="600px" frameborder="0"></iframe>`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">{chatbot.name}</h1>
              <p className="text-sm text-gray-600">Chatbot ID: {chatbot.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setIsPreviewModalOpen(true)}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <UserProfileDropdown user={user} onLogout={handleLogout} />
          </div>
        </div>
      </nav>

      <div className="p-6 max-w-7xl mx-auto">
        <Tabs defaultValue="sources" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="sources">
              <FileText className="w-4 h-4 mr-2" />
              Sources
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="widget">
              <Palette className="w-4 h-4 mr-2" />
              Widget
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Sources Tab */}
          <TabsContent value="sources">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">Training Sources</h2>
                  <p className="text-gray-600 text-sm">Add data to train your chatbot</p>
                </div>
                <Button onClick={() => setIsAddSourceModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Source
                </Button>
              </div>

              {sources.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No sources yet</h3>
                  <p className="text-gray-600 mb-6">Add files, websites, or text to train your chatbot</p>
                  <Button onClick={() => setIsAddSourceModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Source
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {sources.map((source) => (
                    <div key={source.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                      <div className="flex items-center gap-3">
                        {source.type === 'file' && <FileText className="w-5 h-5 text-gray-600" />}
                        {source.type === 'website' && <Globe className="w-5 h-5 text-gray-600" />}
                        {source.type === 'text' && <FileText className="w-5 h-5 text-gray-600" />}
                        <div>
                          <p className="font-medium">{source.name}</p>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            {source.size && <span>{source.size}</span>}
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              source.status === 'processed' ? 'bg-green-100 text-green-700' :
                              source.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {source.status}
                            </span>
                            {source.added_at && <span>Added {new Date(source.added_at).toLocaleDateString()}</span>}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSourceToDelete(source);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-4">Chatbot Settings</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Chatbot Name</Label>
                  <Input
                    value={chatbot.name}
                    onChange={(e) => setChatbot({ ...chatbot, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Status</Label>
                  <Select value={chatbot.status} onValueChange={(value) => setChatbot({ ...chatbot, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>AI Model</Label>
                  <Select value={chatbot.model} onValueChange={handleModelChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(AI_PROVIDERS).map(([provider, data]) => (
                        <React.Fragment key={provider}>
                          <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">{data.name}</div>
                          {data.models.map((model) => (
                            <SelectItem key={model.value} value={model.value}>
                              {model.label}
                            </SelectItem>
                          ))}
                        </React.Fragment>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Provider: {chatbot.provider}</p>
                </div>

                <div>
                  <Label>Temperature: {chatbot.temperature}</Label>
                  <Slider
                    value={[chatbot.temperature]}
                    onValueChange={([value]) => setChatbot({ ...chatbot, temperature: value })}
                    min={0}
                    max={1}
                    step={0.1}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Higher values make output more random, lower values more focused</p>
                </div>

                <div>
                  <Label>System Instructions</Label>
                  <Textarea
                    value={chatbot.instructions}
                    onChange={(e) => setChatbot({ ...chatbot, instructions: e.target.value })}
                    rows={6}
                    placeholder="You are a helpful assistant..."
                  />
                </div>

                <div>
                  <Label>Welcome Message</Label>
                  <Input
                    value={chatbot.welcome_message}
                    onChange={(e) => setChatbot({ ...chatbot, welcome_message: e.target.value })}
                    placeholder="Hello! How can I help you today?"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSaveSettings} disabled={saving}>
                    {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save Settings'}
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteChatbot}>
                    Delete Chatbot
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Widget Tab */}
          <TabsContent value="widget">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Configuration Panel */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-2">Embed Your Chatbot</h2>
                  <p className="text-gray-600 text-sm">Choose how you want to integrate the chatbot into your website</p>
                </div>

                {/* Embed Options */}
                <div className="space-y-4">
                  <div className="p-4 border-2 border-indigo-200 bg-indigo-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                        1
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
                        <Button className="mt-2 w-full" onClick={() => {
                          navigator.clipboard.writeText(embedCode);
                          toast({ title: 'Copied!', description: 'Iframe code copied to clipboard' });
                        }}>
                          Copy Iframe Code
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-2 border-purple-200 bg-purple-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                        2
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
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/chat/${chatbot.id}`);
                              toast({ title: 'Copied!', description: 'Link copied to clipboard' });
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

                  <div className="p-4 border-2 border-green-200 bg-green-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                        3
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
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/embed/${chatbot.id}`);
                              toast({ title: 'Copied!', description: 'Embed URL copied to clipboard' });
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
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Live Preview</h3>
                  <p className="text-sm text-gray-600">See how your chatbot will look when embedded</p>
                </div>
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden" style={{ height: '600px' }}>
                  <iframe
                    src={`${window.location.origin}/embed/${chatbot.id}`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    title="Chatbot Preview"
                  />
                </div>
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Tip:</strong> The chatbot automatically adapts to your website's style and works on all devices.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-4">Chatbot Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <p className="text-gray-600 text-sm">Total Conversations</p>
                  <p className="text-3xl font-bold mt-2">{chatbot.conversations_count || 0}</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <p className="text-gray-600 text-sm">Total Messages</p>
                  <p className="text-3xl font-bold mt-2">{chatbot.messages_count || 0}</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <p className="text-gray-600 text-sm">Training Sources</p>
                  <p className="text-3xl font-bold mt-2">{sources.length}</p>
                </div>
              </div>
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
