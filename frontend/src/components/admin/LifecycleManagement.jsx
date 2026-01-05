import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Users, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LifecycleManagement = ({ backendUrl }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/admin/users-enhanced/lifecycle-analytics`);
      const data = await response.json();
      if (data.success) {
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching lifecycle analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateChurnRisk = async () => {
    if (!window.confirm('This will recalculate churn risk scores for all users. Continue?')) return;
    
    setCalculating(true);
    try {
      const response = await fetch(`${backendUrl}/api/admin/users-enhanced/calculate-churn-risk`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        fetchAnalytics();
      }
    } catch (error) {
      console.error('Error calculating churn risk:', error);
      alert('Failed to calculate churn risk');
    } finally {
      setCalculating(false);
    }
  };

  const lifecycleColors = {
    new: '#3b82f6',
    active: '#10b981',
    engaged: '#8b5cf6',
    at_risk: '#f59e0b',
    churned: '#ef4444'
  };

  const lifecycleData = analytics?.lifecycle_distribution?.map(item => ({
    name: item._id || 'Unknown',
    count: item.count,
    churn_risk: (item.avg_churn_risk * 100).toFixed(1),
    lifetime_value: item.avg_lifetime_value?.toFixed(2) || 0
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Lifecycle Management</h2>
          <p className="text-gray-600">Track user lifecycle stages and churn risk</p>
        </div>
        <Button onClick={calculateChurnRisk} disabled={calculating}>
          <RefreshCw className={`w-4 h-4 mr-2 ${calculating ? 'animate-spin' : ''}`} />
          {calculating ? 'Calculating...' : 'Recalculate Churn Risk'}
        </Button>
      </div>

      {/* Key Metrics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-6">
            <AlertTriangle className="w-8 h-8 mb-3 opacity-80" />
            <p className="text-3xl font-bold">{analytics.at_risk_users || 0}</p>
            <p className="text-sm opacity-90">At-Risk Users (Churn Risk {'>'} 70%)</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6">
            <TrendingDown className="w-8 h-8 mb-3 opacity-80" />
            <p className="text-3xl font-bold">{analytics.incomplete_onboarding || 0}</p>
            <p className="text-sm opacity-90">Incomplete Onboarding</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6">
            <CheckCircle className="w-8 h-8 mb-3 opacity-80" />
            <p className="text-3xl font-bold">
              {lifecycleData.reduce((sum, item) => sum + item.count, 0)}
            </p>
            <p className="text-sm opacity-90">Total Users Tracked</p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lifecycle Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold mb-4">Lifecycle Stage Distribution</h3>
          {lifecycleData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={lifecycleData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name}: ${entry.count}`}
                >
                  {lifecycleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={lifecycleColors[entry.name] || '#gray'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">No data available</div>
          )}
        </div>

        {/* Average Churn Risk by Stage */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold mb-4">Average Churn Risk by Stage</h3>
          {lifecycleData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={lifecycleData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="churn_risk" name="Churn Risk (%)" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">No data available</div>
          )}
        </div>
      </div>

      {/* Lifecycle Stage Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold mb-4">Lifecycle Stage Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Count</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Churn Risk</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Lifetime Value</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {lifecycleData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    {loading ? 'Loading...' : 'No lifecycle data available'}
                  </td>
                </tr>
              ) : (
                lifecycleData.map((stage) => (
                  <tr key={stage.name} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex px-3 py-1 text-sm font-semibold rounded-full"
                        style={{
                          backgroundColor: lifecycleColors[stage.name] + '20',
                          color: lifecycleColors[stage.name]
                        }}
                      >
                        {stage.name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-lg font-bold">{stage.count}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold">{stage.churn_risk}%</span>
                        {parseFloat(stage.churn_risk) > 70 ? (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        ) : parseFloat(stage.churn_risk) > 40 ? (
                          <TrendingUp className="w-4 h-4 text-orange-500" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-lg font-semibold">${stage.lifetime_value}</span>
                    </td>
                    <td className="px-4 py-3">
                      {stage.name === 'churned' ? (
                        <span className="text-red-600 font-medium">Needs Attention</span>
                      ) : stage.name === 'at_risk' ? (
                        <span className="text-orange-600 font-medium">Monitor Closely</span>
                      ) : (
                        <span className="text-green-600 font-medium">Healthy</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">Recommendations</h3>
        <div className="space-y-2 text-sm text-blue-800">
          {analytics?.at_risk_users > 0 && (
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>
                <strong>{analytics.at_risk_users} users</strong> are at high risk of churning. Consider sending re-engagement emails or offering incentives.
              </p>
            </div>
          )}
          {analytics?.incomplete_onboarding > 0 && (
            <div className="flex items-start gap-2">
              <Users className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>
                <strong>{analytics.incomplete_onboarding} users</strong> haven't completed onboarding. Send them helpful resources or tutorial emails.
              </p>
            </div>
          )}
          {lifecycleData.find(s => s.name === 'engaged')?.count > 0 && (
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>
                Engaged users are your most valuable segment. Consider upgrading them to premium plans or asking for referrals.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LifecycleManagement;