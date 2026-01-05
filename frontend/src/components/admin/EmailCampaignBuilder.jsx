import React, { useState, useEffect } from 'react';
import { Mail, Plus, Send, Clock, CheckCircle, XCircle, Eye, Trash2, Edit2 } from 'lucide-react';
import { Button } from '../ui/button';

const EmailCampaignBuilder = ({ backendUrl }) => {
  const [templates, setTemplates] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('campaigns'); // campaigns, templates
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    body: '',
    template_type: 'marketing',
    variables: []
  });

  const [newCampaign, setNewCampaign] = useState({
    name: '',
    template_id: '',
    target_user_ids: [],
    target_segments: [],
    scheduled_at: null
  });

  useEffect(() => {
    fetchTemplates();
    fetchCampaigns();
    fetchSegments();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/admin/users-enhanced/email-templates`);
      const data = await response.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/admin/users-enhanced/email-campaigns`);
      const data = await response.json();
      if (data.success) {
        setCampaigns(data.campaigns);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const fetchSegments = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/admin/users-enhanced/segments`);
      const data = await response.json();
      if (data.success) {
        setSegments(data.segments);
      }
    } catch (error) {
      console.error('Error fetching segments:', error);
    }
  };

  const createTemplate = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/admin/users-enhanced/email-templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTemplate)
      });
      const data = await response.json();
      
      if (data.success) {
        alert('Email template created successfully!');
        setShowCreateTemplate(false);
        setNewTemplate({ name: '', subject: '', body: '', template_type: 'marketing', variables: [] });
        fetchTemplates();
      }
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Failed to create template');
    }
  };

  const createCampaign = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/admin/users-enhanced/email-campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCampaign)
      });
      const data = await response.json();
      
      if (data.success) {
        alert(`Campaign created! Targeting ${data.target_user_count} users`);
        setShowCreateCampaign(false);
        setNewCampaign({ name: '', template_id: '', target_user_ids: [], target_segments: [], scheduled_at: null });
        fetchCampaigns();
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign');
    }
  };

  const deleteTemplate = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;

    try {
      const response = await fetch(`${backendUrl}/api/admin/users-enhanced/email-templates/${templateId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        alert('Template deleted successfully');
        fetchTemplates();
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template');
    }
  };

  const getCampaignStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      sending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getCampaignStatusIcon = (status) => {
    switch (status) {
      case 'sent': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'sending': return <Send className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email Campaigns</h2>
          <p className="text-gray-600">Create and manage bulk email campaigns</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateTemplate(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
          <Button onClick={() => setShowCreateCampaign(true)}>
            <Send className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
          <Mail className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-3xl font-bold">{campaigns.length}</p>
          <p className="text-sm opacity-90">Total Campaigns</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6">
          <CheckCircle className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-3xl font-bold">
            {campaigns.filter(c => c.status === 'sent').length}
          </p>
          <p className="text-sm opacity-90">Sent Campaigns</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6">
          <Eye className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-3xl font-bold">{templates.length}</p>
          <p className="text-sm opacity-90">Email Templates</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6">
          <Send className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-3xl font-bold">
            {campaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0)}
          </p>
          <p className="text-sm opacity-90">Total Emails Sent</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex gap-4 px-6">
            <button
              className={`py-3 border-b-2 font-medium transition-colors ${
                activeTab === 'campaigns'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('campaigns')}
            >
              Campaigns ({campaigns.length})
            </button>
            <button
              className={`py-3 border-b-2 font-medium transition-colors ${
                activeTab === 'templates'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('templates')}
            >
              Templates ({templates.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'campaigns' && (
            <div className="space-y-4">
              {campaigns.length === 0 ? (
                <div className="text-center py-12">
                  <Send className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-4">No campaigns yet</p>
                  <Button onClick={() => setShowCreateCampaign(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Campaign
                  </Button>
                </div>
              ) : (
                campaigns.map(campaign => (
                  <div key={campaign.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold">{campaign.name}</h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getCampaignStatusColor(campaign.status)}`}>
                            {getCampaignStatusIcon(campaign.status)}
                            {campaign.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3">
                          <div>
                            <p className="text-gray-500">Target Users</p>
                            <p className="font-semibold">{campaign.target_user_ids?.length || 0}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Sent</p>
                            <p className="font-semibold text-green-600">{campaign.sent_count || 0}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Failed</p>
                            <p className="font-semibold text-red-600">{campaign.failed_count || 0}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Opened</p>
                            <p className="font-semibold text-blue-600">{campaign.opened_count || 0}</p>
                          </div>
                        </div>

                        {campaign.target_segments && campaign.target_segments.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-500">Target Segments:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {campaign.target_segments.map(segmentId => {
                                const segment = segments.find(s => s.id === segmentId);
                                return segment ? (
                                  <span key={segmentId} className="inline-flex px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-700">
                                    {segment.name}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}

                        {campaign.scheduled_at && (
                          <p className="text-xs text-gray-500 mt-2">
                            Scheduled: {new Date(campaign.scheduled_at).toLocaleString()}
                          </p>
                        )}

                        {campaign.sent_at && (
                          <p className="text-xs text-gray-500 mt-2">
                            Sent: {new Date(campaign.sent_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {templates.length === 0 ? (
                <div className="col-span-2 text-center py-12">
                  <Mail className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-4">No templates yet</p>
                  <Button onClick={() => setShowCreateTemplate(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Template
                  </Button>
                </div>
              ) : (
                templates.map(template => (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold">{template.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{template.subject}</p>
                      </div>
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-700">
                        {template.template_type}
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded p-3 mb-3">
                      <p className="text-xs text-gray-500 mb-1">Preview:</p>
                      <p className="text-sm text-gray-700 line-clamp-3">{template.body}</p>
                    </div>

                    {template.variables && template.variables.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Variables:</p>
                        <div className="flex flex-wrap gap-1">
                          {template.variables.map(variable => (
                            <span key={variable} className="inline-flex px-2 py-0.5 text-xs font-mono rounded bg-gray-100 text-gray-700">
                              {variable}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => {
                        setNewCampaign({ ...newCampaign, template_id: template.id });
                        setShowCreateCampaign(true);
                      }}>
                        <Send className="w-4 h-4 mr-2" />
                        Use Template
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteTemplate(template.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Template Modal */}
      {showCreateTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold">Create Email Template</h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., Welcome Email"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Template Type</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={newTemplate.template_type}
                  onChange={(e) => setNewTemplate({ ...newTemplate, template_type: e.target.value })}
                >
                  <option value="marketing">Marketing</option>
                  <option value="transactional">Transactional</option>
                  <option value="notification">Notification</option>
                  <option value="announcement">Announcement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject Line</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., Welcome to BotSmith!"
                  value={newTemplate.subject}
                  onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Body</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows="8"
                  placeholder="Hi {{user_name}},&#10;&#10;Welcome to BotSmith! We're excited to have you on board."
                  value={newTemplate.body}
                  onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Use variables like  to personalize emails
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Variables (comma-separated)</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., user_name, plan_name"
                  value={newTemplate.variables.join(', ')}
                  onChange={(e) => setNewTemplate({ ...newTemplate, variables: e.target.value.split(',').map(v => v.trim()) })}
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowCreateTemplate(false)}>
                Cancel
              </Button>
              <Button onClick={createTemplate} disabled={!newTemplate.name || !newTemplate.subject || !newTemplate.body}>
                Create Template
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold">Create Email Campaign</h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., Monthly Newsletter"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Template</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={newCampaign.template_id}
                  onChange={(e) => setNewCampaign({ ...newCampaign, template_id: e.target.value })}
                >
                  <option value="">Choose a template...</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name} - {template.subject}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Segments</label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {segments.map(segment => (
                    <label key={segment.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={newCampaign.target_segments.includes(segment.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewCampaign({ ...newCampaign, target_segments: [...newCampaign.target_segments, segment.id] });
                          } else {
                            setNewCampaign({ ...newCampaign, target_segments: newCampaign.target_segments.filter(id => id !== segment.id) });
                          }
                        }}
                      />
                      <span className="text-sm">
                        {segment.name} <span className="text-gray-500">({segment.user_count} users)</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Schedule (Optional)</label>
                <input
                  type="datetime-local"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  value={newCampaign.scheduled_at || ''}
                  onChange={(e) => setNewCampaign({ ...newCampaign, scheduled_at: e.target.value || null })}
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to send immediately</p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowCreateCampaign(false)}>
                Cancel
              </Button>
              <Button 
                onClick={createCampaign}
                disabled={!newCampaign.name || !newCampaign.template_id || newCampaign.target_segments.length === 0}
              >
                <Send className="w-4 h-4 mr-2" />
                {newCampaign.scheduled_at ? 'Schedule Campaign' : 'Send Now'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailCampaignBuilder;
