import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Phone, Mail, User, AlertCircle } from 'lucide-react';
import axios from 'axios';
import AddLeadModal from '../components/AddLeadModal';
import EditLeadModal from '../components/EditLeadModal';

const LeadsManagement = () => {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, []);

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${backendUrl}/api/leads`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeads(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leads:', error);
      showToast('Failed to load leads', 'error');
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${backendUrl}/api/leads/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAddLead = async (leadData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${backendUrl}/api/leads`, leadData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeads([response.data, ...leads]);
      setShowAddModal(false);
      showToast('Lead added successfully!', 'success');
      fetchStats();
    } catch (error) {
      console.error('Error adding lead:', error);
      if (error.response?.status === 403) {
        const detail = error.response.data.detail;
        showToast(detail.message || 'Lead limit reached. Upgrade your plan!', 'error');
      } else {
        showToast('Failed to add lead', 'error');
      }
    }
  };

  const handleUpdateLead = async (leadId, leadData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${backendUrl}/api/leads/${leadId}`, leadData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeads(leads.map(lead => lead.id === leadId ? response.data : lead));
      setEditingLead(null);
      showToast('Lead updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating lead:', error);
      showToast('Failed to update lead', 'error');
    }
  };

  const handleDeleteLead = async (leadId) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${backendUrl}/api/leads/${leadId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeads(leads.filter(lead => lead.id !== leadId));
      showToast('Lead deleted successfully!', 'success');
      fetchStats();
    } catch (error) {
      console.error('Error deleting lead:', error);
      showToast('Failed to delete lead', 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Contacted':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Closed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lead Management</h1>
          <p className="text-gray-600">Manage and track your leads</p>
        </div>

        {/* Stats Card */}
        {stats && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {stats.current_leads} / {stats.max_leads}
                </h2>
                <p className="text-sm text-gray-600">
                  Current Leads ({stats.plan_name} Plan)
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!stats.can_add_more}
              >
                <Plus className="w-5 h-5" />
                New Lead
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-2">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Usage</span>
                <span>{stats.percentage_used.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full ${getProgressColor(stats.percentage_used)} transition-all duration-500`}
                  style={{ width: `${Math.min(stats.percentage_used, 100)}%` }}
                ></div>
              </div>
            </div>

            {!stats.can_add_more && (
              <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-600">
                  You've reached your lead limit. Upgrade your plan to add more leads.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Leads Grid */}
        {leads.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-purple-100">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No leads yet</h3>
            <p className="text-gray-600 mb-6">
              Start adding leads to manage your contacts and track their status
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Add Your First Lead
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100"
              >
                {/* Lead Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {lead.name}
                    </h3>
                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{lead.contact}</span>
                  </div>
                  {lead.notes && (
                    <p className="text-sm text-gray-500 italic line-clamp-2">
                      "{lead.notes}"
                    </p>
                  )}
                </div>

                {/* Date */}
                <div className="text-xs text-gray-400 mb-4">
                  Added {new Date(lead.created_at).toLocaleDateString()}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingLead(lead)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteLead(lead.id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddLeadModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddLead}
        />
      )}

      {editingLead && (
        <EditLeadModal
          lead={editingLead}
          onClose={() => setEditingLead(null)}
          onSubmit={handleUpdateLead}
        />
      )}
    </div>
  );
};

export default LeadsManagement;
