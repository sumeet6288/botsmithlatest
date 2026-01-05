import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Upload, Download, Search, Filter, Edit, Trash2, Eye, FileText, Users, CheckCircle, XCircle } from 'lucide-react';

const LeadsManagement = () => {
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    fetchLeads();
    fetchUsers();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/api/admin/leads`);
      const data = await response.json();
      setLeads(data.leads || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/admin/users/enhanced`);
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleUploadLeads = async () => {
    if (!uploadFile || !selectedUser) {
      alert('Please select a file and user');
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('user_id', selectedUser);

    try {
      const response = await fetch(`${backendUrl}/api/admin/leads/upload`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(`Successfully uploaded ${data.count} leads`);
        setShowUploadModal(false);
        setUploadFile(null);
        setSelectedUser('');
        fetchLeads();
      } else {
        alert(data.detail || 'Failed to upload leads');
      }
    } catch (error) {
      console.error('Error uploading leads:', error);
      alert('Failed to upload leads');
    }
  };

  const handleDeleteLead = async (leadId) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) {
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/admin/leads/${leadId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Lead deleted successfully');
        fetchLeads();
      } else {
        alert('Failed to delete lead');
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
      alert('Failed to delete lead');
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = !searchQuery || 
      lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesUser = !selectedUser || lead.user_id === selectedUser;
    
    return matchesSearch && matchesUser;
  });

  const getLeadsStats = () => {
    const totalLeads = leads.length;
    const activeLeads = leads.filter(l => l.status === 'active').length;
    const uniqueUsers = new Set(leads.map(l => l.user_id)).size;
    
    return { totalLeads, activeLeads, uniqueUsers };
  };

  const stats = getLeadsStats();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Leads</p>
              <p className="text-3xl font-bold text-purple-600">{stats.totalLeads}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Leads</p>
              <p className="text-3xl font-bold text-green-600">{stats.activeLeads}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Users with Leads</p>
              <p className="text-3xl font-bold text-blue-600">{stats.uniqueUsers}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1 flex gap-3 w-full md:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads by name, email, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Users</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>
          
          <Button
            onClick={() => setShowUploadModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Leads
          </Button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Phone</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Company</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date Added</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    Loading leads...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <FileText className="w-16 h-16 text-gray-300 mb-4" />
                      <p className="text-lg font-semibold mb-2">No Leads Found</p>
                      <p className="text-sm">Upload leads to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-t border-gray-100 hover:bg-purple-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{lead.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{lead.email || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{lead.phone || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{lead.company || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {users.find(u => u.id === lead.user_id)?.name || lead.user_id}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        lead.status === 'active' ? 'bg-green-100 text-green-800' :
                        lead.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                        lead.status === 'converted' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {lead.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteLead(lead.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Upload Leads</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select User
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select a user...</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email}) - {user.subscription?.plan_name || 'Free'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload CSV File
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="mt-2 text-xs text-gray-500">
                  CSV format: name, email, phone, company, status
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Plan Limits:</strong><br />
                  Starter: 100 leads | Professional: 1,000 leads
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleUploadLeads}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                Upload
              </Button>
              <Button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFile(null);
                  setSelectedUser('');
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsManagement;
