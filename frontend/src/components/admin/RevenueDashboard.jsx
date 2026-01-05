import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, CreditCard, Users, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const RevenueDashboard = ({ backendUrl }) => {
  const [overview, setOverview] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      
      // Fetch overview
      const overviewRes = await fetch(`${backendUrl}/api/admin/revenue/overview`);
      const overviewData = await overviewRes.json();
      setOverview(overviewData);
      
      // Fetch history
      const historyRes = await fetch(`${backendUrl}/api/admin/revenue/history?days=30`);
      const historyData = await historyRes.json();
      setHistory(historyData.history || []);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
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

  // Prepare pie chart data
  const pieData = overview?.revenue_by_plan ? Object.entries(overview.revenue_by_plan).map(([name, value]) => ({
    name,
    value
  })) : [];

  return (
    <div className="space-y-6">
      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8" />
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-3xl font-bold mb-1">${overview?.mrr?.toLocaleString() || 0}</div>
          <div className="text-purple-100 text-sm">Monthly Recurring Revenue</div>
          <div className="mt-2 text-sm">
            <span className="text-green-200">+{overview?.revenue_growth || 0}%</span> from last month
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8" />
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-3xl font-bold mb-1">${overview?.arr?.toLocaleString() || 0}</div>
          <div className="text-blue-100 text-sm">Annual Recurring Revenue</div>
          <div className="mt-2 text-sm text-blue-200">MRR × 12</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8" />
          </div>
          <div className="text-3xl font-bold mb-1">{overview?.active_subscriptions || 0}</div>
          <div className="text-green-100 text-sm">Active Subscriptions</div>
          <div className="mt-2 text-sm">
            <span className="text-green-200">+{overview?.new_this_month || 0}</span> new this month
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <CreditCard className="w-8 h-8" />
          </div>
          <div className="text-3xl font-bold mb-1">${overview?.total_revenue?.toLocaleString() || 0}</div>
          <div className="text-orange-100 text-sm">Total Revenue</div>
          <div className="mt-2 text-sm">
            <span className="text-red-200">{overview?.churned_this_month || 0} churned</span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(overview?.payment_failures > 0 || overview?.pending_invoices > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {overview?.payment_failures > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <div className="font-semibold text-red-900">{overview.payment_failures} Payment Failures</div>
                <div className="text-sm text-red-700">Requires attention</div>
              </div>
            </div>
          )}
          {overview?.pending_invoices > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="font-semibold text-yellow-900">{overview.pending_invoices} Pending Invoices</div>
                <div className="text-sm text-yellow-700">Awaiting payment</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold mb-4">Revenue Trend (30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} name="Revenue ($)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Plan */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold mb-4">Revenue by Plan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: $${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Subscription Growth */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold mb-4">Subscription Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="subscriptions" fill="#10b981" name="Active Subscriptions" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* New Users */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold mb-4">New Users (30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="new_users" stroke="#3b82f6" strokeWidth={2} name="New Users" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default RevenueDashboard;
