import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Plus, MessageSquare, Activity, TrendingUp, BarChart3, CreditCard, Sparkles, FileText, Globe, BookOpen } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import UserProfileDropdown from '../components/UserProfileDropdown';
import ResponsiveNav from '../components/ResponsiveNav';
import { useAuth } from '../contexts/AuthContext';
import { chatbotAPI, analyticsAPI, plansAPI } from '../utils/api';
import UpgradeModal from '../components/UpgradeModal';
import Footer from '../components/Footer';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout, refreshUser } = useAuth();
  const [chatbots, setChatbots] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usageStats, setUsageStats] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeContext, setUpgradeContext] = useState({});
  const [selectedPlanInfo, setSelectedPlanInfo] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false); // Disabled by default to prevent error popups
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    loadData();
    // Refresh user data when dashboard loads to get latest admin changes
    refreshUser();
    
    // Check if user selected a plan from pricing page
    const selectedPlan = localStorage.getItem('selectedPlan');
    if (selectedPlan) {
      try {
        const plan = JSON.parse(selectedPlan);
        setSelectedPlanInfo(plan);
        // Show notification about selected plan
        toast({
          title: `${plan.name} Plan Selected!`,
          description: `You've selected the ${plan.name} plan (${plan.price}${plan.period}). Click the banner below to complete the upgrade.`,
          duration: 8000,
        });
        // Clear the selected plan from localStorage after setting state
        localStorage.removeItem('selectedPlan');
      } catch (error) {
        console.error('Error parsing selected plan:', error);
      }
    }
  }, []);

  // Auto-refresh effect for dashboard data
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadData(true); // Silent refresh
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [chatbotsResponse, analyticsResponse, usageResponse] = await Promise.all([
        chatbotAPI.list(),
        analyticsAPI.getDashboard(),
        plansAPI.getUsageStats()
      ]);
      
      setChatbots(chatbotsResponse.data);
      setAnalytics(analyticsResponse.data);
      setUsageStats(usageResponse.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Only show error toast for initial load, not during silent refresh
      if (!silent) {
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data. Please refresh the page.',
          variant: 'destructive'
        });
      }
      // If silent refresh fails, disable auto-refresh to prevent repeated errors
      if (silent) {
        setAutoRefresh(false);
        console.warn('Auto-refresh disabled due to error');
      }
    } finally {
      if (!silent) setLoading(false);
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

  const handleToggleChatbot = async (e, botId, currentStatus) => {
    e.stopPropagation();
    
    try {
      const response = await chatbotAPI.toggle(botId);
      
      // Update the chatbot in the state
      setChatbots(prevChatbots => 
        prevChatbots.map(bot => 
          bot.id === botId ? { ...bot, status: response.data.status } : bot
        )
      );
      
      toast({
        title: 'Success',
        description: `Chatbot ${response.data.status === 'active' ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      console.error('Error toggling chatbot:', error);
      toast({
        title: 'Error',
        description: 'Failed to toggle chatbot status',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="relative">
          {/* Outer rotating ring */}
          <div className="w-24 h-24 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          {/* Middle rotating ring */}
          <div className="absolute inset-0 w-24 h-24 border-4 border-transparent border-t-pink-600 rounded-full animate-spin animation-delay-300" style={{ animationDuration: '1.2s' }}></div>
          {/* Inner pulsing circle */}
          <div className="absolute inset-0 m-auto w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
          {/* Glow effect - REDUCED BLUR */}
          <div className="absolute inset-0 m-auto w-20 h-20 bg-purple-400 rounded-full blur-md opacity-20 animate-pulse"></div>
        </div>
        <p className="absolute mt-32 text-lg font-semibold text-gray-700 animate-pulse">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Rich Animated background with multiple layers - REDUCED BLUR FOR CLARITY */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Layer 1: Large slow-moving gradient blobs - REDUCED BLUR */}
        <div className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-gradient-to-br from-purple-400 via-pink-400 to-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob"></div>
        <div className="absolute top-1/4 -left-40 w-[700px] h-[700px] bg-gradient-to-br from-pink-400 via-rose-400 to-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 right-1/4 w-[750px] h-[750px] bg-gradient-to-br from-blue-400 via-purple-400 to-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-4000"></div>
        
        {/* Layer 2: Medium floating orbs - REDUCED BLUR */}
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-gradient-to-br from-indigo-300 to-purple-300 rounded-full mix-blend-multiply filter blur-lg opacity-12 animate-float"></div>
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-gradient-to-br from-pink-300 to-rose-300 rounded-full mix-blend-multiply filter blur-lg opacity-12 animate-float animation-delay-3000"></div>
        
        {/* Layer 3: Smaller accent orbs - REDUCED BLUR */}
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full mix-blend-multiply filter blur-md opacity-8 animate-pulse-slow"></div>
        <div className="absolute top-3/4 right-1/2 w-72 h-72 bg-gradient-to-br from-cyan-200 to-blue-200 rounded-full mix-blend-multiply filter blur-md opacity-8 animate-pulse-slow animation-delay-2000"></div>
      </div>

      {/* Top Navigation */}
      <ResponsiveNav user={user} onLogout={handleLogout} />

      <div className="p-6 sm:p-8 max-w-[95%] mx-auto relative z-10">
        {/* Welcome Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            Welcome back, {user?.name || 'Demo User'} 
            <span className="text-4xl">👋</span>
          </h1>
          <p className="text-lg text-gray-600">Here's what's happening with your AI chatbots today</p>
        </div>

        {/* Selected Plan Banner */}
        {selectedPlanInfo && (
          <div 
            onClick={() => navigate('/subscription')}
            className="mb-6 p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 animate-fade-in-up border-2 border-purple-600 hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/30 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">
                    🎉 {selectedPlanInfo.name} Plan Selected!
                  </h3>
                  <p className="text-sm text-white/90">
                    Click here to complete your upgrade to {selectedPlanInfo.name} ({selectedPlanInfo.price}{selectedPlanInfo.period})
                  </p>
                </div>
              </div>
              <Button 
                className="bg-white text-purple-600 hover:bg-gray-100 font-semibold"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/subscription');
                }}
              >
                Complete Upgrade →
              </Button>
            </div>
          </div>
        )}

        {/* Stats Cards - More natural, human-designed look */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5 mb-8">
          {/* Create Agent Card - FIRST POSITION */}
          <div 
            onClick={handleCreateChatbot}
            className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 border-2 border-dashed border-gray-300 hover:border-emerald-400 animate-fade-in-up cursor-pointer group"
          >
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500 mb-3 shadow-sm group-hover:shadow-md transition-all duration-300">
              <Plus className="w-7 h-7 text-white" />
            </div>
            <p className="text-xl font-semibold text-gray-800 mb-1">Create</p>
            <p className="text-gray-500 text-sm">New Agent</p>
          </div>

          {/* Total Conversations Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 animate-fade-in-up animation-delay-100">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-500 mb-3 shadow-sm">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-1">{analytics?.total_conversations?.toLocaleString() || 0}</p>
            <p className="text-gray-500 text-sm">Total Conversations</p>
          </div>
          
          {/* Total Messages Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 animate-fade-in-up animation-delay-200">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500 mb-3 shadow-sm">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-1">{analytics?.total_messages?.toLocaleString() || 0}</p>
            <p className="text-gray-500 text-sm">Total Messages</p>
          </div>
          
          {/* Total Chatbots Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 animate-fade-in-up animation-delay-300">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500 mb-3 shadow-sm">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-1">{analytics?.total_chatbots || 0}</p>
            <p className="text-gray-500 text-sm">Total Chatbots</p>
          </div>

          {/* Leads Card - Coming Soon */}
          <div 
            className="bg-white rounded-2xl p-5 shadow-sm transition-all duration-300 border border-gray-200 animate-fade-in-up animation-delay-400 cursor-not-allowed opacity-60 relative"
          >
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-500 mb-3 shadow-sm">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-1">{analytics?.total_leads || 0}</p>
            <p className="text-gray-500 text-sm">Leads</p>
            
            {/* Coming Soon Badge */}
            <div className="absolute top-3 right-3 bg-purple-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">
              Coming Soon
            </div>
          </div>
        </div>

        {/* Plan Usage Section - More natural design */}
        {usageStats && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 mb-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-9 h-9 rounded-xl bg-purple-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">{usageStats.plan?.name} Plan</h2>
                </div>
                <p className="text-sm text-gray-500">Monitor your resource usage and limits</p>
              </div>
              <Button
                onClick={() => navigate('/subscription')}
                className="bg-purple-500 hover:bg-purple-600 text-white px-5 py-2 rounded-xl font-medium shadow-sm transition-all duration-300"
              >
                Upgrade Plan
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {/* Chatbots */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-600">Chatbots</p>
                    {usageStats.usage?.chatbots?.is_custom && (
                      <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">CUSTOM</span>
                    )}
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-800 mb-2">
                  {usageStats.usage?.chatbots?.current}/{usageStats.usage?.chatbots?.limit}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-1.5">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      usageStats.usage?.chatbots?.percentage >= 90 ? 'bg-red-500' : 
                      usageStats.usage?.chatbots?.percentage >= 75 ? 'bg-orange-500' : 
                      usageStats.usage?.chatbots?.is_custom ? 'bg-yellow-500' :
                      'bg-purple-500'
                    }`}
                    style={{ width: `${Math.min(usageStats.usage?.chatbots?.percentage || 0, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">{usageStats.usage?.chatbots?.percentage}% used</p>
              </div>

              {/* Messages */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-600">Messages</p>
                    {usageStats.usage?.messages?.is_custom && (
                      <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">CUSTOM</span>
                    )}
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-800 mb-2">
                  {usageStats.usage?.messages?.current}/{usageStats.usage?.messages?.limit === 999999 || usageStats.usage?.messages?.limit === 999999999 ? '∞' : usageStats.usage?.messages?.limit?.toLocaleString()}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-1.5">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      usageStats.usage?.messages?.is_custom ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(usageStats.usage?.messages?.percentage || 0, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">{usageStats.usage?.messages?.percentage}% used</p>
              </div>

              {/* Files */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-pink-500 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-600">Files</p>
                    {usageStats.usage?.file_uploads?.is_custom && (
                      <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">CUSTOM</span>
                    )}
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-800 mb-2">
                  {usageStats.usage?.file_uploads?.current}/{usageStats.usage?.file_uploads?.limit}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-1.5">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      usageStats.usage?.file_uploads?.is_custom ? 'bg-yellow-500' : 'bg-pink-500'
                    }`}
                    style={{ width: `${Math.min(usageStats.usage?.file_uploads?.percentage || 0, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">{usageStats.usage?.file_uploads?.percentage}% used</p>
              </div>

              {/* Websites */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs font-medium text-gray-600">Websites</p>
                </div>
                <p className="text-2xl font-bold text-gray-800 mb-2">
                  {usageStats.usage?.website_sources?.current}/{usageStats.usage?.website_sources?.limit}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-1.5">
                  <div 
                    className="h-2 rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${Math.min(usageStats.usage?.website_sources?.percentage || 0, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">{usageStats.usage?.website_sources?.percentage}% used</p>
              </div>

              {/* Text Sources */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs font-medium text-gray-600">Text Sources</p>
                </div>
                <p className="text-2xl font-bold text-gray-800 mb-2">
                  {usageStats.usage?.text_sources?.current}/{usageStats.usage?.text_sources?.limit}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-1.5">
                  <div 
                    className="h-2 rounded-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${Math.min(usageStats.usage?.text_sources?.percentage || 0, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-600">{usageStats.usage?.text_sources?.percentage}% used</p>
              </div>
            </div>
          </div>
        )}

        {/* Your Chatbots Section - Reduced to 80% */}
        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-0.5">Your Chatbots</h2>
              <p className="text-xs text-gray-600">Manage and monitor your AI agents</p>
            </div>
            <Button 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-1.5 rounded-lg font-semibold shadow-md flex items-center gap-1.5 text-sm"
              onClick={handleCreateChatbot}
            >
              <Plus className="w-4 h-4" />
              Create New
            </Button>
          </div>
          
          {chatbots.length === 0 ? (
            <div className="text-center py-12 animate-fade-in">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-1.5 text-gray-900">No chatbots yet</h3>
              <p className="text-sm text-gray-600 mb-4">Create your first AI chatbot to get started</p>
              <Button 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-1.5 rounded-lg font-semibold shadow-md text-sm"
                onClick={handleCreateChatbot}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Create Chatbot
              </Button>
            </div>
          ) : (
            <div className="grid gap-3">
              {chatbots.map((bot, index) => (
                <div 
                  key={bot.id} 
                  className="group p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer bg-white"
                  onClick={() => navigate(`/chatbot/${bot.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Chatbot Icon */}
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{bot.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            bot.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
                          }`}>
                            {bot.status}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-700">
                            {bot.model}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-md bg-purple-100 flex items-center justify-center">
                              <MessageSquare className="w-3 h-3 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-500">Conversations</p>
                              <p className="font-semibold text-gray-900 text-xs">{bot.conversations_count?.toLocaleString() || 0}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-md bg-cyan-100 flex items-center justify-center">
                              <Activity className="w-3 h-3 text-cyan-600" />
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-500">Messages</p>
                              <p className="font-semibold text-gray-900 text-xs">{bot.messages_count?.toLocaleString() || 0}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Toggle Switch */}
                      <button
                        onClick={(e) => handleToggleChatbot(e, bot.id, bot.status)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                          bot.status === 'active' ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                        role="switch"
                        aria-checked={bot.status === 'active'}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            bot.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      
                      <Button 
                        variant="outline" 
                        onClick={(e) => { e.stopPropagation(); navigate(`/chatbot/${bot.id}`); }}
                        className="border border-gray-300 hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all duration-300 flex items-center gap-1.5 text-xs px-3 py-1.5"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Manage
                      </Button>
                    </div>
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

      {/* Footer */}
      <Footer variant="dashboard" />
    </div>
  );
};

export default Dashboard;
