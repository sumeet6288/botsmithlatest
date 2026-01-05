import React, { useState, useEffect } from 'react';
import { 
  Users, Edit, Trash2, Search, UserPlus, Ban, CheckCircle, Activity, Eye, 
  Download, Mail, Filter, Tag, Clock, DollarSign, TrendingUp, Settings,
  MessageSquare, FileText, Shield, AlertCircle, BarChart3, Calendar,
  UserCheck, UserX, PhoneCall, MapPin, Hash, RefreshCw, Archive,
  Star, Award, Target, Zap, Key, Save, X
} from 'lucide-react';
import { Button } from '../ui/button';

const EnhancedUsersManagement = ({ backendUrl }) => {
  // State Management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  
  // Auto-refresh States
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshInterval, setRefreshInterval] = useState(3000); // 3 seconds
  const [dataChanged, setDataChanged] = useState(false);
  const [previousUserCount, setPreviousUserCount] = useState(0);
  
  // Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showLoginHistoryModal, setShowLoginHistoryModal] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  
  // Data States
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [userActivity, setUserActivity] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);
  const [newPassword, setNewPassword] = useState('');
  const [bulkOperation, setBulkOperation] = useState('');
  const [bulkRole, setBulkRole] = useState('user');
  const [bulkStatus, setBulkStatus] = useState('active');

  // Fetch users on filter/sort change
  useEffect(() => {
    fetchUsers();
  }, [sortBy, sortOrder, filterStatus, filterRole]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchUsers(true); // Silent refresh (no loading state)
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, sortBy, sortOrder, filterStatus, filterRole]);

  const fetchUsers = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const params = new URLSearchParams({
        sortBy,
        sortOrder
      });
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterRole !== 'all') params.append('role', filterRole);
      
      const response = await fetch(`${backendUrl}/api/admin/users/enhanced?${params}`);
      const data = await response.json();
      
      // Check if data changed
      const newUsers = data.users || [];
      if (silent && previousUserCount > 0 && newUsers.length !== previousUserCount) {
        setDataChanged(true);
        setTimeout(() => setDataChanged(false), 2000);
      }
      
      setPreviousUserCount(newUsers.length);
      setUsers(newUsers);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchUserActivity = async (userId) => {
    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${userId}/activity`);
      const data = await response.json();
      setUserActivity(data.activities || []);
    } catch (error) {
      console.error('Error fetching user activity:', error);
    }
  };

  const fetchUserStats = async (userId) => {
    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${userId}/stats`);
      const data = await response.json();
      setUserStats(data.stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchLoginHistory = async (userId) => {
    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${userId}/login-history`);
      const data = await response.json();
      setLoginHistory(data.logins || []);
    } catch (error) {
      console.error('Error fetching login history:', error);
    }
  };

  // User Actions
  const handleEditUser = (user) => {
    setEditingUser({...user});
    setShowEditModal(true);
  };

  const handleViewActivity = async (user) => {
    setViewingUser(user);
    await fetchUserActivity(user.user_id);
    setShowActivityModal(true);
  };

  const handleViewStats = async (user) => {
    setViewingUser(user);
    await fetchUserStats(user.user_id);
    setShowStatsModal(true);
  };

  const handleViewLoginHistory = async (user) => {
    setViewingUser(user);
    await fetchLoginHistory(user.user_id);
    setShowLoginHistoryModal(true);
  };

  const handlePasswordReset = (user) => {
    setViewingUser(user);
    setNewPassword('');
    setShowPasswordResetModal(true);
  };

  const saveUser = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${editingUser.user_id}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
          status: editingUser.status,
          phone: editingUser.phone,
          address: editingUser.address,
          bio: editingUser.bio,
          company: editingUser.company,
          job_title: editingUser.job_title,
          custom_max_chatbots: editingUser.custom_max_chatbots,
          custom_max_messages: editingUser.custom_max_messages,
          custom_max_file_uploads: editingUser.custom_max_file_uploads,
          suspension_reason: editingUser.suspension_reason,
          admin_notes: editingUser.admin_notes
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('User updated successfully');
        fetchUsers();
        setShowEditModal(false);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure? This will delete all user data including chatbots and conversations.')) {
      return;
    }
    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        alert('User deleted successfully');
        fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const resetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${viewingUser.user_id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_password: newPassword })
      });
      const data = await response.json();
      if (data.success) {
        alert('Password reset successfully');
        setShowPasswordResetModal(false);
        setNewPassword('');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Failed to reset password');
    }
  };

  // Bulk Actions
  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.user_id));
    }
  };

  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const executeBulkOperation = async () => {
    if (selectedUsers.length === 0) {
      alert('Please select users first');
      return;
    }

    if (!window.confirm(`Apply ${bulkOperation} to ${selectedUsers.length} user(s)?`)) {
      return;
    }

    try {
      const payload = {
        user_ids: selectedUsers,
        operation: bulkOperation
      };

      if (bulkOperation === 'change_role') {
        payload.role = bulkRole;
      } else if (bulkOperation === 'change_status') {
        payload.status = bulkStatus;
      }

      const response = await fetch(`${backendUrl}/api/admin/users/bulk-operation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      
      if (data.success) {
        if (bulkOperation === 'export') {
          // Handle export
          const csvData = data.users.map(user => ({
            'User ID': user.id,
            'Email': user.email,
            'Name': user.name,
            'Role': user.role,
            'Status': user.status,
            'Created': user.created_at,
            'Last Login': user.last_login || 'Never'
          }));

          const csv = [
            Object.keys(csvData[0]).join(','),
            ...csvData.map(row => Object.values(row).map(v => `"${v}"`).join(','))
          ].join('\n');

          const blob = new Blob([csv], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `users-export-${new Date().toISOString()}.csv`;
          a.click();
        } else {
          alert(`${bulkOperation} applied to ${data.processed} user(s)`);
        }
        setSelectedUsers([]);
        setShowBulkActionModal(false);
        fetchUsers();
      }
    } catch (error) {
      console.error('Error performing bulk operation:', error);
      alert('Failed to perform bulk operation');
    }
  };

  // Filtering
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-yellow-100 text-yellow-800',
      banned: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.active}`}>
        {status}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-800',
      moderator: 'bg-blue-100 text-blue-800',
      user: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[role] || styles.user}`}>
        {role}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Data Change Notification */}
      {dataChanged && (
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>Data updated!</span>
        </div>
      )}
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            User Management
          </h2>
          <p className="text-gray-600 mt-1">Manage users, roles, permissions, and activity</p>
          {/* Last Updated Indicator */}
          <div className="flex items-center gap-2 mt-2">
            <div className={`flex items-center gap-1 text-xs ${autoRefresh ? 'text-green-600' : 'text-gray-500'}`}>
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span>
                {autoRefresh ? 'Live Updates' : 'Auto-refresh Off'}
              </span>
            </div>
            <span className="text-xs text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? "default" : "outline"}
            className={autoRefresh ? "bg-green-600 hover:bg-green-700" : ""}
          >
            <Zap className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-pulse' : ''}`} />
            {autoRefresh ? 'Live' : 'Manual'}
          </Button>
          <Button
            onClick={() => setShowBulkActionModal(true)}
            disabled={selectedUsers.length === 0}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Settings className="w-4 h-4 mr-2" />
            Bulk Actions ({selectedUsers.length})
          </Button>
          <Button
            onClick={() => fetchUsers()}
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="created_at-desc">Newest First</option>
            <option value="created_at-asc">Oldest First</option>
            <option value="last_login-desc">Recently Active</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Usage</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Last Login</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentUsers.map((user) => (
                    <tr key={user.user_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.user_id)}
                          onChange={() => handleSelectUser(user.user_id)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.name} className="w-10 h-10 rounded-full" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                              {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{user.name || 'No Name'}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-purple-600" />
                            <span>{user.statistics?.chatbots_count || 0} bots</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-500">
                            <BarChart3 className="w-4 h-4" />
                            <span>{user.statistics?.messages_count || 0} msgs</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-gray-900">{formatDate(user.last_login)}</div>
                          <div className="text-gray-500">{user.login_count || 0} logins</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit User"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleViewStats(user)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="View Stats"
                          >
                            <BarChart3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleViewActivity(user)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="View Activity"
                          >
                            <Activity className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleViewLoginHistory(user)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Login History"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePasswordReset(user)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Reset Password"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteUser(user.user_id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded ${
                          currentPage === page
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <Button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold">Edit User</h3>
            </div>
            <div className="p-6 space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editingUser.name || ''}
                    onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editingUser.email || ''}
                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Role & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={editingUser.role || 'user'}
                    onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editingUser.status || 'active'}
                    onChange={(e) => setEditingUser({...editingUser, status: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="banned">Banned</option>
                  </select>
                </div>
              </div>

              {/* Profile Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editingUser.phone || ''}
                    onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    value={editingUser.company || ''}
                    onChange={(e) => setEditingUser({...editingUser, company: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input
                  type="text"
                  value={editingUser.job_title || ''}
                  onChange={(e) => setEditingUser({...editingUser, job_title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={editingUser.address || ''}
                  onChange={(e) => setEditingUser({...editingUser, address: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Custom Limits */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Custom Usage Limits (Optional)</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Chatbots</label>
                    <input
                      type="number"
                      value={editingUser.custom_max_chatbots || ''}
                      onChange={(e) => setEditingUser({...editingUser, custom_max_chatbots: parseInt(e.target.value) || null})}
                      placeholder="Inherit from plan"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Messages</label>
                    <input
                      type="number"
                      value={editingUser.custom_max_messages || ''}
                      onChange={(e) => setEditingUser({...editingUser, custom_max_messages: parseInt(e.target.value) || null})}
                      placeholder="Inherit from plan"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Files</label>
                    <input
                      type="number"
                      value={editingUser.custom_max_file_uploads || ''}
                      onChange={(e) => setEditingUser({...editingUser, custom_max_file_uploads: parseInt(e.target.value) || null})}
                      placeholder="Inherit from plan"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                <textarea
                  value={editingUser.admin_notes || ''}
                  onChange={(e) => setEditingUser({...editingUser, admin_notes: e.target.value})}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Internal notes about this user..."
                />
              </div>

              {editingUser.status === 'suspended' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Suspension Reason</label>
                  <textarea
                    value={editingUser.suspension_reason || ''}
                    onChange={(e) => setEditingUser({...editingUser, suspension_reason: e.target.value})}
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Reason for suspension..."
                  />
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button
                onClick={() => setShowEditModal(false)}
                variant="outline"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={saveUser}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {showStatsModal && userStats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold">User Statistics - {viewingUser?.name}</h3>
            </div>
            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Email</div>
                  <div className="font-semibold">{userStats.user_info.email}</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Role</div>
                  <div className="font-semibold">{userStats.user_info.role}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Status</div>
                  <div className="font-semibold">{userStats.user_info.status}</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Login Count</div>
                  <div className="font-semibold">{userStats.user_info.login_count}</div>
                </div>
              </div>

              {/* Usage Stats */}
              <div>
                <h4 className="font-semibold mb-3">Usage Statistics</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <MessageSquare className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{userStats.usage.total_chatbots}</div>
                    <div className="text-sm text-gray-600">Chatbots</div>
                    <div className="text-xs text-green-600 mt-1">{userStats.usage.active_chatbots} active</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{userStats.usage.total_messages}</div>
                    <div className="text-sm text-gray-600">Messages</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <Activity className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{userStats.usage.total_conversations}</div>
                    <div className="text-sm text-gray-600">Conversations</div>
                  </div>
                </div>
              </div>

              {/* Activity Stats */}
              <div>
                <h4 className="font-semibold mb-3">Recent Activity</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Activities (30 days)</div>
                    <div className="text-xl font-bold">{userStats.activity.recent_activities_30d}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Messages (7 days)</div>
                    <div className="text-xl font-bold">{userStats.activity.recent_messages_7d}</div>
                  </div>
                </div>
              </div>

              {/* Custom Limits */}
              {(userStats.limits.custom_max_chatbots || userStats.limits.custom_max_messages || userStats.limits.custom_max_file_uploads) && (
                <div>
                  <h4 className="font-semibold mb-3">Custom Limits</h4>
                  <div className="bg-yellow-50 p-4 rounded-lg space-y-2">
                    {userStats.limits.custom_max_chatbots && (
                      <div>Max Chatbots: {userStats.limits.custom_max_chatbots}</div>
                    )}
                    {userStats.limits.custom_max_messages && (
                      <div>Max Messages: {userStats.limits.custom_max_messages}</div>
                    )}
                    {userStats.limits.custom_max_file_uploads && (
                      <div>Max File Uploads: {userStats.limits.custom_max_file_uploads}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <Button onClick={() => setShowStatsModal(false)} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold">Activity Log - {viewingUser?.name}</h3>
            </div>
            <div className="p-6">
              {userActivity.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No activity recorded yet
                </div>
              ) : (
                <div className="space-y-4">
                  {userActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <Activity className="w-5 h-5 text-purple-600 mt-1" />
                      <div className="flex-1">
                        <div className="font-semibold">{activity.action}</div>
                        {activity.details && (
                          <div className="text-sm text-gray-600 mt-1">{activity.details}</div>
                        )}
                        {activity.resource_type && (
                          <div className="text-xs text-gray-500 mt-1">
                            {activity.resource_type} {activity.resource_id}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-2">
                          {formatDate(activity.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <Button onClick={() => setShowActivityModal(false)} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Login History Modal */}
      {showLoginHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold">Login History - {viewingUser?.name}</h3>
            </div>
            <div className="p-6">
              {loginHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No login history available
                </div>
              ) : (
                <div className="space-y-4">
                  {loginHistory.map((login) => (
                    <div key={login.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <Clock className="w-5 h-5 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold">{formatDate(login.timestamp)}</div>
                          {login.success ? (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Success</span>
                          ) : (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Failed</span>
                          )}
                        </div>
                        {login.ip_address && (
                          <div className="text-sm text-gray-600 mt-1">IP: {login.ip_address}</div>
                        )}
                        {login.user_agent && (
                          <div className="text-xs text-gray-500 mt-1">{login.user_agent}</div>
                        )}
                        {login.location && (
                          <div className="text-xs text-gray-500 mt-1">Location: {login.location}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <Button onClick={() => setShowLoginHistoryModal(false)} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold">Reset Password - {viewingUser?.name}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-sm text-yellow-800">
                <AlertCircle className="w-4 h-4 inline mr-2" />
                This will immediately change the user's password. The user will need to use the new password to log in.
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button
                onClick={() => setShowPasswordResetModal(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={resetPassword}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Key className="w-4 h-4 mr-2" />
                Reset Password
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Modal */}
      {showBulkActionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold">Bulk Actions</h3>
              <p className="text-sm text-gray-600 mt-1">{selectedUsers.length} users selected</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Action</label>
                <select
                  value={bulkOperation}
                  onChange={(e) => setBulkOperation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Choose an action...</option>
                  <option value="change_role">Change Role</option>
                  <option value="change_status">Change Status</option>
                  <option value="delete">Delete Users</option>
                  <option value="export">Export Data</option>
                </select>
              </div>

              {bulkOperation === 'change_role' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Role</label>
                  <select
                    value={bulkRole}
                    onChange={(e) => setBulkRole(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              )}

              {bulkOperation === 'change_status' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                  <select
                    value={bulkStatus}
                    onChange={(e) => setBulkStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="banned">Banned</option>
                  </select>
                </div>
              )}

              {bulkOperation === 'delete' && (
                <div className="bg-red-50 p-4 rounded-lg text-sm text-red-800">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  Warning: This will permanently delete {selectedUsers.length} users and all their data!
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button
                onClick={() => setShowBulkActionModal(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={executeBulkOperation}
                disabled={!bulkOperation}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Execute
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedUsersManagement;
