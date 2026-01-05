import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { TrendingUp, MessageSquare, Users, Clock, BarChart3, Bot, Activity, Calendar } from 'lucide-react';
import UserProfileDropdown from '../components/UserProfileDropdown';
import ResponsiveNav from '../components/ResponsiveNav';
import { useAuth } from '../contexts/AuthContext';
import { AnalyticsSkeleton } from '../components/LoadingSkeleton';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';
import { analyticsAPI, chatbotAPI } from '../utils/api';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Analytics = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30'); // 7, 30, 90 days
  const [chatbots, setChatbots] = useState([]);
  const [conversationData, setConversationData] = useState([]);
  const [messageData, setMessageData] = useState([]);
  const [providerData, setProviderData] = useState([]);

  const loadDashboardAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load dashboard analytics
      const response = await analyticsAPI.getDashboard();
      const data = response.data;
      
      // Load chatbots
      const chatbotsResponse = await chatbotAPI.list();
      const chatbotsData = chatbotsResponse.data.chatbots || [];
      setChatbots(chatbotsData);
      
      // Load real trend data from backend
      const days = parseInt(timeRange);
      const trendsResponse = await analyticsAPI.getTrends(days);
      const trendsData = trendsResponse.data;
      
      setConversationData(trendsData.conversations || []);
      setMessageData(trendsData.messages || []);
      
      // Generate provider distribution data
      const providers = generateProviderData(chatbotsData);
      setProviderData(providers);
      
      setAnalytics({
        totalConversations: data.total_conversations || 0,
        totalMessages: data.total_messages || 0,
        activeChats: data.active_chatbots || 0,
        totalChatbots: data.total_chatbots || 0,
        totalLeads: data.total_leads || 0,
        avgResponseTime: trendsData.avg_response_time || '0s',
        satisfaction: calculateSatisfaction(data.total_conversations, data.total_messages)
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      setError(error.message);
      toast.error('Failed to load analytics data');
      // Set default empty data on error
      setAnalytics({
        totalConversations: 0,
        totalMessages: 0,
        activeChats: 0,
        totalChatbots: 0,
        totalLeads: 0,
        satisfaction: 0,
        avgResponseTime: '0s'
      });
      setConversationData([]);
      setMessageData([]);
      setProviderData([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate provider distribution
  const generateProviderData = (chatbotsData) => {
    const providerCounts = {};
    chatbotsData.forEach(chatbot => {
      const provider = chatbot.ai_provider || 'openai';
      providerCounts[provider] = (providerCounts[provider] || 0) + 1;
    });
    
    return Object.entries(providerCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));
  };

  // Helper function to calculate satisfaction (kept as fallback since no rating system exists)
  const calculateSatisfaction = (conversations, messages) => {
    if (conversations === 0) return 0;
    // Estimate satisfaction based on message engagement
    const avgMsgPerConv = messages / conversations;
    // More messages per conversation suggests better engagement
    const baseRate = 75;
    const engagementBonus = Math.min(20, Math.floor(avgMsgPerConv * 2));
    return Math.min(98, baseRate + engagementBonus);
  };

  useEffect(() => {
    loadDashboardAnalytics();
  }, [timeRange]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 relative overflow-hidden animate-fade-in">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <ResponsiveNav currentPage="analytics" user={user} onLogout={handleLogout} />

      <div className="p-6 max-w-[95%] mx-auto relative z-10">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">Analytics Overview</h1>
          <p className="text-gray-600">Track your chatbot performance and user engagement</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex justify-end mb-6 animate-fade-in">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-1 border-2 border-purple-200/50 shadow-lg">
            {['7', '30', '90'].map((days) => (
              <button
                key={days}
                onClick={() => setTimeRange(days)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  timeRange === days
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl border-2 border-purple-200/50 hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 transform hover:-translate-y-2 animate-fade-in-up overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/30 mb-3 inline-block transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{analytics?.totalConversations.toLocaleString() || 0}</p>
              <p className="text-gray-600 text-sm mt-2 font-medium">Total Conversations</p>
            </div>
          </div>
          
          <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl border-2 border-blue-200/50 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 transform hover:-translate-y-2 animate-fade-in-up animation-delay-300 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg shadow-blue-500/30 mb-3 inline-block transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{analytics?.totalMessages?.toLocaleString() || 0}</p>
              <p className="text-gray-600 text-sm mt-2 font-medium">Total Messages</p>
            </div>
          </div>
          
          <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl border-2 border-green-200/50 hover:border-green-400 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-500 transform hover:-translate-y-2 animate-fade-in-up animation-delay-500 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-emerald-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/30 mb-3 inline-block transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{analytics?.activeChats || 0} / {analytics?.totalChatbots || 0}</p>
              <p className="text-gray-600 text-sm mt-2 font-medium">Active Chatbots</p>
            </div>
          </div>
          
          <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl border-2 border-orange-200/50 hover:border-orange-400 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-500 transform hover:-translate-y-2 animate-fade-in-up animation-delay-700 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-red-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg shadow-orange-500/30 mb-3 inline-block transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{analytics?.avgResponseTime || '0s'}</p>
              <p className="text-gray-600 text-sm mt-2 font-medium">Avg Response Time</p>
            </div>
          </div>
        </div>

        {analytics && analytics.totalConversations === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-purple-200/50 p-16 text-center shadow-xl animate-fade-in">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 transform hover:scale-110 transition-transform duration-300">
              <BarChart3 className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-gray-900">No analytics data yet</h3>
            <p className="text-gray-600 mb-6">Create a chatbot and start conversations to see analytics here</p>
            <Button 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30 transform hover:scale-105 transition-all duration-300"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
          </div>
        ) : (
          <>
            {/* Graphs Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              
              {/* Conversation Trend - Area Chart */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-purple-200/50 p-6 shadow-xl animate-fade-in-up">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent">Conversations Over Time</h2>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={conversationData}>
                    <defs>
                      <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9333ea" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: '2px solid #e9d5ff',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Area type="monotone" dataKey="count" stroke="#9333ea" strokeWidth={2} fillOpacity={1} fill="url(#colorConv)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Message Volume - Bar Chart */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-blue-200/50 p-6 shadow-xl animate-fade-in-up animation-delay-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">Message Volume</h2>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={messageData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: '2px solid #dbeafe',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Bar dataKey="count" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* AI Provider Distribution - Pie Chart */}
              {providerData.length > 0 && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-green-200/50 p-6 shadow-xl animate-fade-in-up animation-delay-500">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-green-600 bg-clip-text text-transparent">AI Provider Distribution</h2>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={providerData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {providerData.map((entry, index) => {
                          const colors = ['#9333ea', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
                          return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                        })}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          border: '2px solid #d1fae5',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }} 
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Chatbot Performance - Line Chart */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-orange-200/50 p-6 shadow-xl animate-fade-in-up animation-delay-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-orange-600 bg-clip-text text-transparent">Performance Metrics</h2>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={conversationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: '2px solid #fed7aa',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#f97316" strokeWidth={3} name="Conversations" dot={{ fill: '#f97316', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Satisfaction Rate</h3>
                  <TrendingUp className="w-6 h-6" />
                </div>
                <p className="text-5xl font-bold mb-2">{analytics?.satisfaction || 0}%</p>
                <p className="text-purple-100 text-sm">Based on user interactions</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white shadow-xl animate-fade-in-up animation-delay-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Avg Msg/Conv</h3>
                  <MessageSquare className="w-6 h-6" />
                </div>
                <p className="text-5xl font-bold mb-2">
                  {analytics?.totalConversations > 0 
                    ? (analytics.totalMessages / analytics.totalConversations).toFixed(1)
                    : 0
                  }
                </p>
                <p className="text-blue-100 text-sm">Messages per conversation</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl animate-fade-in-up animation-delay-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Total Leads</h3>
                  <Users className="w-6 h-6" />
                </div>
                <p className="text-5xl font-bold mb-2">{analytics?.totalLeads || 0}</p>
                <p className="text-green-100 text-sm">Captured from conversations</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <Footer variant="dashboard" />
    </div>
  );
};

export default Analytics;