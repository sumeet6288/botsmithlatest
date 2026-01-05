import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, MessageSquare, Star, Clock, RefreshCw } from 'lucide-react';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || ''
});

const AdvancedAnalytics = ({ chatbotId }) => {
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('7days');
  const [trendData, setTrendData] = useState(null);
  const [topQuestions, setTopQuestions] = useState(null);
  const [satisfaction, setSatisfaction] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [responseTimeTrend, setResponseTimeTrend] = useState(null);
  const [hourlyActivity, setHourlyActivity] = useState(null);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [trends, questions, sat, perf, responseTrend, hourly] = await Promise.all([
        api.get(`/api/analytics/trends/${chatbotId}?period=${period}`).then(r => r.data),
        api.get(`/api/analytics/top-questions/${chatbotId}`).then(r => r.data),
        api.get(`/api/analytics/satisfaction/${chatbotId}`).then(r => r.data),
        api.get(`/api/analytics/performance/${chatbotId}`).then(r => r.data),
        api.get(`/api/analytics/response-time-trend/${chatbotId}?period=${period}`).then(r => r.data),
        api.get(`/api/analytics/hourly-activity/${chatbotId}`).then(r => r.data),
      ]);
      
      setTrendData(trends);
      setTopQuestions(questions);
      setSatisfaction(sat);
      setPerformance(perf);
      setResponseTimeTrend(responseTrend);
      setHourlyActivity(hourly);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [chatbotId, period]);

  const COLORS = ['#7c3aed', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];

  const satisfactionPieData = satisfaction ? [
    { name: '5 Stars', value: satisfaction.rating_distribution[5] },
    { name: '4 Stars', value: satisfaction.rating_distribution[4] },
    { name: '3 Stars', value: satisfaction.rating_distribution[3] },
    { name: '2 Stars', value: satisfaction.rating_distribution[2] },
    { name: '1 Star', value: satisfaction.rating_distribution[1] },
  ].filter(item => item.value > 0) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Period Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Advanced Analytics
        </h3>
        <div className="flex space-x-2 w-full sm:w-auto">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>
          <button
            onClick={loadAnalytics}
            className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 sm:p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs sm:text-sm mb-1">Avg Daily Messages</p>
              <p className="text-2xl sm:text-3xl font-bold">{trendData?.avg_daily_messages?.toFixed(1) || 0}</p>
            </div>
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-4 sm:p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-xs sm:text-sm mb-1">Total Conversations</p>
              <p className="text-2xl sm:text-3xl font-bold">{trendData?.total_conversations || 0}</p>
            </div>
            <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-pink-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 sm:p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-xs sm:text-sm mb-1">Satisfaction Rate</p>
              <p className="text-2xl sm:text-3xl font-bold">{satisfaction?.satisfaction_percentage?.toFixed(1) || 0}%</p>
            </div>
            <Star className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 sm:p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs sm:text-sm mb-1">Avg Response Time</p>
              <p className="text-2xl sm:text-3xl font-bold">{(performance?.avg_response_time_ms / 1000)?.toFixed(1) || 0}s</p>
            </div>
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Message Trends Chart */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
        <h4 className="text-base sm:text-lg font-semibold mb-4">Message Volume Trends</h4>
        {!trendData || trendData.total_messages === 0 && trendData.total_conversations === 0 ? (
          <div className="flex flex-col items-center justify-center h-[250px] sm:h-[300px] bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
            <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 mb-4 text-purple-300" />
            <p className="text-base sm:text-lg font-semibold text-gray-700">No message data available yet</p>
            <p className="text-xs sm:text-sm mt-2 text-center px-4 text-gray-500">
              Start chatting with your bot to see message trends appear here
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#888" fontSize={10} tick={{ fontSize: 10 }} />
              <YAxis stroke="#888" fontSize={10} tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line 
                type="monotone" 
                dataKey="conversations" 
                stroke="#7c3aed" 
                strokeWidth={2}
                name="Conversations"
                dot={{ fill: '#7c3aed' }}
              />
              <Line 
                type="monotone" 
                dataKey="messages" 
                stroke="#ec4899" 
                strokeWidth={2}
                name="Messages"
                dot={{ fill: '#ec4899' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Questions Chart */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h4 className="text-base sm:text-lg font-semibold mb-4">Top Asked Questions</h4>
          {!topQuestions || topQuestions.top_questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[250px] bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
              <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 mb-4 text-blue-300" />
              <p className="text-base sm:text-lg font-semibold text-gray-700">No questions yet</p>
              <p className="text-xs sm:text-sm mt-2 text-center px-4 text-gray-500">
                Questions will appear as users interact with your chatbot
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topQuestions.top_questions.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="question" stroke="#888" fontSize={9} angle={-15} textAnchor="end" height={80} tick={{ fontSize: 9 }} />
                <YAxis stroke="#888" fontSize={10} tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" fill="#7c3aed" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Satisfaction Distribution Chart */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h4 className="text-base sm:text-lg font-semibold mb-4">Satisfaction Distribution</h4>
          {!satisfaction || satisfactionPieData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[250px] bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
              <Star className="w-12 h-12 sm:w-16 sm:h-16 mb-4 text-yellow-300" />
              <p className="text-base sm:text-lg font-semibold text-gray-700">No ratings yet</p>
              <p className="text-xs sm:text-sm mt-2 text-center px-4 text-gray-500">
                User satisfaction ratings will be displayed here
              </p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={satisfactionPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    style={{ fontSize: '11px' }}
                  >
                    {satisfactionPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 text-center">
                <p className="text-xs sm:text-sm text-gray-600">
                  Average Rating: <span className="font-bold text-purple-600">{satisfaction.average_rating.toFixed(1)}/5.0</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Based on {satisfaction.total_ratings} ratings
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
        <h4 className="text-base sm:text-lg font-semibold mb-4">Performance Metrics</h4>
        {!performance || performance.total_responses === 0 ? (
          <div className="flex flex-col items-center justify-center h-[150px] bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg">
            <Clock className="w-12 h-12 mb-3 text-pink-300" />
            <p className="text-base font-semibold text-gray-700">No performance data yet</p>
            <p className="text-xs mt-1 text-gray-500">Metrics will appear after first responses</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 bg-purple-50 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Fastest Response</p>
                <p className="text-xl sm:text-2xl font-bold text-purple-600">
                  {(performance.fastest_response_ms / 1000).toFixed(2)}s
                </p>
              </div>
              <div className="p-3 sm:p-4 bg-pink-50 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Average Response</p>
                <p className="text-xl sm:text-2xl font-bold text-pink-600">
                  {(performance.avg_response_time_ms / 1000).toFixed(2)}s
                </p>
              </div>
              <div className="p-3 sm:p-4 bg-indigo-50 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Slowest Response</p>
                <p className="text-xl sm:text-2xl font-bold text-indigo-600">
                  {(performance.slowest_response_ms / 1000).toFixed(2)}s
                </p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-4 text-center">
              Total Responses: {performance.total_responses}
            </p>
          </>
        )}
      </div>

      {/* New Graphs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Response Time Trend Chart */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h4 className="text-base sm:text-lg font-semibold mb-4">Response Time Trend</h4>
          {!responseTimeTrend || !responseTimeTrend.data || responseTimeTrend.data.length === 0 || !responseTimeTrend.data.some(d => d.avg_response_time > 0) ? (
            <div className="flex flex-col items-center justify-center h-[250px] bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
              <Clock className="w-12 h-12 sm:w-16 sm:h-16 mb-4 text-indigo-300" />
              <p className="text-base sm:text-lg font-semibold text-gray-700">No response time data yet</p>
              <p className="text-xs sm:text-sm mt-2 text-center px-4 text-gray-500">
                Response times will be tracked as conversations happen
              </p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={responseTimeTrend.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#888" fontSize={10} tick={{ fontSize: 10 }} />
                  <YAxis stroke="#888" fontSize={10} tick={{ fontSize: 10 }} label={{ value: 'Seconds', angle: -90, position: 'insideLeft', fontSize: 10 }} allowDecimals={true} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value) => [`${value}s`, 'Avg Response Time']}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line 
                    type="monotone" 
                    dataKey="avg_response_time" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Avg Response Time (s)"
                    dot={{ fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Track how your chatbot's response speed changes over time
              </p>
            </>
          )}
        </div>

        {/* Hourly Activity Chart */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <h4 className="text-base sm:text-lg font-semibold mb-4">Hourly Activity Distribution</h4>
          {!hourlyActivity || !hourlyActivity.hourly_data || hourlyActivity.total_messages === 0 ? (
            <div className="flex flex-col items-center justify-center h-[250px] bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
              <TrendingUp className="w-12 h-12 sm:w-16 sm:h-16 mb-4 text-green-300" />
              <p className="text-base sm:text-lg font-semibold text-gray-700">No hourly activity data yet</p>
              <p className="text-xs sm:text-sm mt-2 text-center px-4 text-gray-500">
                Activity patterns will appear as messages are sent
              </p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={hourlyActivity.hourly_data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="hour" stroke="#888" fontSize={9} tick={{ fontSize: 9 }} />
                  <YAxis stroke="#888" fontSize={10} tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value) => [`${value}`, 'Messages']}
                  />
                  <Bar dataKey="messages" fill="#10b981" radius={[8, 8, 0, 0]}>
                    {hourlyActivity.hourly_data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.messages > 0 ? '#10b981' : '#e5e7eb'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Peak hour: <span className="font-semibold text-green-600">{hourlyActivity.peak_hour}:00</span> • Total messages: {hourlyActivity.total_messages}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
