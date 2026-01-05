import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Download, Mail, Tag, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../ui/button';

const AdvancedUserSearch = ({ backendUrl }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0
  });

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    role: '',
    country: '',
    state: '',
    city: '',
    last_active_days: '',
    inactive_days: '',
    login_count_min: '',
    login_count_max: '',
    total_spent_min: '',
    total_spent_max: '',
    lifetime_value_min: '',
    current_plan: '',
    lifecycle_stage: '',
    churn_risk_min: '',
    churn_risk_max: '',
    onboarding_completed: '',
    tags: '',
    segments: '',
    created_after: '',
    created_before: '',
    chatbots_min: '',
    messages_min: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  useEffect(() => {
    searchUsers();
  }, [pagination.page, filters.sortBy, filters.sortOrder]);

  const searchUsers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', pagination.page);
      queryParams.append('limit', pagination.limit);
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await fetch(`${backendUrl}/api/admin/users-enhanced/advanced-search?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      role: '',
      country: '',
      state: '',
      city: '',
      last_active_days: '',
      inactive_days: '',
      login_count_min: '',
      login_count_max: '',
      total_spent_min: '',
      total_spent_max: '',
      lifetime_value_min: '',
      current_plan: '',
      lifecycle_stage: '',
      churn_risk_min: '',
      churn_risk_max: '',
      onboarding_completed: '',
      tags: '',
      segments: '',
      created_after: '',
      created_before: '',
      chatbots_min: '',
      messages_min: '',
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.user_id));
    }
  };

  const exportUsers = async (format) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('format', format);
      
      const activeFilters = {};
      Object.keys(filters).forEach(key => {
        if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined && key !== 'sortBy' && key !== 'sortOrder') {
          activeFilters[key] = filters[key];
        }
      });
      
      if (Object.keys(activeFilters).length > 0) {
        queryParams.append('filters', JSON.stringify(activeFilters));
      }

      const response = await fetch(`${backendUrl}/api/admin/users-enhanced/export/users?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        // Download the data
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-export-${new Date().toISOString()}.${format}`;
        a.click();
        alert(`Exported ${data.count} users successfully!`);
      }
    } catch (error) {
      console.error('Error exporting users:', error);
      alert('Failed to export users');
    }
  };

  const getLifecycleBadgeColor = (stage) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      engaged: 'bg-purple-100 text-purple-800',
      at_risk: 'bg-orange-100 text-orange-800',
      churned: 'bg-red-100 text-red-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  const getChurnRiskColor = (score) => {
    if (score >= 0.7) return 'text-red-600 font-bold';
    if (score >= 0.4) return 'text-orange-600 font-semibold';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced User Search</h2>
          <p className="text-gray-600">Search and filter users with 20+ criteria</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => exportUsers('json')} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
          <Button onClick={() => exportUsers('csv')} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or company..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>
          <Button onClick={searchUsers} disabled={loading}>
            <Search className="w-4 h-4 mr-2" />
            {loading ? 'Searching...' : 'Search'}
          </Button>
          <Button onClick={() => setShowFilters(!showFilters)} variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? 'Hide' : 'Show'} Filters
            {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Basic Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lifecycle Stage</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                value={filters.lifecycle_stage}
                onChange={(e) => handleFilterChange('lifecycle_stage', e.target.value)}
              >
                <option value="">All Stages</option>
                <option value="new">New</option>
                <option value="active">Active</option>
                <option value="engaged">Engaged</option>
                <option value="at_risk">At Risk</option>
                <option value="churned">Churned</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Plan</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                value={filters.current_plan}
                onChange={(e) => handleFilterChange('current_plan', e.target.value)}
              >
                <option value="">All Plans</option>
                <option value="Free Plan">Free Plan</option>
                <option value="Starter Plan">Starter Plan</option>
                <option value="Professional Plan">Professional Plan</option>
                <option value="Enterprise Plan">Enterprise Plan</option>
              </select>
            </div>

            {/* Location Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input
                type="text"
                placeholder="e.g., United States"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                value={filters.country}
                onChange={(e) => handleFilterChange('country', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                placeholder="e.g., California"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                value={filters.state}
                onChange={(e) => handleFilterChange('state', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                placeholder="e.g., San Francisco"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
              />
            </div>

            {/* Activity Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Active in Last N Days</label>
              <input
                type="number"
                placeholder="e.g., 30"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                value={filters.last_active_days}
                onChange={(e) => handleFilterChange('last_active_days', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inactive for N Days</label>
              <input
                type="number"
                placeholder="e.g., 30"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                value={filters.inactive_days}
                onChange={(e) => handleFilterChange('inactive_days', e.target.value)}
              />
            </div>

            {/* Financial Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Total Spent ($)</label>
              <input
                type="number"
                placeholder="e.g., 100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                value={filters.total_spent_min}
                onChange={(e) => handleFilterChange('total_spent_min', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Total Spent ($)</label>
              <input
                type="number"
                placeholder="e.g., 1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                value={filters.total_spent_max}
                onChange={(e) => handleFilterChange('total_spent_max', e.target.value)}
              />
            </div>

            {/* Churn Risk */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Churn Risk (0-1)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g., 0.7"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                value={filters.churn_risk_min}
                onChange={(e) => handleFilterChange('churn_risk_min', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                placeholder="e.g., vip,premium"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                value={filters.tags}
                onChange={(e) => handleFilterChange('tags', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Segments</label>
              <input
                type="text"
                placeholder="e.g., high-value"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                value={filters.segments}
                onChange={(e) => handleFilterChange('segments', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Chatbots</label>
              <input
                type="number"
                placeholder="e.g., 1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                value={filters.chatbots_min}
                onChange={(e) => handleFilterChange('chatbots_min', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Messages</label>
              <input
                type="number"
                placeholder="e.g., 100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                value={filters.messages_min}
                onChange={(e) => handleFilterChange('messages_min', e.target.value)}
              />
            </div>
          </div>
        )}

        {showFilters && (
          <div className="mt-4 flex gap-2">
            <Button onClick={clearFilters} variant="outline" size="sm">
              <X className="w-4 h-4 mr-2" />
              Clear All Filters
            </Button>
          </div>
        )}
      </div>

      {/* Results Stats */}
      {users.length > 0 && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm opacity-90">Total Found</p>
              <p className="text-3xl font-bold">{pagination.total}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Current Page</p>
              <p className="text-3xl font-bold">{pagination.page} / {pagination.total_pages}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Selected</p>
              <p className="text-3xl font-bold">{selectedUsers.length}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Showing</p>
              <p className="text-3xl font-bold">{users.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-900">{selectedUsers.length} users selected</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
              <Button size="sm" variant="outline">
                <Tag className="w-4 h-4 mr-2" />
                Add Tag
              </Button>
              <Button size="sm" variant="outline" onClick={() => setSelectedUsers([])}>
                Clear Selection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={selectAllUsers}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lifecycle</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Churn Risk</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spending</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    No users found. Try adjusting your filters.
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.user_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.user_id)}
                        onChange={() => toggleUserSelection(user.user_id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-purple-600 font-semibold text-sm">
                              {user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          {user.company && <p className="text-xs text-gray-400">{user.company}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLifecycleBadgeColor(user.lifecycle_stage)}`}>
                        {user.lifecycle_stage || 'new'}
                      </span>
                      {user.onboarding_completed && (
                        <span className="ml-2 text-xs text-green-600">✓ Onboarded</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={getChurnRiskColor(user.churn_risk_score)}>
                        {(user.churn_risk_score * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <p className="text-gray-900">{user.login_count || 0} logins</p>
                        <p className="text-gray-500">{user.statistics?.chatbots_count || 0} chatbots</p>
                        <p className="text-gray-500">{user.statistics?.messages_count || 0} messages</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <p className="text-gray-900">${user.total_spent?.toFixed(2) || '0.00'}</p>
                        <p className="text-gray-500">LTV: ${user.lifetime_value?.toFixed(2) || '0.00'}</p>
                        <p className="text-xs text-gray-400">{user.current_plan || 'Free Plan'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-500">
                        {user.city && <p>{user.city}</p>}
                        {user.state && <p>{user.state}</p>}
                        {user.country && <p>{user.country}</p>}
                        {!user.city && !user.state && !user.country && <p className="text-gray-400">-</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.tags?.map(tag => (
                          <span key={tag} className="inline-flex px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-700">
                            {tag}
                          </span>
                        ))}
                        {user.segments?.map(segment => (
                          <span key={segment} className="inline-flex px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-700">
                            {segment}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing page {pagination.page} of {pagination.total_pages}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={!pagination.has_prev}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!pagination.has_next}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedUserSearch;
