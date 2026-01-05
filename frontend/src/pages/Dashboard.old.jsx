import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Plus, MessageSquare, Activity, TrendingUp, BarChart3, CreditCard } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import UserProfileDropdown from '../components/UserProfileDropdown';
import { useAuth } from '../contexts/AuthContext';
import { chatbotAPI, analyticsAPI, plansAPI } from '../utils/api';
import UpgradeModal from '../components/UpgradeModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [chatbots, setChatbots] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usageStats, setUsageStats] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeContext, setUpgradeContext] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [chatbotsResponse, analyticsResponse, usageResponse] = await Promise.all([
        chatbotAPI.list(),
        analyticsAPI.getDashboard(),
        plansAPI.getUsageStats()
      ]);
      
      setChatbots(chatbotsResponse.data);
      setAnalytics(analyticsResponse.data);
      setUsageStats(usageResponse.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: 'Signed out',
      description: 'You have been signed out successfully'
    });
    navigate('/');
  };

  const handleCreateChatbot = async () => {
    try {
      // Check chatbot limit first
      const limitCheck = await plansAPI.checkLimit('chatbots');
      if (limitCheck.data.reached) {
        setUpgradeContext({
          limitType: 'chatbots',
          currentUsage: limitCheck.data.current,
          maxUsage: limitCheck.data.max
        });
        setShowUpgradeModal(true);
        return;
      }

      const newChatbot = await chatbotAPI.create({
        name: 'New Chatbot',
        model: 'gpt-4o-mini',
        provider: 'openai',
        temperature: 0.7,
        instructions: 'You are a helpful assistant.',
        welcome_message: 'Hello! How can I help you today?'
      });
      
      toast({
        title: 'Success',
        description: 'Chatbot created successfully'
      });
      
      navigate(`/chatbot/${newChatbot.data.id}`);
    } catch (error) {
      console.error('Error creating chatbot:', error);
      toast({
        title: 'Error',
        description: 'Failed to create chatbot',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-semibold">BotSmith</span>
            </div>
            <div className="flex items-center gap-6">
              <button className="text-black font-medium">Chatbots</button>
              <button onClick={() => navigate('/analytics')} className="text-gray-600 hover:text-black transition-colors">Analytics</button>
              <button onClick={() => navigate('/subscription')} className="text-gray-600 hover:text-black transition-colors flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Subscription
              </button>
              <button onClick={() => navigate('/integrations')} className="text-gray-600 hover:text-black transition-colors">Integrations</button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <UserProfileDropdown user={user} onLogout={handleLogout} />
          </div>
        </div>
      </nav>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <MessageSquare className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-3xl font-bold">{analytics?.total_conversations?.toLocaleString() || 0}</p>
            <p className="text-gray-600 text-sm mt-1">Total Conversations</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-3xl font-bold">{analytics?.total_messages?.toLocaleString() || 0}</p>
            <p className="text-gray-600 text-sm mt-1">Total Messages</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-3xl font-bold">{analytics?.active_chatbots || 0}</p>
            <p className="text-gray-600 text-sm mt-1">Active Chatbots</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-3xl font-bold">{analytics?.total_chatbots || 0}</p>
            <p className="text-gray-600 text-sm mt-1">Total Chatbots</p>
          </div>
        </div>

        {/* Plan Usage Widget */}
        {usageStats && (
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{usageStats.plan?.name} Plan</h3>
                <p className="text-sm text-gray-600">Current usage overview</p>
              </div>
              <Button
                onClick={() => navigate('/subscription')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
              >
                View Details
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Chatbots</p>
                <p className="text-xl font-bold text-gray-900">
                  {usageStats.usage?.chatbots?.current}/{usageStats.usage?.chatbots?.limit === 999999 ? '∞' : usageStats.usage?.chatbots?.limit}
                </p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${usageStats.usage?.chatbots?.percentage >= 90 ? 'bg-red-500' : usageStats.usage?.chatbots?.percentage >= 75 ? 'bg-orange-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(usageStats.usage?.chatbots?.percentage || 0, 100)}%` }}
                  />
                </div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Messages</p>
                <p className="text-xl font-bold text-gray-900">
                  {usageStats.usage?.messages?.current}/{usageStats.usage?.messages?.limit === 999999999 ? '∞' : usageStats.usage?.messages?.limit?.toLocaleString()}
                </p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${usageStats.usage?.messages?.percentage >= 90 ? 'bg-red-500' : usageStats.usage?.messages?.percentage >= 75 ? 'bg-orange-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(usageStats.usage?.messages?.percentage || 0, 100)}%` }}
                  />
                </div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Files</p>
                <p className="text-xl font-bold text-gray-900">
                  {usageStats.usage?.file_uploads?.current}/{usageStats.usage?.file_uploads?.limit === 999999 ? '∞' : usageStats.usage?.file_uploads?.limit}
                </p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${usageStats.usage?.file_uploads?.percentage >= 90 ? 'bg-red-500' : usageStats.usage?.file_uploads?.percentage >= 75 ? 'bg-orange-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(usageStats.usage?.file_uploads?.percentage || 0, 100)}%` }}
                  />
                </div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Websites</p>
                <p className="text-xl font-bold text-gray-900">
                  {usageStats.usage?.website_sources?.current}/{usageStats.usage?.website_sources?.limit === 999999 ? '∞' : usageStats.usage?.website_sources?.limit}
                </p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${usageStats.usage?.website_sources?.percentage >= 90 ? 'bg-red-500' : usageStats.usage?.website_sources?.percentage >= 75 ? 'bg-orange-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(usageStats.usage?.website_sources?.percentage || 0, 100)}%` }}
                  />
                </div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Text Sources</p>
                <p className="text-xl font-bold text-gray-900">
                  {usageStats.usage?.text_sources?.current}/{usageStats.usage?.text_sources?.limit === 999999 ? '∞' : usageStats.usage?.text_sources?.limit}
                </p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${usageStats.usage?.text_sources?.percentage >= 90 ? 'bg-red-500' : usageStats.usage?.text_sources?.percentage >= 75 ? 'bg-orange-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(usageStats.usage?.text_sources?.percentage || 0, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chatbots Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Your Chatbots</h2>
            <Button 
              className="bg-black hover:bg-gray-800 text-white"
              onClick={handleCreateChatbot}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chatbot
            </Button>
          </div>
          
          {chatbots.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No chatbots yet</h3>
              <p className="text-gray-600 mb-6">Create your first AI chatbot to get started</p>
              <Button 
                className="bg-black hover:bg-gray-800 text-white"
                onClick={handleCreateChatbot}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Chatbot
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {chatbots.map((bot) => (
                <div 
                  key={bot.id} 
                  className="p-6 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => navigate(`/chatbot/${bot.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{bot.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          bot.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {bot.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span>{bot.conversations_count?.toLocaleString() || 0} conversations</span>
                        <span>{bot.messages_count?.toLocaleString() || 0} messages</span>
                        <span>Model: {bot.model}</span>
                        {bot.last_trained && (
                          <span>Last trained: {new Date(bot.last_trained).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" onClick={(e) => { e.stopPropagation(); navigate(`/chatbot/${bot.id}`); }}>
                      Manage
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal 
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        limitType={upgradeContext.limitType}
        currentUsage={upgradeContext.currentUsage}
        maxUsage={upgradeContext.maxUsage}
      />
    </div>
  );
};

export default Dashboard;
