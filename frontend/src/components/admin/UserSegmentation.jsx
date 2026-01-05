import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Eye, Target, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';

const UserSegmentation = ({ backendUrl }) => {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [segmentUsers, setSegmentUsers] = useState([]);

  const [newSegment, setNewSegment] = useState({
    name: '',
    description: '',
    filters: {}
  });

  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/admin/users-enhanced/segments`);
      const data = await response.json();
      if (data.success) {
        setSegments(data.segments);
      }
    } catch (error) {
      console.error('Error fetching segments:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSegment = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/admin/users-enhanced/segments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSegment)
      });
      const data = await response.json();
      
      if (data.success) {
        alert(`Segment created with ${data.user_count} users!`);
        setShowCreateModal(false);
        setNewSegment({ name: '', description: '', filters: {} });
        fetchSegments();
      }
    } catch (error) {
      console.error('Error creating segment:', error);
      alert('Failed to create segment');
    }
  };

  const deleteSegment = async (segmentId) => {
    if (!window.confirm('Are you sure you want to delete this segment?')) return;

    try {
      const response = await fetch(`${backendUrl}/api/admin/users-enhanced/segments/${segmentId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        alert('Segment deleted successfully');
        fetchSegments();
      }
    } catch (error) {
      console.error('Error deleting segment:', error);
      alert('Failed to delete segment');
    }
  };

  const viewSegmentUsers = async (segment) => {
    setSelectedSegment(segment);
    setShowViewModal(true);
    
    try {
      const response = await fetch(`${backendUrl}/api/admin/users-enhanced/segments/${segment.id}/users`);
      const data = await response.json();
      
      if (data.success) {
        setSegmentUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching segment users:', error);
    }
  };

  const predefinedSegments = [
    {
      name: 'High-Value Customers',
      description: 'Users who have spent over $500',
      filters: { total_spent_min: 500 }
    },
    {
      name: 'At-Risk Users',
      description: 'Users with churn risk > 70%',
      filters: { churn_risk_min: 0.7 }
    },
    {
      name: 'New Users',
      description: 'Users created in the last 7 days',
      filters: { lifecycle_stage: 'new' }
    },
    {
      name: 'Engaged Users',
      description: 'Active users with 10+ chatbots',
      filters: { lifecycle_stage: 'engaged', chatbots_min: 10 }
    },
    {
      name: 'Inactive Users',
      description: 'Users inactive for 30+ days',
      filters: { inactive_days: 30 }
    }
  ];

  const usePredefine = (predefined) => {
    setNewSegment({
      name: predefined.name,
      description: predefined.description,
      filters: predefined.filters
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Segmentation</h2>
          <p className="text-gray-600">Create and manage custom user segments</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Segment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
          <Target className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-3xl font-bold">{segments.length}</p>
          <p className="text-sm opacity-90">Total Segments</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6">
          <Users className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-3xl font-bold">
            {segments.reduce((sum, s) => sum + (s.user_count || 0), 0)}
          </p>
          <p className="text-sm opacity-90">Total Users in Segments</p>
        </div>
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-xl p-6">
          <TrendingUp className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-3xl font-bold">
            {segments.length > 0 ? Math.round(segments.reduce((sum, s) => sum + (s.user_count || 0), 0) / segments.length) : 0}
          </p>
          <p className="text-sm opacity-90">Avg Users per Segment</p>
        </div>
      </div>

      {/* Segments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-gray-500">
            Loading segments...
          </div>
        ) : segments.length === 0 ? (
          <div className="col-span-3 text-center py-12">
            <Target className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">No segments created yet</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Segment
            </Button>
          </div>
        ) : (
          segments.map(segment => (
            <div key={segment.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{segment.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{segment.description}</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  <span className="font-semibold text-2xl text-gray-900">{segment.user_count || 0}</span>
                  <span>users</span>
                </div>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-700 mb-2">Filters:</p>
                <div className="space-y-1">
                  {Object.entries(segment.filters).map(([key, value]) => (
                    <div key={key} className="text-xs text-gray-600 flex gap-2">
                      <span className="font-medium">{key}:</span>
                      <span>{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => viewSegmentUsers(segment)} className="flex-1">
                  <Eye className="w-4 h-4 mr-2" />
                  View Users
                </Button>
                <Button size="sm" variant="outline" onClick={() => deleteSegment(segment.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Segment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold">Create New Segment</h3>
              <p className="text-sm text-gray-600 mt-1">Define a custom user segment with filters</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Segment Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., High-Value Customers"
                  value={newSegment.name}
                  onChange={(e) => setNewSegment({ ...newSegment, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows="2"
                  placeholder="Describe this segment..."
                  value={newSegment.description}
                  onChange={(e) => setNewSegment({ ...newSegment, description: e.target.value })}
                />
              </div>

              {/* Predefined Templates */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quick Templates</label>
                <div className="grid grid-cols-2 gap-2">
                  {predefinedSegments.map((predefined, idx) => (
                    <button
                      key={idx}
                      onClick={() => usePredefine(predefined)}
                      className="text-left p-3 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
                    >
                      <p className="font-medium text-sm text-gray-900">{predefined.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{predefined.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filters (JSON)</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                  rows="6"
                  placeholder='{"lifecycle_stage": "engaged", "total_spent_min": 100}'
                  value={JSON.stringify(newSegment.filters, null, 2)}
                  onChange={(e) => {
                    try {
                      setNewSegment({ ...newSegment, filters: JSON.parse(e.target.value) });
                    } catch (err) {
                      // Invalid JSON, ignore
                    }
                  }}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Available filter keys: status, role, lifecycle_stage, churn_risk_min, total_spent_min, inactive_days, etc.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={createSegment}
                disabled={!newSegment.name || Object.keys(newSegment.filters).length === 0}
              >
                Create Segment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Users Modal */}
      {showViewModal && selectedSegment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold">{selectedSegment.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{segmentUsers.length} users in this segment</p>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                {segmentUsers.map(user => (
                  <div key={user.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <span className="text-purple-600 font-semibold">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{user.role || 'user'}</p>
                      <p className="text-xs text-gray-500">{user.status || 'active'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <Button variant="outline" onClick={() => setShowViewModal(false)} className="w-full">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSegmentation;
