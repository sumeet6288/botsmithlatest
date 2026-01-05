import React, { useState, useEffect } from 'react';
import { Users, Edit, Trash2, Search, UserPlus, Ban, CheckCircle, Activity, Eye } from 'lucide-react';
import { Button } from '../ui/button';

const UsersManagement = ({ backendUrl }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [viewingActivity, setViewingActivity] = useState(null);
  const [userActivity, setUserActivity] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/api/admin/users/detailed`);
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm(`Are you sure you want to delete user ${userId} and all their data?`)) {
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
      alert('Failed to delete user');
    }
  };

  const suspendUser = async (userId) => {
    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${userId}/suspend`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        alert('User suspended successfully');
        fetchUsers();
      }
    } catch (error) {
      console.error('Error suspending user:', error);
      alert('Failed to suspend user');
    }
  };

  const activateUser = async (userId) => {
    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${userId}/activate`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        alert('User activated successfully');
        fetchUsers();
      }
    } catch (error) {
      console.error('Error activating user:', error);
      alert('Failed to activate user');
    }
  };

  const viewUserActivity = async (userId) => {
    try {
      setViewingActivity(userId);
      const response = await fetch(`${backendUrl}/api/admin/users/${userId}/activity`);
      const data = await response.json();
      setUserActivity(data.activities || []);
    } catch (error) {
      console.error('Error fetching user activity:', error);
      setUserActivity([]);
    }
  };

  const saveEditUser = async () => {
    if (!editingUser) return;

    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${editingUser.user_id}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: editingUser.plan,
          max_chatbots: editingUser.max_chatbots,
          max_messages: editingUser.max_messages,
          status: editingUser.status
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('User updated successfully');
        setEditingUser(null);
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  const filteredUsers = users.filter(user =>
    user.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No users found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">User ID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Plan</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Chatbots</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Messages</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Conversations</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.user_id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-sm">{user.user_id}</td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {user.plan}
                    </span>
                  </td>
                  <td className="py-3 px-4">{user.chatbots_count}</td>
                  <td className="py-3 px-4">{user.messages_count}</td>
                  <td className="py-3 px-4">{user.conversations_count}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingUser(user)}
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => viewUserActivity(user.user_id)}
                        title="View Activity"
                      >
                        <Activity className="w-4 h-4 text-purple-600" />
                      </Button>
                      {user.status === 'active' ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => suspendUser(user.user_id)}
                          title="Suspend User"
                        >
                          <Ban className="w-4 h-4 text-yellow-600" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => activateUser(user.user_id)}
                          title="Activate User"
                        >
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteUser(user.user_id)}
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-6">Edit User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plan</label>
                <select
                  value={editingUser.plan}
                  onChange={(e) => setEditingUser({...editingUser, plan: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Free">Free</option>
                  <option value="Starter">Starter</option>
                  <option value="Professional">Professional</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Chatbots</label>
                <input
                  type="number"
                  value={editingUser.max_chatbots}
                  onChange={(e) => setEditingUser({...editingUser, max_chatbots: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Messages</label>
                <input
                  type="number"
                  value={editingUser.max_messages}
                  onChange={(e) => setEditingUser({...editingUser, max_messages: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({...editingUser, status: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={saveEditUser} className="flex-1 bg-purple-600 hover:bg-purple-700">
                Save Changes
              </Button>
              <Button onClick={() => setEditingUser(null)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Modal */}
      {viewingActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6">User Activity Timeline</h3>
            <div className="space-y-3">
              {userActivity.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No activity found</p>
              ) : (
                userActivity.map((activity, idx) => (
                  <div key={idx} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Activity className="w-5 h-5 text-purple-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{activity.title}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(activity.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-6">
              <Button onClick={() => setViewingActivity(null)} variant="outline" className="w-full">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
