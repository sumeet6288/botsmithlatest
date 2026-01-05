import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Users, Bot, BarChart3, Database, LogOut, FileText, AlertTriangle, Shield, TrendingUp, MessageSquare, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AdminSidebar from '../../components/admin/AdminSidebar';
import UsersManagement from '../../components/admin/UsersManagement';
import EnhancedUsersManagement from '../../components/admin/EnhancedUsersManagement';
import AdvancedUsersManagement from '../../components/admin/AdvancedUsersManagement';
import ChatbotsManagement from '../../components/admin/ChatbotsManagement';
import EnhancedChatbotsManagement from '../../components/admin/EnhancedChatbotsManagement';
import ConversationsManagement from '../../components/admin/ConversationsManagement';
import SystemMonitoring from '../../components/admin/SystemMonitoring';
import RevenueDashboard from '../../components/admin/RevenueDashboard';
import AdvancedAnalytics from '../../components/admin/AdvancedAnalytics';
import SystemSettings from '../../components/admin/SystemSettings';
import ActivityLogs from '../../components/admin/ActivityLogs';
import ContactSalesManagement from '../../components/admin/ContactSalesManagement';
import AdvancedUserSearch from '../../components/admin/AdvancedUserSearch';
import UserSegmentation from '../../components/admin/UserSegmentation';
import EmailCampaignBuilder from '../../components/admin/EmailCampaignBuilder';
import LifecycleManagement from '../../components/admin/LifecycleManagement';
import LeadsManagement from '../../components/admin/LeadsManagement';
import TechManagement from '../../components/admin/TechManagement';
import PaymentGatewaySettings from '../../components/admin/PaymentGatewaySettings';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeChatbots: 0,
    totalMessages: 0,
    activeIntegrations: 0
  });
  const [sources, setSources] = useState([]);
  const [flaggedContent, setFlaggedContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [messageVolumeData, setMessageVolumeData] = useState([]);
  const [providerDistribution, setProviderDistribution] = useState([]);
  const [conversationsTrendData, setConversationsTrendData] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    // For demo purposes, set a default admin user
    setUser({
      name: 'Admin User',
      email: 'admin@botsmith.co'
    });

    // Fetch real stats from backend
    fetchAdminStats();
    fetchSources();
    fetchFlaggedContent();
    fetchAnalyticsData();
  }, [navigate, timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      // Fetch user growth
      const userGrowthRes = await fetch(`${backendUrl}/api/admin/analytics/users/growth?days=${timeRange}`);
      const userGrowthJson = await userGrowthRes.json();
      
      // Fetch message volume
      const messageVolumeRes = await fetch(`${backendUrl}/api/admin/analytics/messages/volume?days=${timeRange}`);
      const messageVolumeJson = await messageVolumeRes.json();
      
      // Fetch provider distribution
      const providerRes = await fetch(`${backendUrl}/api/admin/analytics/providers/distribution`);
      const providerJson = await providerRes.json();
      
      // Fetch conversations trend
      const conversationsTrendRes = await fetch(`${backendUrl}/api/admin/analytics/conversations/trend?days=${timeRange}`);
      const conversationsTrendJson = await conversationsTrendRes.json();
      
      // Fetch general analytics
      const analyticsRes = await fetch(`${backendUrl}/api/admin/analytics`);
      const analyticsJson = await analyticsRes.json();
      
      // Process user growth data with fallback
      const formattedUserGrowth = (userGrowthJson.growth || []).length > 0 
        ? (userGrowthJson.growth || []).map(item => ({
            date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            count: item.count || 0
          }))
        : [{ date: 'No data', count: 0 }]; // Fallback for empty data
      
      // Process message volume data with fallback
      const formattedMessageVolume = (messageVolumeJson.volume || []).length > 0
        ? (messageVolumeJson.volume || []).map(item => ({
            date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            count: item.count || 0
          }))
        : [{ date: 'No data', count: 0 }]; // Fallback for empty data
      
      // Process provider distribution with fallback
      const formattedProviders = (providerJson.providers || []).length > 0
        ? (providerJson.providers || []).map(item => ({
            name: item.provider || 'Unknown',
            value: item.count || 0
          }))
        : [{ name: 'No providers yet', value: 1 }]; // Fallback for empty data
      
      // Process conversations trend data with fallback
      const formattedConversationsTrend = (conversationsTrendJson.trend || []).length > 0
        ? (conversationsTrendJson.trend || []).map(item => ({
            date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            count: item.count || 0,
            conversations: item.conversations || 0
          }))
        : [{ date: 'No data', count: 0 }]; // Fallback for empty data
      
      setUserGrowthData(formattedUserGrowth);
      setMessageVolumeData(formattedMessageVolume);
      setProviderDistribution(formattedProviders);
      setConversationsTrendData(formattedConversationsTrend);
      setAnalyticsData(analyticsJson);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Set fallback data on error
      setUserGrowthData([{ date: 'No data', count: 0 }]);
      setMessageVolumeData([{ date: 'No data', count: 0 }]);
      setProviderDistribution([{ name: 'No data', value: 1 }]);
      setConversationsTrendData([{ date: 'No data', count: 0 }]);
    }
  };

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/api/admin/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSources = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/admin/sources`);
      const data = await response.json();
      setSources(data.sources || []);
    } catch (error) {
      console.error('Error fetching sources:', error);
    }
  };

  const fetchFlaggedContent = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/admin/moderation/flagged`);
      const data = await response.json();
      setFlaggedContent(data.flagged_conversations || []);
    } catch (error) {
      console.error('Error fetching flagged content:', error);
    }
  };

  const deleteSource = async (sourceId) => {
    if (!window.confirm('Are you sure you want to delete this source?')) {
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/admin/sources/${sourceId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        alert('Source deleted successfully');
        fetchSources();
      }
    } catch (error) {
      console.error('Error deleting source:', error);
      alert('Failed to delete source');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('botsmith_user');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AdminSidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div 
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? '64px' : '256px' }}
      >
        {/* Header */}
        <nav className="bg-white border-b border-gray-200">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </nav>

        <div className="p-6 max-w-full">
          {/* Main Content */}
          {activeTab === 'overview' && (
            <>
              {/* Time Range Selector */}
              <div className="flex justify-end mb-6">
                <div className="bg-white rounded-xl p-1 border border-gray-200 shadow-sm">
                  {['7', '30', '90'].map((days) => (
                    <button
                      key={days}
                      onClick={() => setTimeRange(days)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        timeRange === days
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                          : 'text-gray-600 hover:text-blue-600'
                      }`}
                    >
                      {days} Days
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats Overview - Only on Overview Tab */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                  <Users className="w-8 h-8 text-white mb-3 opacity-90" />
                  <p className="text-4xl font-bold text-white">
                    {loading ? '...' : stats.totalUsers.toLocaleString()}
                  </p>
                  <p className="text-blue-100 text-sm mt-1 font-medium">Total Users</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                  <Bot className="w-8 h-8 text-white mb-3 opacity-90" />
                  <p className="text-4xl font-bold text-white">
                    {loading ? '...' : stats.activeChatbots.toLocaleString()}
                  </p>
                  <p className="text-green-100 text-sm mt-1 font-medium">Active Chatbots</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                  <MessageSquare className="w-8 h-8 text-white mb-3 opacity-90" />
                  <p className="text-4xl font-bold text-white">
                    {loading ? '...' : stats.totalMessages.toLocaleString()}
                  </p>
                  <p className="text-purple-100 text-sm mt-1 font-medium">Total Messages</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                  <Database className="w-8 h-8 text-white mb-3 opacity-90" />
                  <p className="text-4xl font-bold text-white">
                    {loading ? '...' : stats.activeIntegrations.toLocaleString()}
                  </p>
                  <p className="text-orange-100 text-sm mt-1 font-medium">Integrations</p>
                </div>
              </div>

              {/* Analytics Graphs Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                
                {/* User Growth Chart */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">User Growth</h3>
                  </div>
                  {userGrowthData && userGrowthData.length > 0 && userGrowthData[0].date !== 'No data' ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={userGrowthData}>
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
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
                        <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-gray-400 mb-2">
                          <BarChart3 className="w-16 h-16 mx-auto opacity-50" />
                        </div>
                        <p className="text-gray-500 font-medium">No user growth data yet</p>
                        <p className="text-sm text-gray-400 mt-1">Data will appear once users start signing up</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Message Volume Chart */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Message Volume</h3>
                  </div>
                  {messageVolumeData && messageVolumeData.length > 0 && messageVolumeData[0].date !== 'No data' ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={messageVolumeData}>
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
                        <Bar dataKey="count" fill="url(#purpleGradient)" radius={[8, 8, 0, 0]} />
                        <defs>
                          <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#9333ea" />
                            <stop offset="100%" stopColor="#a855f7" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-gray-400 mb-2">
                          <MessageSquare className="w-16 h-16 mx-auto opacity-50" />
                        </div>
                        <p className="text-gray-500 font-medium">No message data yet</p>
                        <p className="text-sm text-gray-400 mt-1">Data will appear once chatbots start handling conversations</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Provider Distribution Pie Chart */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">AI Provider Usage</h3>
                  </div>
                  {providerDistribution && providerDistribution.length > 0 && providerDistribution[0].name !== 'No providers yet' ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={providerDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {providerDistribution.map((entry, index) => {
                            const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
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
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-gray-400 mb-2">
                          <Bot className="w-16 h-16 mx-auto opacity-50" />
                        </div>
                        <p className="text-gray-500 font-medium">No AI provider data yet</p>
                        <p className="text-sm text-gray-400 mt-1">Data will appear once chatbots are created with AI providers</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Conversations Trend Line Chart */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Conversations Trend</h3>
                  </div>
                  {conversationsTrendData && conversationsTrendData.length > 0 && conversationsTrendData[0].date !== 'No data' ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={conversationsTrendData}>
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
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-gray-400 mb-2">
                          <Activity className="w-16 h-16 mx-auto opacity-50" />
                        </div>
                        <p className="text-gray-500 font-medium">No conversation data yet</p>
                        <p className="text-sm text-gray-400 mt-1">Data will appear once chatbots start handling conversations</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Overview Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 w-full shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">Total Sources</span>
                    <span className="text-2xl font-bold text-blue-600">{sources.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="font-medium">Flagged Content</span>
                    <span className="text-2xl font-bold text-red-600">{flaggedContent.length}</span>
                  </div>
                </div>
              </div>

              {/* Recent Sources */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 w-full shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  Recent Sources
                </h3>
                <div className="space-y-2">
                  {sources.slice(0, 5).map((source) => (
                    <div key={source.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-sm">{source.name}</p>
                        <p className="text-xs text-gray-500">{source.type}</p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(source.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                  {sources.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No sources yet</p>
                  )}
                </div>
              </div>

              {/* Flagged Conversations */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2 w-full">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  Flagged Conversations
                </h3>
                {flaggedContent.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No flagged content</p>
                ) : (
                  <div className="space-y-3">
                    {flaggedContent.map((conv) => (
                      <div key={conv.conversation_id} className="p-4 border border-red-200 bg-red-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-medium">{conv.user_name || 'Anonymous'}</span>
                            <span className="text-sm text-gray-600 ml-2">
                              ({new Date(conv.created_at).toLocaleDateString()})
                            </span>
                          </div>
                          <span className="px-3 py-1 bg-red-600 text-white rounded-full text-xs">
                            {conv.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{conv.flag_reason}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {conv.messages?.length || 0} messages
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            </>
          )}

          {activeTab === 'advanced-search' && (
            <AdvancedUserSearch backendUrl={backendUrl} />
          )}

          {activeTab === 'segmentation' && (
            <UserSegmentation backendUrl={backendUrl} />
          )}

          {activeTab === 'email-campaigns' && (
            <EmailCampaignBuilder backendUrl={backendUrl} />
          )}

          {activeTab === 'lifecycle' && (
            <LifecycleManagement backendUrl={backendUrl} />
          )}

          {activeTab === 'revenue' && (
            <RevenueDashboard backendUrl={backendUrl} />
          )}

          {activeTab === 'users' && (
            <AdvancedUsersManagement backendUrl={backendUrl} />
          )}

          {activeTab === 'chatbots' && (
            <EnhancedChatbotsManagement backendUrl={backendUrl} />
          )}

          {activeTab === 'conversations' && (
            <ConversationsManagement backendUrl={backendUrl} />
          )}

          {activeTab === 'sources' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 w-full">
              <h2 className="text-2xl font-bold mb-6">Sources Management</h2>
              {sources.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No sources found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Chatbot</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Size</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Created</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sources.map((source) => (
                        <tr key={source.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{source.name}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                              {source.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-xs">{source.chatbot_id.substring(0, 8)}...</td>
                          <td className="py-3 px-4 text-sm">{source.file_size ? `${(source.file_size / 1024).toFixed(2)} KB` : 'N/A'}</td>
                          <td className="py-3 px-4">
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                              {source.status || 'active'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {new Date(source.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteSource(source.id)}
                            >
                              <LogOut className="w-4 h-4 text-red-600" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'monitoring' && (
            <SystemMonitoring backendUrl={backendUrl} />
          )}

          {activeTab === 'analytics' && (
            <AdvancedAnalytics backendUrl={backendUrl} />
          )}

          {activeTab === 'logs' && (
            <ActivityLogs backendUrl={backendUrl} />
          )}

          {activeTab === 'leads' && (
            <LeadsManagement />
          )}

          {activeTab === 'contact-sales' && (
            <ContactSalesManagement backendUrl={backendUrl} />
          )}

          {activeTab === 'moderation' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 w-full">
              <h2 className="text-2xl font-bold mb-6">Content Moderation</h2>
              {flaggedContent.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No flagged content to review</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {flaggedContent.map((conv) => (
                    <div key={conv.conversation_id} className="p-6 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg">{conv.user_name || 'Anonymous User'}</h3>
                          <p className="text-sm text-gray-600">
                            Conversation ID: {conv.conversation_id.substring(0, 16)}...
                          </p>
                        </div>
                        <span className="px-4 py-2 bg-red-100 text-red-700 rounded-full font-medium">
                          {conv.status}
                        </span>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Reason:</p>
                        <p className="text-sm text-gray-600">{conv.flag_reason}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Messages:</p>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {conv.messages?.map((msg, idx) => (
                            <div key={idx} className={`p-3 rounded-lg ${
                              msg.role === 'user' ? 'bg-blue-50' : 'bg-gray-50'
                            }`}>
                              <p className="text-xs font-semibold text-gray-500 mb-1">
                                {msg.role === 'user' ? 'USER' : 'ASSISTANT'}
                              </p>
                              <p className="text-sm">{msg.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <SystemSettings backendUrl={backendUrl} />
          )}

          {activeTab === 'payment-gateway' && (
            <PaymentGatewaySettings backendUrl={backendUrl} />
          )}

          {activeTab === 'tech' && (
            <TechManagement backendUrl={backendUrl} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;