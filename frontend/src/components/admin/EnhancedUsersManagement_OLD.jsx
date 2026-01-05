import React, { useState, useEffect } from 'react';
import { 
  Users, Edit, Trash2, Search, UserPlus, Ban, CheckCircle, Activity, Eye, 
  Download, Mail, Filter, Tag, Clock, DollarSign, TrendingUp, Settings,
  MessageSquare, FileText, Shield, AlertCircle, BarChart3, Calendar,
  UserCheck, UserX, PhoneCall, MapPin, Hash, RefreshCw, Archive,
  Star, Award, Target, Zap
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
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  
  // Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  
  // Data States
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [userActivity, setUserActivity] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [userNotes, setUserNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([
    'VIP', 'Power User', 'New User', 'At Risk', 'Champion', 
    'Trial', 'Beta Tester', 'Enterprise', 'Support Priority'
  ]);

  useEffect(() => {
    fetchUsers();
  }, [sortBy, sortOrder, filterStatus, filterPlan, filterRisk]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/api/admin/users/enhanced?sortBy=${sortBy}&sortOrder=${sortOrder}`);
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
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
      setUserStats(data);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchUserNotes = async (userId) => {
    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${userId}/notes`);
      const data = await response.json();
      setUserNotes(data.notes || []);
    } catch (error) {
      console.error('Error fetching user notes:', error);
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

  const handleViewNotes = async (user) => {
    setViewingUser(user);
    await fetchUserNotes(user.user_id);
    setShowNotesModal(true);
  };

  const saveUser = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${editingUser.user_id}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingUser)
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

  const suspendUser = async (userId) => {
    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${userId}/suspend`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        alert('User suspended');
        fetchUsers();
      }
    } catch (error) {
      console.error('Error suspending user:', error);
    }
  };

  const activateUser = async (userId) => {
    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${userId}/activate`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        alert('User activated');
        fetchUsers();
      }
    } catch (error) {
      console.error('Error activating user:', error);
    }
  };

  const addNote = async () => {
    if (!newNote.trim() || !viewingUser) return;
    
    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${viewingUser.user_id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newNote })
      });
      const data = await response.json();
      if (data.success) {
        setNewNote('');
        fetchUserNotes(viewingUser.user_id);
      }
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const sendEmail = async () => {
    if (!emailSubject || !emailBody) {
      alert('Please fill in subject and body');
      return;
    }

    const userIds = selectedUsers.length > 0 ? selectedUsers : [viewingUser?.user_id];
    
    try {
      const response = await fetch(`${backendUrl}/api/admin/users/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_ids: userIds,
          subject: emailSubject,
          body: emailBody
        })
      });
      const data = await response.json();
      if (data.success) {
        alert(`Email sent to ${userIds.length} user(s)`);
        setShowEmailModal(false);
        setEmailSubject('');
        setEmailBody('');
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const updateTags = async () => {
    if (!viewingUser) return;
    
    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${viewingUser.user_id}/tags`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: selectedTags })
      });
      const data = await response.json();
      if (data.success) {
        alert('Tags updated');
        fetchUsers();
        setShowTagModal(false);
      }
    } catch (error) {
      console.error('Error updating tags:', error);
    }
  };

  const exportUsers = () => {
    const csvData = users.map(user => ({
      'User ID': user.user_id,
      'Email': user.email,
      'Name': user.name || 'N/A',
      'Plan': user.plan,
      'Status': user.status,
      'Chatbots': user.chatbots_count,
      'Messages': user.messages_count,
      'Created': user.created_at,
      'Last Active': user.last_active || 'Never'
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString()}.csv`;
    a.click();
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

  const bulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      alert('Please select users first');
      return;
    }

    if (!window.confirm(`Apply ${action} to ${selectedUsers.length} user(s)?`)) {
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/admin/users/bulk-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_ids: selectedUsers,
          action: action
        })
      });
      const data = await response.json();
      if (data.success) {
        alert(`${action} applied to ${selectedUsers.length} user(s)`);
        setSelectedUsers([]);
        fetchUsers();
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  // Filtering
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    const matchesPlan = filterPlan === 'all' || user.plan === filterPlan;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const getRiskLevel = (user) => {
    const daysSinceActive = user.last_active ? 
      Math.floor((new Date() - new Date(user.last_active)) / (1000 * 60 * 60 * 24)) : 999;
    
    if (daysSinceActive > 30) return { level: 'high', label: 'High Risk', color: 'text-red-600 bg-red-50' };
    if (daysSinceActive > 14) return { level: 'medium', label: 'Medium Risk', color: 'text-yellow-600 bg-yellow-50' };
    return { level: 'low', label: 'Low Risk', color: 'text-green-600 bg-green-50' };
  };

  const getEngagementScore = (user) => {
    const score = Math.min(100, (user.messages_count || 0) + (user.chatbots_count || 0) * 10);
    if (score >= 70) return { score, level: 'High', color: 'text-green-600' };
    if (score >= 40) return { score, level: 'Medium', color: 'text-yellow-600' };
    return { score, level: 'Low', color: 'text-red-600' };
  };

  if (loading) {
    return <div className="text-center py-12">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-green-600">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
            <UserCheck className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Suspended</p>
              <p className="text-2xl font-bold text-red-600">
                {users.filter(u => u.status === 'suspended').length}
              </p>
            </div>
            <Ban className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Paid Users</p>
              <p className="text-2xl font-bold text-purple-600">
                {users.filter(u => u.plan !== 'Free').length}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters and Actions Bar */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>

          {/* Plan Filter */}
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Plans</option>
            <option value="Free">Free</option>
            <option value="Starter">Starter</option>
            <option value="Professional">Professional</option>
            <option value="Enterprise">Enterprise</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="created_at">Created Date</option>
            <option value="email">Email</option>
            <option value="plan">Plan</option>
            <option value="messages_count">Messages</option>
            <option value="chatbots_count">Chatbots</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={exportUsers}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          
          <Button
            onClick={() => setShowEmailModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Mail className="w-4 h-4 mr-2" />
            Send Email
          </Button>
          
          <Button
            onClick={fetchUsers}
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>

          {selectedUsers.length > 0 && (
            <>
              <Button
                onClick={() => bulkAction('suspend')}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Ban className="w-4 h-4 mr-2" />
                Bulk Suspend ({selectedUsers.length})
              </Button>
              
              <Button
                onClick={() => bulkAction('activate')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Bulk Activate ({selectedUsers.length})
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engagement</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentUsers.map((user) => {
                const risk = getRiskLevel(user);
                const engagement = getEngagementScore(user);
                
                return (
                  <tr key={user.user_id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.user_id)}
                        onChange={() => handleSelectUser(user.user_id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{user.name || user.user_id}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.tags && user.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {user.tags.slice(0, 2).map((tag, idx) => (
                              <span key={idx} className="text-xs px-2 py-0.5 bg-purple-100 text-purple-600 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.plan === 'Enterprise' ? 'bg-purple-100 text-purple-800' :
                        user.plan === 'Professional' ? 'bg-blue-100 text-blue-800' :
                        user.plan === 'Starter' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.plan}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        <div>{user.chatbots_count} chatbots</div>
                        <div className="text-gray-500">{user.messages_count} messages</div>
                        <div className="text-gray-500">{user.conversations_count} conversations</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className={`text-sm font-medium ${engagement.color}`}>
                        {engagement.level}
                        <div className="text-xs text-gray-500">Score: {engagement.score}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${risk.color}`}>
                        {risk.label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' :
                        user.status === 'suspended' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleViewStats(user)}
                          className="text-purple-600 hover:text-purple-800"
                          title="View Stats"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleViewActivity(user)}
                          className="text-green-600 hover:text-green-800"
                          title="View Activity"
                        >
                          <Activity className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleViewNotes(user)}
                          className="text-yellow-600 hover:text-yellow-800"
                          title="Notes"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        
                        {user.status === 'active' ? (
                          <button
                            onClick={() => suspendUser(user.user_id)}
                            className="text-red-600 hover:text-red-800"
                            title="Suspend"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => activateUser(user.user_id)}
                            className="text-green-600 hover:text-green-800"
                            title="Activate"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => deleteUser(user.user_id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="bg-gray-600 hover:bg-gray-700 text-white disabled:opacity-50"
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="bg-gray-600 hover:bg-gray-700 text-white disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit User</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={editingUser.email || ''}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={editingUser.name || ''}
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Plan</label>
                <select
                  value={editingUser.plan || 'Free'}
                  onChange={(e) => setEditingUser({...editingUser, plan: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="Free">Free</option>
                  <option value="Starter">Starter</option>
                  <option value="Professional">Professional</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={editingUser.status || 'active'}
                  onChange={(e) => setEditingUser({...editingUser, status: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Max Chatbots</label>
                <input
                  type="number"
                  value={editingUser.max_chatbots || 1}
                  onChange={(e) => setEditingUser({...editingUser, max_chatbots: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Max Messages</label>
                <input
                  type="number"
                  value={editingUser.max_messages || 100}
                  onChange={(e) => setEditingUser({...editingUser, max_messages: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Max File Uploads</label>
                <input
                  type="number"
                  value={editingUser.max_file_uploads || 5}
                  onChange={(e) => setEditingUser({...editingUser, max_file_uploads: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Max Website Sources</label>
                <input
                  type="number"
                  value={editingUser.max_website_sources || 2}
                  onChange={(e) => setEditingUser({...editingUser, max_website_sources: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button onClick={saveUser} className="bg-purple-600 hover:bg-purple-700 text-white">
                Save Changes
              </Button>
              <Button onClick={() => setShowEditModal(false)} className="bg-gray-600 hover:bg-gray-700 text-white">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* User Stats Modal */}
      {showStatsModal && viewingUser && userStats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">User Statistics - {viewingUser.email}</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{userStats.total_chatbots || 0}</div>
                <div className="text-sm text-gray-600">Total Chatbots</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{userStats.total_messages || 0}</div>
                <div className="text-sm text-gray-600">Total Messages</div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{userStats.total_conversations || 0}</div>
                <div className="text-sm text-gray-600">Conversations</div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{userStats.avg_messages_per_day || 0}</div>
                <div className="text-sm text-gray-600">Avg Messages/Day</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Account Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member Since:</span>
                    <span className="font-medium">{new Date(viewingUser.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Active:</span>
                    <span className="font-medium">{viewingUser.last_active || 'Never'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subscription:</span>
                    <span className="font-medium">{viewingUser.plan}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Usage Limits</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Chatbots</span>
                      <span className="text-sm">{viewingUser.chatbots_count}/{viewingUser.max_chatbots}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{width: `${(viewingUser.chatbots_count / viewingUser.max_chatbots) * 100}%`}}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Messages</span>
                      <span className="text-sm">{viewingUser.messages_count}/{viewingUser.max_messages}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full"
                        style={{width: `${(viewingUser.messages_count / viewingUser.max_messages) * 100}%`}}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={() => setShowStatsModal(false)} className="bg-gray-600 hover:bg-gray-700 text-white">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Modal */}
      {showActivityModal && viewingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">User Activity - {viewingUser.email}</h2>
            
            {userActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No activity recorded yet</p>
            ) : (
              <div className="space-y-3">
                {userActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 mt-2 rounded-full bg-purple-600" />
                    <div className="flex-1">
                      <div className="font-medium">{activity.action}</div>
                      <div className="text-sm text-gray-600">{activity.details}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end mt-6">
              <Button onClick={() => setShowActivityModal(false)} className="bg-gray-600 hover:bg-gray-700 text-white">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {showNotesModal && viewingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">User Notes - {viewingUser.email}</h2>
            
            <div className="mb-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                className="w-full px-3 py-2 border rounded-lg"
                rows="3"
              />
              <Button onClick={addNote} className="mt-2 bg-purple-600 hover:bg-purple-700 text-white">
                Add Note
              </Button>
            </div>

            <div className="space-y-3">
              {userNotes.map((note, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm">{note.note}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {note.created_by} - {new Date(note.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={() => setShowNotesModal(false)} className="bg-gray-600 hover:bg-gray-700 text-white">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">Send Email</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Email subject..."
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Email message..."
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="6"
                />
              </div>

              <div className="text-sm text-gray-600">
                Sending to: {selectedUsers.length > 0 ? `${selectedUsers.length} selected users` : 'current user'}
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button onClick={sendEmail} className="bg-purple-600 hover:bg-purple-700 text-white">
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
              <Button onClick={() => setShowEmailModal(false)} className="bg-gray-600 hover:bg-gray-700 text-white">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedUsersManagement;
