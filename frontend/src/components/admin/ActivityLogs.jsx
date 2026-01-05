import React, { useState, useEffect } from 'react';
import { Activity, Filter, Download, RefreshCw, Clock } from 'lucide-react';
import { Button } from '../ui/button';

const ActivityLogs = ({ backendUrl }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    user_id: ''
  });

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.action) params.append('action', filters.action);
      if (filters.user_id) params.append('user_id', filters.user_id);
      params.append('limit', '100');
      
      const response = await fetch(`${backendUrl}/api/admin/logs/activity?${params}`);
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Action', 'User ID', 'Details', 'Entity Type', 'Entity ID'].join(','),
      ...logs.map(log => [
        log.timestamp,
        log.action,
        log.user_id,
        log.details.replace(/,/g, ';'),
        log.entity_type,
        log.entity_id
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity_logs_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const getActionColor = (action) => {
    const colors = {
      'chatbot_created': 'bg-blue-100 text-blue-700',
      'source_added': 'bg-green-100 text-green-700',
      'conversation': 'bg-purple-100 text-purple-700',
      'user_created': 'bg-indigo-100 text-indigo-700',
      'default': 'bg-gray-100 text-gray-700'
    };
    return colors[action] || colors.default;
  };

  const getActionIcon = (action) => {
    // Return different icons based on action type
    return <Activity className="w-4 h-4" />;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Activity Logs</h2>
          <p className="text-gray-600 text-sm mt-1">Monitor all system activities and user actions</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={fetchLogs} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={exportLogs} className="bg-green-600 hover:bg-green-700">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="font-semibold">Filters</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action Type
            </label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({...filters, action: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Actions</option>
              <option value="chatbot_created">Chatbot Created</option>
              <option value="source_added">Source Added</option>
              <option value="conversation">Conversation</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User ID
            </label>
            <input
              type="text"
              value={filters.user_id}
              onChange={(e) => setFilters({...filters, user_id: e.target.value})}
              placeholder="Filter by user..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={() => setFilters({ action: '', user_id: '' })}
              variant="outline"
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Logs List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No activity logs found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActionColor(log.action)}`}>
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-900">{log.details}</div>
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                      <span>User: <span className="font-mono">{log.user_id}</span></span>
                      {log.entity_type && (
                        <span>Entity: <span className="font-mono">{log.entity_type}</span></span>
                      )}
                      {log.entity_id && (
                        <span>ID: <span className="font-mono">{log.entity_id.substring(0, 8)}...</span></span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 text-sm text-gray-600 text-center">
        Showing {logs.length} activity log(s)
      </div>
    </div>
  );
};

export default ActivityLogs;
