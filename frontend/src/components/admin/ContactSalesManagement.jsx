import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Search, Mail, Building2, Calendar, Trash2, CheckCircle, Clock, XCircle, Eye, Edit2, Download } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../ui/dialog';
import { Label } from '../ui/label';

const ContactSalesManagement = ({ backendUrl }) => {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({ status: '', notes: '' });
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    closed: 0
  });

  useEffect(() => {
    fetchSubmissions();
  }, [filterStatus]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const url = filterStatus === 'all' 
        ? `${backendUrl}/api/admin/contact-sales`
        : `${backendUrl}/api/admin/contact-sales?status=${filterStatus}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      setSubmissions(data.submissions || []);
      
      // Calculate stats
      const allSubmissions = data.submissions || [];
      setStats({
        total: allSubmissions.length,
        new: allSubmissions.filter(s => s.status === 'new').length,
        contacted: allSubmissions.filter(s => s.status === 'contacted').length,
        closed: allSubmissions.filter(s => s.status === 'closed').length
      });
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch contact sales submissions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleView = (submission) => {
    setSelectedSubmission(submission);
    setIsViewModalOpen(true);
  };

  const handleEdit = (submission) => {
    setSelectedSubmission(submission);
    setEditData({
      status: submission.status,
      notes: submission.notes || ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmission = async () => {
    try {
      const response = await fetch(
        `${backendUrl}/api/admin/contact-sales/${selectedSubmission.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editData)
        }
      );

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Submission updated successfully'
        });
        setIsEditModalOpen(false);
        fetchSubmissions();
      }
    } catch (error) {
      console.error('Error updating submission:', error);
      toast({
        title: 'Error',
        description: 'Failed to update submission',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (submissionId) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) {
      return;
    }

    try {
      const response = await fetch(
        `${backendUrl}/api/admin/contact-sales/${submissionId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Submission deleted successfully'
        });
        fetchSubmissions();
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete submission',
        variant: 'destructive'
      });
    }
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Name', 'Email', 'Company', 'Message', 'Status', 'Created At', 'Notes'],
      ...submissions.map(s => [
        s.name,
        s.email,
        s.company,
        s.message,
        s.status,
        new Date(s.created_at).toLocaleString(),
        s.notes || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contact-sales-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredSubmissions = submissions.filter(submission =>
    submission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    submission.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    submission.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    submission.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const badges = {
      new: { color: 'bg-blue-100 text-blue-700', icon: <Clock className="w-3 h-3" />, text: 'New' },
      contacted: { color: 'bg-yellow-100 text-yellow-700', icon: <Mail className="w-3 h-3" />, text: 'Contacted' },
      closed: { color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-3 h-3" />, text: 'Closed' }
    };
    
    const badge = badges[status] || badges.new;
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${badge.color}`}>
        {badge.icon}
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contact Sales Submissions</h2>
          <p className="text-gray-600 text-sm mt-1">Manage and respond to enterprise inquiries</p>
        </div>
        <Button
          onClick={handleExportCSV}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total</p>
              <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
            </div>
            <Mail className="w-10 h-10 text-blue-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">New</p>
              <p className="text-3xl font-bold text-yellow-700">{stats.new}</p>
            </div>
            <Clock className="w-10 h-10 text-yellow-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Contacted</p>
              <p className="text-3xl font-bold text-purple-700">{stats.contacted}</p>
            </div>
            <Mail className="w-10 h-10 text-purple-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Closed</p>
              <p className="text-3xl font-bold text-green-700">{stats.closed}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search by name, email, company, or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="closed">Closed</option>
        </select>
        <Button
          onClick={fetchSubmissions}
          variant="outline"
          className="border-purple-300 text-purple-600 hover:bg-purple-50"
        >
          Refresh
        </Button>
      </div>

      {/* Submissions Table */}
      {filteredSubmissions.length === 0 ? (
        <div className="text-center py-12">
          <Mail className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 text-lg">No submissions found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Name</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Company</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Message</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Date</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((submission) => (
                <tr key={submission.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">{submission.name}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      {submission.email}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building2 className="w-4 h-4" />
                      {submission.company}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-gray-600 truncate max-w-xs">
                      {submission.message}
                    </p>
                  </td>
                  <td className="py-4 px-4">
                    {getStatusBadge(submission.status)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {new Date(submission.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleView(submission)}
                        className="hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(submission)}
                        className="hover:bg-purple-50 hover:text-purple-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(submission.id)}
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contact Sales Submission Details</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Name</Label>
                  <p className="font-medium text-gray-900 mt-1">{selectedSubmission.name}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Email</Label>
                  <p className="font-medium text-gray-900 mt-1">{selectedSubmission.email}</p>
                </div>
              </div>
              <div>
                <Label className="text-gray-600">Company</Label>
                <p className="font-medium text-gray-900 mt-1">{selectedSubmission.company}</p>
              </div>
              <div>
                <Label className="text-gray-600">Message</Label>
                <p className="text-gray-700 mt-1 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                  {selectedSubmission.message}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Status</Label>
                  <div className="mt-2">{getStatusBadge(selectedSubmission.status)}</div>
                </div>
                <div>
                  <Label className="text-gray-600">Submitted</Label>
                  <p className="font-medium text-gray-900 mt-1">
                    {new Date(selectedSubmission.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              {selectedSubmission.notes && (
                <div>
                  <Label className="text-gray-600">Internal Notes</Label>
                  <p className="text-gray-700 mt-1 p-4 bg-yellow-50 rounded-lg whitespace-pre-wrap">
                    {selectedSubmission.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Submission Status</DialogTitle>
            <DialogDescription>
              Update the status and add internal notes for this submission
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={editData.status}
                onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea
                id="notes"
                value={editData.notes}
                onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                className="mt-2"
                rows={4}
                placeholder="Add internal notes about this submission..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateSubmission}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              Update Submission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactSalesManagement;
