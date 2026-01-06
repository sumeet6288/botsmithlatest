import React, { useState, useEffect } from 'react';
import { 
  Users, Edit, Trash2, Search, UserPlus, Ban, CheckCircle, Activity, Eye, 
  Download, Mail, Filter, Tag, Clock, DollarSign, TrendingUp, Settings,
  MessageSquare, FileText, Shield, AlertCircle, BarChart3, Calendar,
  UserCheck, UserX, PhoneCall, MapPin, Hash, RefreshCw, Archive,
  Star, Award, Target, Zap, Key, Save, X, Copy, FileDown, FileUp,
  Lock, Unlock, AlertTriangle, CheckCircle2, Send, UserCog, MoreVertical,
  Bell, ShieldAlert, ShieldCheck, Database, TrendingDown, PieChart, LogIn, CreditCard
} from 'lucide-react';
import { Button } from '../ui/button';
import UltimateEditUserModal from './UltimateEditUserModal';
import ManageSubscriptionModal from './ManageSubscriptionModal';

const AdvancedUsersManagement = ({ backendUrl }) => {
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
  const [statistics, setStatistics] = useState(null);
  
  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUltimateEditModal, setShowUltimateEditModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showLoginHistoryModal, setShowLoginHistoryModal] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showAdvancedSearchModal, setShowAdvancedSearchModal] = useState(false);
  const [showStatisticsModal, setShowStatisticsModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  
  // Data States
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [userActivity, setUserActivity] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);
  const [newPassword, setNewPassword] = useState('');
  const [bulkOperation, setBulkOperation] = useState('');
  
  // Create User Form State
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active',
    plan_id: 'free',
    phone: '',
    company: '',
    job_title: '',
    address: '',
    bio: '',
    avatar_url: '',
    tags: '',
    admin_notes: ''
  });
  
  // Suspend/Ban Form State
  const [suspendForm, setSuspendForm] = useState({
    reason: '',
    duration_days: ''
  });
  
  const [banForm, setBanForm] = useState({
    reason: ''
  });
  
  // Notification Form State
  const [notificationForm, setNotificationForm] = useState({
    subject: '',
    message: ''
  });
  
  // Advanced Search State
  const [advancedSearch, setAdvancedSearch] = useState({
    email: '',
    name: '',
    role: '',
    status: '',
    company: '',
    tag: '',
    created_after: '',
    created_before: '',
    has_chatbots: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchStatistics();
  }, [sortBy, sortOrder, filterStatus, filterRole]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdownId && !event.target.closest('.dropdown-container')) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openDropdownId]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        sortBy,
        sortOrder
      });
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterRole !== 'all') params.append('role', filterRole);
      
      const response = await fetch(`${backendUrl}/api/admin/users/enhanced?${params}`);
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/admin/users/statistics/overview`);
      const data = await response.json();
      if (data.success) {
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const userData = {
        ...createForm,
        tags: createForm.tags ? createForm.tags.split(',').map(t => t.trim()) : []
      };
      
      const response = await fetch(`${backendUrl}/api/admin/users/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`User created successfully with ${createForm.plan_id.toUpperCase()} plan!`);
        setShowCreateModal(false);
        setCreateForm({
          name: '', email: '', password: '', role: 'user', status: 'active', plan_id: 'free',
          phone: '', company: '', job_title: '', address: '', bio: '', avatar_url: '',
          tags: '', admin_notes: ''
        });
        fetchUsers();
        fetchStatistics();
      } else {
        alert(data.detail || 'Failed to create user');
      }
    } catch (error) {
      alert('Error creating user');
      console.error(error);
    }
  };

  const handleSuspendUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${viewingUser.user_id}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: suspendForm.reason,
          duration_days: suspendForm.duration_days ? parseInt(suspendForm.duration_days) : null
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        setShowSuspendModal(false);
        setSuspendForm({ reason: '', duration_days: '' });
        fetchUsers();
        fetchStatistics();
      }
    } catch (error) {
      alert('Error suspending user');
      console.error(error);
    }
  };

  const handleUnsuspendUser = async (userId) => {
    if (!window.confirm('Remove suspension from this user?')) return;
    
    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${userId}/unsuspend`, {
        method: 'POST'
      });
      
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        fetchUsers();
        fetchStatistics();
      }
    } catch (error) {
      alert('Error removing suspension');
      console.error(error);
    }
  };

  const handleBanUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${viewingUser.user_id}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: banForm.reason })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        setShowBanModal(false);
        setBanForm({ reason: '' });
        fetchUsers();
        fetchStatistics();
      }
    } catch (error) {
      alert('Error banning user');
      console.error(error);
    }
  };

  const handleUnbanUser = async (userId) => {
    if (!window.confirm('Remove ban from this user?')) return;
    
    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${userId}/unban`, {
        method: 'POST'
      });
      
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        fetchUsers();
        fetchStatistics();
      }
    } catch (error) {
      alert('Error removing ban');
      console.error(error);
    }
  };

  const handleDirectLogin = async (userId) => {
    try {
      // Generate direct login token
      const response = await fetch(`${backendUrl}/api/admin/direct-login/generate-token/${userId}`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success && data.token) {
        // Build the full URL with token
        const loginUrl = `${window.location.origin}/direct-login?token=${data.token}`;
        
        // Open in new tab
        window.open(loginUrl, '_blank');
        
        alert(`Direct login link created for ${data.user_email}!\n\nOpening in new tab...`);
      } else {
        alert('Failed to generate login link');
      }
    } catch (error) {
      console.error('Error generating direct login:', error);
      alert('Error: Unable to generate direct login link');
    }
  };

  const handleVerifyEmail = async (userId) => {
    if (!window.confirm('Manually verify this user\'s email?')) return;
    
    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${userId}/verify-email`, {
        method: 'POST'
      });
      
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        fetchUsers();
      }
    } catch (error) {
      alert('Error verifying email');
      console.error(error);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${viewingUser.user_id}/send-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationForm)
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Notification sent successfully!');
        setShowNotificationModal(false);
        setNotificationForm({ subject: '', message: '' });
      }
    } catch (error) {
      alert('Error sending notification');
      console.error(error);
    }
  };

  const handleExportUserData = async (userId) => {
    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${userId}/export-data`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user_${userId}_data.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Error exporting user data');
      console.error(error);
    }
  };

  const handleExportAllUsers = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/admin/users/export/all`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `all_users_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Error exporting users');
      console.error(error);
    }
  };

  const handleAdvancedSearch = async (e) => {
    e.preventDefault();
    try {
      const params = new URLSearchParams();
      Object.keys(advancedSearch).forEach(key => {
        if (advancedSearch[key]) {
          params.append(key, advancedSearch[key]);
        }
      });
      
      const response = await fetch(`${backendUrl}/api/admin/users/search/advanced?${params}`);
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
        setShowAdvancedSearchModal(false);
        alert(`Found ${data.total} users`);
      }
    } catch (error) {
      alert('Error performing advanced search');
      console.error(error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user and ALL associated data? This cannot be undone!')) return;
    
    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        alert(`Failed to delete user: ${errorData.detail || 'Unknown error'}`);
        return;
      }
      
      const data = await response.json();
      if (data.success) {
        alert('User deleted successfully');
        // Refresh the user list and statistics
        await fetchUsers();
        await fetchStatistics();
      } else {
        alert(`Failed to delete user: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`Error deleting user: ${error.message}`);
      console.error('Delete user error:', error);
    }
  };

  const handleDuplicateUser = async (userId) => {
    const newEmail = window.prompt('Enter new email for duplicated user:');
    if (!newEmail) return;
    
    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${userId}/duplicate?new_email=${encodeURIComponent(newEmail)}`, {
        method: 'POST'
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`User duplicated successfully! New user ID: ${data.new_user_id}`);
        fetchUsers();
      } else {
        alert(data.detail || 'Failed to duplicate user');
      }
    } catch (error) {
      alert('Error duplicating user');
      console.error(error);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.company?.toLowerCase().includes(searchLower) ||
      user.user_id?.toLowerCase().includes(searchLower)
    );
  });

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-yellow-100 text-yellow-800',
      banned: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      moderator: 'bg-blue-100 text-blue-800',
      user: 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header with Statistics */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Advanced User Management
          </h1>
          <p className="text-gray-600 mt-1">Complete control over all users</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              fetchStatistics();
              setShowStatisticsModal(true);
            }}
            variant="outline"
            className="flex items-center gap-2"
          >
            <PieChart className="w-4 h-4" />
            Statistics
          </Button>
          <Button
            onClick={() => setShowAdvancedSearchModal(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Advanced Search
          </Button>
          <Button
            onClick={handleExportAllUsers}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FileDown className="w-4 h-4" />
            Export All
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Create User
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Users</p>
                <p className="text-3xl font-bold mt-1">{statistics.total_users}</p>
                <p className="text-purple-100 text-xs mt-2">+{statistics.activity.new_this_week} this week</p>
              </div>
              <Users className="w-12 h-12 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Active Users</p>
                <p className="text-3xl font-bold mt-1">{statistics.by_status.active}</p>
                <p className="text-green-100 text-xs mt-2">{statistics.activity.active_today} online today</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Chatbots</p>
                <p className="text-3xl font-bold mt-1">{statistics.total_chatbots}</p>
                <p className="text-blue-100 text-xs mt-2">Across all users</p>
              </div>
              <MessageSquare className="w-12 h-12 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Issues</p>
                <p className="text-3xl font-bold mt-1">{statistics.by_status.suspended + statistics.by_status.banned}</p>
                <p className="text-orange-100 text-xs mt-2">{statistics.by_status.suspended} suspended, {statistics.by_status.banned} banned</p>
              </div>
              <AlertCircle className="w-12 h-12 text-orange-200" />
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="user">User</option>
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
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="last_login-desc">Recently Active</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Role & Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Statistics
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto text-purple-600" />
                    <p className="text-gray-500 mt-2">Loading users...</p>
                  </td>
                </tr>
              ) : currentUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Users className="w-12 h-12 mx-auto text-gray-400" />
                    <p className="text-gray-500 mt-2">No users found</p>
                  </td>
                </tr>
              ) : (
                currentUsers.map((user) => (
                  <tr key={user.user_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                          {user.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          {user.company && (
                            <p className="text-xs text-gray-400">{user.company}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(user.role)}`}>
                          {user.role}
                        </span>
                        <br />
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(user.status)}`}>
                          {user.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MessageSquare className="w-4 h-4" />
                          <span>{user.statistics?.chatbots_count || 0} chatbots</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <FileText className="w-4 h-4" />
                          <span>{user.statistics?.messages_count || 0} messages</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Database className="w-4 h-4" />
                          <span>{user.statistics?.sources_count || 0} sources</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Logins: {user.login_count || 0}</div>
                        <div className="text-xs">
                          {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <div className="relative dropdown-container">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(openDropdownId === user.user_id ? null : user.user_id);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </button>
                          <div className={`absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 ${openDropdownId === user.user_id ? 'block' : 'hidden'}`}>
                            <button
                              onClick={() => {
                                setViewingUser(user);
                                setShowEditModal(true);
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              Edit User (Basic)
                            </button>
                            <button
                              onClick={() => {
                                setViewingUser(user);
                                setShowUltimateEditModal(true);
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-purple-50 flex items-center gap-2 text-purple-700 font-medium border-l-2 border-purple-500"
                            >
                              <Settings className="w-4 h-4" />
                              Ultimate Edit ✨
                            </button>
                            <div className="border-t border-gray-200 my-2"></div>
                            <button
                              onClick={() => {
                                handleDirectLogin(user.user_id);
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 flex items-center gap-2 text-blue-700 font-medium"
                            >
                              <LogIn className="w-4 h-4" />
                              Direct Login 🔐
                            </button>
                            <button
                              onClick={() => {
                                setViewingUser(user);
                                setShowSubscriptionModal(true);
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-indigo-50 flex items-center gap-2 text-indigo-700 font-medium"
                            >
                              <CreditCard className="w-4 h-4" />
                              Manage Subscription 💳
                            </button>
                            <div className="border-t border-gray-200 my-2"></div>
                            <button
                              onClick={() => {
                                handleExportUserData(user.user_id);
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              <FileDown className="w-4 h-4" />
                              Export Data (GDPR)
                            </button>
                            <button
                              onClick={() => {
                                setViewingUser(user);
                                setShowNotificationModal(true);
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Bell className="w-4 h-4" />
                              Send Notification
                            </button>
                            {user.status === 'active' && (
                              <>
                                <button
                                  onClick={() => {
                                    setViewingUser(user);
                                    setShowSuspendModal(true);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-yellow-600"
                                >
                                  <ShieldAlert className="w-4 h-4" />
                                  Suspend User
                                </button>
                                <button
                                  onClick={() => {
                                    setViewingUser(user);
                                    setShowBanModal(true);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                                >
                                  <Ban className="w-4 h-4" />
                                  Ban User
                                </button>
                              </>
                            )}
                            {user.status === 'suspended' && (
                              <button
                                onClick={() => {
                                  handleUnsuspendUser(user.user_id);
                                  setOpenDropdownId(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-green-600"
                              >
                                <ShieldCheck className="w-4 h-4" />
                                Unsuspend User
                              </button>
                            )}
                            {user.status === 'banned' && (
                              <button
                                onClick={() => {
                                  handleUnbanUser(user.user_id);
                                  setOpenDropdownId(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-green-600"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                Unban User
                              </button>
                            )}
                            <button
                              onClick={() => {
                                handleVerifyEmail(user.user_id);
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Verify Email
                            </button>
                            <button
                              onClick={() => {
                                handleDuplicateUser(user.user_id);
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Copy className="w-4 h-4" />
                              Duplicate User
                            </button>
                            <div className="border-t border-gray-200 my-2"></div>
                            <button
                              onClick={() => {
                                handleDeleteUser(user.user_id);
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete User
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
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
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Create New User</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    value={createForm.name}
                    onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-xs text-gray-500">(Optional for OAuth users)</span>
                </label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Leave empty for OAuth-only users"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Leave blank if user will authenticate via Google OAuth only
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({...createForm, role: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm({...createForm, status: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="banned">Banned</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subscription Plan *
                  <span className="text-xs text-gray-500 ml-2">(Choose the plan for this user)</span>
                </label>
                <select
                  value={createForm.plan_id}
                  onChange={(e) => setCreateForm({...createForm, plan_id: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-gradient-to-r from-purple-50 to-pink-50"
                >
                  <option value="free">🆓 Free Plan - 1 chatbot, 100 messages/month</option>
                  <option value="starter">🚀 Starter Plan - 5 chatbots, 15,000 messages/month (₹7,999/mo)</option>
                  <option value="professional">💼 Professional Plan - 25 chatbots, 1,25,000 messages/month (₹24,999/mo)</option>
                  <option value="enterprise">🏢 Enterprise Plan - Unlimited everything (Custom pricing)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  💡 You can change the plan later from the user's subscription settings
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({...createForm, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <input
                    type="text"
                    value={createForm.company}
                    onChange={(e) => setCreateForm({...createForm, company: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                <input
                  type="text"
                  value={createForm.job_title}
                  onChange={(e) => setCreateForm({...createForm, job_title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={createForm.tags}
                  onChange={(e) => setCreateForm({...createForm, tags: e.target.value})}
                  placeholder="vip, premium, beta-tester"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
                <textarea
                  value={createForm.admin_notes}
                  onChange={(e) => setCreateForm({...createForm, admin_notes: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create User
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && viewingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Edit User</h2>
              <button onClick={() => {
                setShowEditModal(false);
                setViewingUser(null);
              }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const response = await fetch(`${backendUrl}/api/admin/users/${viewingUser.user_id}/update`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    name: viewingUser.name,
                    email: viewingUser.email,
                    role: viewingUser.role,
                    status: viewingUser.status,
                    phone: viewingUser.phone || '',
                    company: viewingUser.company || '',
                    job_title: viewingUser.job_title || '',
                    address: viewingUser.address || '',
                    bio: viewingUser.bio || '',
                    avatar_url: viewingUser.avatar_url || '',
                    tags: viewingUser.tags || [],
                    admin_notes: viewingUser.admin_notes || ''
                  })
                });
                const data = await response.json();
                if (data.success) {
                  alert('User updated successfully!');
                  setShowEditModal(false);
                  setViewingUser(null);
                  fetchUsers();
                  fetchStatistics();
                } else {
                  alert(data.detail || 'Failed to update user');
                }
              } catch (error) {
                alert('Error updating user');
                console.error(error);
              }
            }} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    value={viewingUser.name || ''}
                    onChange={(e) => setViewingUser({...viewingUser, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={viewingUser.email || ''}
                    onChange={(e) => setViewingUser({...viewingUser, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={viewingUser.role || 'user'}
                    onChange={(e) => setViewingUser({...viewingUser, role: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={viewingUser.status || 'active'}
                    onChange={(e) => setViewingUser({...viewingUser, status: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="banned">Banned</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={viewingUser.phone || ''}
                    onChange={(e) => setViewingUser({...viewingUser, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <input
                    type="text"
                    value={viewingUser.company || ''}
                    onChange={(e) => setViewingUser({...viewingUser, company: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                <input
                  type="text"
                  value={viewingUser.job_title || ''}
                  onChange={(e) => setViewingUser({...viewingUser, job_title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  value={viewingUser.bio || ''}
                  onChange={(e) => setViewingUser({...viewingUser, bio: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
                <textarea
                  value={viewingUser.admin_notes || ''}
                  onChange={(e) => setViewingUser({...viewingUser, admin_notes: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setShowEditModal(false);
                  setViewingUser(null);
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Suspend User Modal */}
      {showSuspendModal && viewingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Suspend User</h2>
              <button onClick={() => setShowSuspendModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSuspendUser} className="p-6 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  Suspending user: <strong>{viewingUser.email}</strong>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason *</label>
                <textarea
                  required
                  value={suspendForm.reason}
                  onChange={(e) => setSuspendForm({...suspendForm, reason: e.target.value})}
                  rows={3}
                  placeholder="Enter reason for suspension..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (days)</label>
                <input
                  type="number"
                  value={suspendForm.duration_days}
                  onChange={(e) => setSuspendForm({...suspendForm, duration_days: e.target.value})}
                  placeholder="Leave empty for indefinite"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for indefinite suspension</p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white">
                  <ShieldAlert className="w-4 h-4 mr-2" />
                  Suspend User
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowSuspendModal(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ban User Modal */}
      {showBanModal && viewingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Ban User</h2>
              <button onClick={() => setShowBanModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleBanUser} className="p-6 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> This will permanently ban user: <strong>{viewingUser.email}</strong>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason *</label>
                <textarea
                  required
                  value={banForm.reason}
                  onChange={(e) => setBanForm({...banForm, reason: e.target.value})}
                  rows={3}
                  placeholder="Enter reason for ban..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                  <Ban className="w-4 h-4 mr-2" />
                  Ban User Permanently
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowBanModal(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Notification Modal */}
      {showNotificationModal && viewingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Send Notification</h2>
              <button onClick={() => setShowNotificationModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSendNotification} className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Sending to: <strong>{viewingUser.email}</strong>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                <input
                  type="text"
                  required
                  value={notificationForm.subject}
                  onChange={(e) => setNotificationForm({...notificationForm, subject: e.target.value})}
                  placeholder="Notification subject"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                <textarea
                  required
                  value={notificationForm.message}
                  onChange={(e) => setNotificationForm({...notificationForm, message: e.target.value})}
                  rows={5}
                  placeholder="Enter notification message..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  <Send className="w-4 h-4 mr-2" />
                  Send Notification
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowNotificationModal(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Advanced Search Modal */}
      {showAdvancedSearchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Advanced Search</h2>
              <button onClick={() => setShowAdvancedSearchModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdvancedSearch} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="text"
                    value={advancedSearch.email}
                    onChange={(e) => setAdvancedSearch({...advancedSearch, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={advancedSearch.name}
                    onChange={(e) => setAdvancedSearch({...advancedSearch, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={advancedSearch.role}
                    onChange={(e) => setAdvancedSearch({...advancedSearch, role: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">All Roles</option>
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={advancedSearch.status}
                    onChange={(e) => setAdvancedSearch({...advancedSearch, status: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="banned">Banned</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <input
                    type="text"
                    value={advancedSearch.company}
                    onChange={(e) => setAdvancedSearch({...advancedSearch, company: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tag</label>
                  <input
                    type="text"
                    value={advancedSearch.tag}
                    onChange={(e) => setAdvancedSearch({...advancedSearch, tag: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Has Chatbots</label>
                  <select
                    value={advancedSearch.has_chatbots}
                    onChange={(e) => setAdvancedSearch({...advancedSearch, has_chatbots: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Any</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setAdvancedSearch({
                    email: '', name: '', role: '', status: '', company: '', tag: '',
                    created_after: '', created_before: '', has_chatbots: ''
                  });
                  fetchUsers();
                  setShowAdvancedSearchModal(false);
                }}>
                  Reset
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Statistics Modal */}
      {showStatisticsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">User Statistics Overview</h2>
              <button onClick={() => setShowStatisticsModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            {!statistics ? (
              <div className="p-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading statistics...</p>
                </div>
              </div>
            ) : (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">By Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Active:</span>
                      <span className="font-bold text-green-600">{statistics.by_status.active}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Suspended:</span>
                      <span className="font-bold text-yellow-600">{statistics.by_status.suspended}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Banned:</span>
                      <span className="font-bold text-red-600">{statistics.by_status.banned}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">By Role</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Admin:</span>
                      <span className="font-bold text-purple-600">{statistics.by_role.admin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Moderator:</span>
                      <span className="font-bold text-blue-600">{statistics.by_role.moderator}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">User:</span>
                      <span className="font-bold text-gray-600">{statistics.by_role.user}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Subscriptions</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Free:</span>
                      <span className="font-bold">{statistics.subscriptions.free}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Starter:</span>
                      <span className="font-bold">{statistics.subscriptions.starter}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Pro:</span>
                      <span className="font-bold">{statistics.subscriptions.professional}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Activity</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">New Today:</span>
                      <span className="font-bold text-purple-600">{statistics.activity.new_today}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">New This Week:</span>
                      <span className="font-bold text-purple-600">{statistics.activity.new_this_week}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">New This Month:</span>
                      <span className="font-bold text-purple-600">{statistics.activity.new_this_month}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Active Today:</span>
                      <span className="font-bold text-green-600">{statistics.activity.active_today}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Active This Week:</span>
                      <span className="font-bold text-green-600">{statistics.activity.active_this_week}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Email Verification</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Verified:</span>
                      <span className="font-bold text-green-600">{statistics.email_verification.verified}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Unverified:</span>
                      <span className="font-bold text-red-600">{statistics.email_verification.unverified}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-sm font-semibold text-gray-700">Total Chatbots:</span>
                      <span className="font-bold text-blue-600">{statistics.total_chatbots}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      )}

      {/* Ultimate Edit User Modal */}
      {showUltimateEditModal && viewingUser && (
        <UltimateEditUserModal
          user={viewingUser}
          backendUrl={backendUrl}
          onClose={() => {
            setShowUltimateEditModal(false);
            setViewingUser(null);
          }}
          onSave={() => {
            fetchUsers();
            fetchStatistics();
          }}
        />
      )}

      {/* Manage Subscription Modal */}
      {showSubscriptionModal && viewingUser && (
        <ManageSubscriptionModal
          user={viewingUser}
          onClose={() => {
            setShowSubscriptionModal(false);
            setViewingUser(null);
          }}
          onUpdate={() => {
            fetchUsers();
            fetchStatistics();
          }}
        />
      )}
    </div>
  );
};

export default AdvancedUsersManagement;
