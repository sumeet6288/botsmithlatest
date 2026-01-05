import React, { useState, useEffect } from 'react';
import { Activity, Cpu, Database, HardDrive, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';

const SystemMonitoring = ({ backendUrl }) => {
  const [health, setHealth] = useState(null);
  const [activity, setActivity] = useState(null);
  const [dbStats, setDbStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchAllData();
    
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchAllData, 10000); // Refresh every 10 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch system health
      const healthRes = await fetch(`${backendUrl}/api/admin/system/health`);
      const healthData = await healthRes.json();
      setHealth(healthData);
      
      // Fetch activity
      const activityRes = await fetch(`${backendUrl}/api/admin/system/activity`);
      const activityData = await activityRes.json();
      setActivity(activityData);
      
      // Fetch database stats
      const dbRes = await fetch(`${backendUrl}/api/admin/database/stats`);
      const dbData = await dbRes.json();
      setDbStats(dbData);
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (value, thresholds = { good: 60, warning: 80 }) => {
    if (value < thresholds.good) return 'bg-green-500';
    if (value < thresholds.warning) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">System Monitoring</h2>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              Auto-refresh (10s)
            </label>
            <Button size="sm" onClick={fetchAllData} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Cpu className="w-6 h-6 text-purple-600" />
          System Health
        </h3>
        
        {health ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* CPU Usage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">CPU Usage</span>
                <span className="text-2xl font-bold">{health.system?.cpu_usage?.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${getStatusColor(health.system?.cpu_usage, { good: 60, warning: 85 })}`}
                  style={{ width: `${Math.min(health.system?.cpu_usage || 0, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {health.system?.cpu_usage < 60 ? '✓ Normal' : health.system?.cpu_usage < 85 ? '⚠ Elevated' : '⚠ High'}
              </p>
            </div>

            {/* Memory Usage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Memory Usage</span>
                <span className="text-2xl font-bold">{health.system?.memory_usage?.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${getStatusColor(health.system?.memory_usage, { good: 70, warning: 90 })}`}
                  style={{ width: `${Math.min(health.system?.memory_usage || 0, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {(health.system?.memory_available_mb / 1024)?.toFixed(1)} GB available
              </p>
            </div>

            {/* Disk Usage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Disk Usage</span>
                <span className="text-2xl font-bold">{health.system?.disk_usage?.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${getStatusColor(health.system?.disk_usage, { good: 70, warning: 85 })}`}
                  style={{ width: `${Math.min(health.system?.disk_usage || 0, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {health.system?.disk_free_gb?.toFixed(1)} GB free
              </p>
            </div>

            {/* Status */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Status</span>
                <span className={`px-4 py-2 rounded-lg font-bold ${
                  health.status === 'healthy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {health.status?.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Last updated: {new Date(health.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">Loading...</div>
        )}
      </div>

      {/* Real-time Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Activity className="w-6 h-6 text-orange-600" />
          Real-time Activity (Last Hour)
        </h3>
        
        {activity ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{activity.last_hour?.conversations || 0}</div>
                <div className="text-sm text-gray-600">New Conversations</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{activity.last_hour?.messages || 0}</div>
                <div className="text-sm text-gray-600">Messages Sent</div>
              </div>
            </div>

            {/* Recent Activity Log */}
            <div>
              <h4 className="font-semibold mb-3">Recent Activity</h4>
              <div className="space-y-2">
                {activity.recent_activity?.length > 0 ? (
                  activity.recent_activity.map((act, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <span className="font-medium">{act.user}</span>
                        <span className="text-gray-600"> started a conversation</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(act.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">Loading...</div>
        )}
      </div>

      {/* Database Statistics */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Database className="w-6 h-6 text-indigo-600" />
          Database Statistics
        </h3>
        
        {dbStats ? (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{dbStats.counts?.chatbots || 0}</div>
                <div className="text-xs text-gray-600">Chatbots</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{dbStats.counts?.sources || 0}</div>
                <div className="text-xs text-gray-600">Sources</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{dbStats.counts?.conversations || 0}</div>
                <div className="text-xs text-gray-600">Conversations</div>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">{dbStats.counts?.messages || 0}</div>
                <div className="text-xs text-gray-600">Messages</div>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-indigo-600">{dbStats.total_documents || 0}</div>
                <div className="text-xs text-gray-600">Total Documents</div>
              </div>
            </div>

            {/* Collection Details */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-4 font-semibold text-gray-700">Collection</th>
                    <th className="text-left py-2 px-4 font-semibold text-gray-700">Documents</th>
                    <th className="text-left py-2 px-4 font-semibold text-gray-700">Size (bytes)</th>
                    <th className="text-left py-2 px-4 font-semibold text-gray-700">Avg Doc Size</th>
                  </tr>
                </thead>
                <tbody>
                  {dbStats.collections?.map((coll) => (
                    <tr key={coll.name} className="border-b border-gray-100">
                      <td className="py-2 px-4 font-medium">{coll.name}</td>
                      <td className="py-2 px-4">{coll.count?.toLocaleString()}</td>
                      <td className="py-2 px-4">{coll.size?.toLocaleString()}</td>
                      <td className="py-2 px-4">{coll.avgObjSize?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">Loading...</div>
        )}
      </div>
    </div>
  );
};

export default SystemMonitoring;
