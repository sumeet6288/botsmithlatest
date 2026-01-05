import React, { useState, useEffect } from 'react';
import { TrendingUp, MessageSquare, Users, Zap } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const AdvancedAnalytics = ({ backendUrl }) => {
  const [userGrowth, setUserGrowth] = useState([]);
  const [messageVolume, setMessageVolume] = useState([]);
  const [providerDist, setProviderDist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch user growth
      const growthRes = await fetch(`${backendUrl}/api/admin/analytics/users/growth?days=30`);
      const growthData = await growthRes.json();
      setUserGrowth(growthData.growth || []);
      
      // Fetch message volume
      const volumeRes = await fetch(`${backendUrl}/api/admin/analytics/messages/volume?days=30`);
      const volumeData = await volumeRes.json();
      setMessageVolume(volumeData.volume || []);
      
      // Fetch provider distribution
      const providerRes = await fetch(`${backendUrl}/api/admin/analytics/providers/distribution`);
      const providerData = await providerRes.json();
      setProviderDist(providerData.distribution || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Calculate totals
  const totalUsers = userGrowth.reduce((sum, item) => sum + (item.count || 0), 0);
  const totalMessages = messageVolume.reduce((sum, item) => sum + (item.count || 0), 0);
  const totalProviders = providerDist.reduce((sum, p) => sum + (p.count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-900">{totalUsers}</div>
              <div className="text-sm text-purple-600">New Users (30d)</div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-900">{totalMessages.toLocaleString()}</div>
              <div className="text-sm text-blue-600">Total Messages (30d)</div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-900">{providerDist.length}</div>
              <div className="text-sm text-green-600">Active Providers</div>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-900">
                {messageVolume.length > 0 ? Math.round(totalMessages / messageVolume.length) : 0}
              </div>
              <div className="text-sm text-orange-600">Avg Messages/Day</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            User Growth Trend
          </h3>
          {userGrowth.length > 0 && userGrowth.some(d => (d.count || 0) > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userGrowth}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorUsers)" name="New Users" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
              <Users className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">No user data available</p>
              <p className="text-sm mt-2">User growth trends will appear here</p>
            </div>
          )}
        </div>

        {/* Message Volume */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Message Volume Trend
          </h3>
          {messageVolume.length > 0 && messageVolume.some(d => (d.count || 0) > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={messageVolume}>
                <defs>
                  <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorMessages)" name="Messages" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
              <MessageSquare className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">No message data available</p>
              <p className="text-sm mt-2">Message volume trends will appear here</p>
            </div>
          )}
        </div>

        {/* Provider Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold mb-4">AI Provider Distribution</h3>
          {providerDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={providerDist}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ provider, count }) => `${provider || 'Not Specified'}: ${count || 0}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {providerDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => {
                  const providerName = props.payload.provider || 'Not Specified';
                  return [value, providerName];
                }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
              <Zap className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">No provider data available</p>
              <p className="text-sm mt-2">AI provider distribution will appear here</p>
            </div>
          )}
        </div>

        {/* Provider Usage Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold mb-4">Provider Usage Comparison</h3>
          {providerDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={providerDist.map(p => ({ 
                  ...p, 
                  provider: p.provider || 'Not Specified' 
                }))} 
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                <YAxis dataKey="provider" type="category" tick={{ fontSize: 12 }} width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" name="Chatbots" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
              <TrendingUp className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg font-medium">No provider data available</p>
              <p className="text-sm mt-2">Provider usage comparison will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Stats Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold mb-4">Provider Statistics</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Provider</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Chatbots</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Percentage</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {providerDist.length > 0 ? (
                providerDist.map((provider, idx) => {
                  const percentage = totalProviders > 0 
                    ? ((provider.count / totalProviders) * 100).toFixed(1) 
                    : '0.0';
                  const providerName = provider.provider || 'Not Specified';
                  return (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{providerName}</td>
                      <td className="py-3 px-4">{provider.count || 0}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{percentage}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                          Active
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-400">
                    <p className="text-lg font-medium">No provider data available</p>
                    <p className="text-sm mt-2">Create chatbots with AI providers to see statistics</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
