import React, { useState, useEffect } from 'react';
import { 
  Save, X, User, Shield, Settings, CreditCard, Zap, Activity, 
  Bell, Database, Code, Palette, Globe, Lock, Clock, Mail,
  Smartphone, MapPin, Briefcase, Tag, Star, Key, FileText,
  ToggleLeft, ToggleRight, Plus, Trash2, Edit, Copy, Check,
  AlertCircle, Info, ChevronDown, ChevronUp, Search, Filter,
  Eye, EyeOff
} from 'lucide-react';
import { Button } from '../ui/button';

const UltimateEditUserModal = ({ user, backendUrl, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [editData, setEditData] = useState({
    // Basic Info
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    bio: user?.bio || '',
    avatar_url: user?.avatar_url || '',
    company: user?.company || '',
    job_title: user?.job_title || '',
    
    // Role & Permissions
    role: user?.role || 'user',
    permissions: user?.permissions || {
      canCreateChatbots: true,
      canDeleteChatbots: true,
      canViewAnalytics: true,
      canExportData: true,
      canManageIntegrations: true,
      canAccessAPI: true,
      canUploadFiles: true,
      canScrapeWebsites: true,
      canUseAdvancedFeatures: false,
      canInviteTeamMembers: false,
      canManageBilling: false,
    },
    
    // Account Status & Security
    status: user?.status || 'active',
    suspension_reason: user?.suspension_reason || '',
    email_verified: user?.email_verified || false,
    two_factor_enabled: user?.two_factor_enabled || false,
    password_expires_at: user?.password_expires_at || null,
    force_password_change: user?.force_password_change || false,
    allowed_ips: user?.allowed_ips || [],
    blocked_ips: user?.blocked_ips || [],
    max_sessions: user?.max_sessions || 5,
    session_timeout: user?.session_timeout || 3600,
    
    // Subscription & Billing
    plan_id: user?.plan_id || 'free',
    stripe_customer_id: user?.stripe_customer_id || '',
    billing_email: user?.billing_email || '',
    payment_method: user?.payment_method || '',
    trial_ends_at: user?.trial_ends_at || null,
    subscription_ends_at: user?.subscription_ends_at || null,
    lifetime_access: user?.lifetime_access || false,
    discount_code: user?.discount_code || '',
    custom_pricing: user?.custom_pricing || null,
    
    // Custom Limits & Features
    custom_limits: user?.custom_limits || {
      max_chatbots: null,
      max_messages_per_month: null,
      max_file_uploads: null,
      max_website_sources: null,
      max_text_sources: null,
      max_storage_mb: null,
      max_ai_models: null,
      max_integrations: null,
    },
    feature_flags: user?.feature_flags || {
      betaFeatures: false,
      advancedAnalytics: false,
      customBranding: false,
      apiAccess: false,
      prioritySupport: false,
      customDomain: false,
      whiteLabel: false,
      ssoEnabled: false,
    },
    api_rate_limits: user?.api_rate_limits || {
      requests_per_minute: 60,
      requests_per_hour: 1000,
      requests_per_day: 10000,
      burst_limit: 100,
    },
    
    // Profile & Appearance
    timezone: user?.timezone || 'UTC',
    language: user?.language || 'en',
    theme: user?.theme || 'light',
    custom_css: user?.custom_css || '',
    branding: user?.branding || {
      logo_url: '',
      favicon_url: '',
      primary_color: '#7c3aed',
      secondary_color: '#ec4899',
      font_family: 'Inter',
    },
    
    // Notifications & Preferences
    email_notifications: user?.email_notifications || true,
    marketing_emails: user?.marketing_emails || true,
    notification_preferences: user?.notification_preferences || {
      newChatbotCreated: true,
      limitReached: true,
      weeklyReport: true,
      monthlyReport: true,
      securityAlerts: true,
      systemUpdates: true,
      promotionalOffers: false,
    },
    
    // Metadata & Custom Fields
    tags: user?.tags || [],
    segments: user?.segments || [],
    custom_fields: user?.custom_fields || {},
    admin_notes: user?.admin_notes || '',
    internal_notes: user?.internal_notes || [],
    
    // Activity & Tracking
    tracking_enabled: user?.tracking_enabled || true,
    analytics_enabled: user?.analytics_enabled || true,
    last_activity_at: user?.last_activity_at || null,
    onboarding_completed: user?.onboarding_completed || false,
    onboarding_step: user?.onboarding_step || 0,
    
    // API & Integrations
    api_key: user?.api_key || '',
    webhook_url: user?.webhook_url || '',
    webhook_events: user?.webhook_events || [],
    oauth_tokens: user?.oauth_tokens || {},
    integration_preferences: user?.integration_preferences || {},
  });

  const [newTag, setNewTag] = useState('');
  const [newSegment, setNewSegment] = useState('');
  const [newCustomField, setNewCustomField] = useState({ key: '', value: '' });
  const [newAllowedIP, setNewAllowedIP] = useState('');
  const [newBlockedIP, setNewBlockedIP] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  const tabs = [
    { id: 'basic', name: 'Basic Info', icon: User },
    { id: 'permissions', name: 'Permissions', icon: Shield },
    { id: 'security', name: 'Security', icon: Lock },
    { id: 'subscription', name: 'Subscription', icon: CreditCard },
    { id: 'limits', name: 'Limits & Features', icon: Zap },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'metadata', name: 'Metadata', icon: Database },
    { id: 'api', name: 'API & Integrations', icon: Code },
    { id: 'tracking', name: 'Tracking', icon: Activity },
  ];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${user.user_id}/ultimate-update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });
      
      const data = await response.json();
      if (data.success || response.ok) {
        onSave();
        onClose();
      } else {
        alert(data.detail || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user');
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    if (newTag && !editData.tags.includes(newTag)) {
      setEditData({ ...editData, tags: [...editData.tags, newTag] });
      setNewTag('');
    }
  };

  const removeTag = (tag) => {
    setEditData({ ...editData, tags: editData.tags.filter(t => t !== tag) });
  };

  const addSegment = () => {
    if (newSegment && !editData.segments.includes(newSegment)) {
      setEditData({ ...editData, segments: [...editData.segments, newSegment] });
      setNewSegment('');
    }
  };

  const removeSegment = (segment) => {
    setEditData({ ...editData, segments: editData.segments.filter(s => s !== segment) });
  };

  const addCustomField = () => {
    if (newCustomField.key && newCustomField.value) {
      setEditData({
        ...editData,
        custom_fields: { ...editData.custom_fields, [newCustomField.key]: newCustomField.value }
      });
      setNewCustomField({ key: '', value: '' });
    }
  };

  const removeCustomField = (key) => {
    const { [key]: removed, ...rest } = editData.custom_fields;
    setEditData({ ...editData, custom_fields: rest });
  };

  const addAllowedIP = () => {
    if (newAllowedIP && !editData.allowed_ips.includes(newAllowedIP)) {
      setEditData({ ...editData, allowed_ips: [...editData.allowed_ips, newAllowedIP] });
      setNewAllowedIP('');
    }
  };

  const removeAllowedIP = (ip) => {
    setEditData({ ...editData, allowed_ips: editData.allowed_ips.filter(i => i !== ip) });
  };

  const addBlockedIP = () => {
    if (newBlockedIP && !editData.blocked_ips.includes(newBlockedIP)) {
      setEditData({ ...editData, blocked_ips: [...editData.blocked_ips, newBlockedIP] });
      setNewBlockedIP('');
    }
  };

  const removeBlockedIP = (ip) => {
    setEditData({ ...editData, blocked_ips: editData.blocked_ips.filter(i => i !== ip) });
  };

  const addNote = () => {
    if (newNote) {
      const note = {
        note: newNote,
        author: 'Admin',
        timestamp: new Date().toISOString(),
        note_type: 'general'
      };
      setEditData({ ...editData, internal_notes: [...editData.internal_notes, note] });
      setNewNote('');
    }
  };

  const handleChangePassword = async () => {
    // Validation
    if (!newPassword || !confirmPassword) {
      setPasswordError('Both password fields are required');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${user.user_id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ new_password: newPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to change password');
      }

      // Success
      alert(`✅ Password changed successfully for ${user.name}!`);
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
      setShowPassword(false);
    } catch (error) {
      setPasswordError(error.message || 'Failed to change password');
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
          <input
            type="text"
            required
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
          <input
            type="email"
            required
            value={editData.email}
            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="john@example.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            value={editData.phone}
            onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="+1 234 567 8900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
          <input
            type="text"
            value={editData.company}
            onChange={(e) => setEditData({ ...editData, company: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="Acme Inc."
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
          <input
            type="text"
            value={editData.job_title}
            onChange={(e) => setEditData({ ...editData, job_title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="CEO"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Avatar URL</label>
          <input
            type="url"
            value={editData.avatar_url}
            onChange={(e) => setEditData({ ...editData, avatar_url: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="https://..."
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
        <input
          type="text"
          value={editData.address}
          onChange={(e) => setEditData({ ...editData, address: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          placeholder="123 Main St, City, Country"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
        <textarea
          value={editData.bio}
          onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          placeholder="Tell us about yourself..."
        />
      </div>
    </div>
  );

  const renderPermissions = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
        <select
          value={editData.role}
          onChange={(e) => setEditData({ ...editData, role: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          <option value="user">User</option>
          <option value="moderator">Moderator</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="border-t pt-6">
        <h4 className="text-lg font-semibold mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-purple-600" />
          Granular Permissions
        </h4>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(editData.permissions).map(([key, value]) => (
            <label key={key} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setEditData({
                  ...editData,
                  permissions: { ...editData.permissions, [key]: e.target.checked }
                })}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="text-sm text-gray-700">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
          <select
            value={editData.status}
            onChange={(e) => setEditData({ ...editData, status: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Sessions</label>
          <input
            type="number"
            value={editData.max_sessions}
            onChange={(e) => setEditData({ ...editData, max_sessions: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
          <input
            type="checkbox"
            checked={editData.email_verified}
            onChange={(e) => setEditData({ ...editData, email_verified: e.target.checked })}
            className="w-4 h-4 text-purple-600 rounded"
          />
          <span className="text-sm text-gray-700">Email Verified</span>
        </label>
        <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
          <input
            type="checkbox"
            checked={editData.two_factor_enabled}
            onChange={(e) => setEditData({ ...editData, two_factor_enabled: e.target.checked })}
            className="w-4 h-4 text-purple-600 rounded"
          />
          <span className="text-sm text-gray-700">2FA Enabled</span>
        </label>
      </div>

      <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
        <input
          type="checkbox"
          checked={editData.force_password_change}
          onChange={(e) => setEditData({ ...editData, force_password_change: e.target.checked })}
          className="w-4 h-4 text-purple-600 rounded"
        />
        <span className="text-sm text-gray-700">Force Password Change on Next Login</span>
      </label>

      {/* Change Password Section */}
      <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-purple-600" />
          <h3 className="text-sm font-semibold text-gray-800">Change User Password</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordError('');
                }}
                placeholder="Enter new password"
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPasswordError('');
              }}
              placeholder="Confirm new password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {passwordError && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{passwordError}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Info className="w-4 h-4" />
            <span>Password must be at least 8 characters long</span>
          </div>

          <Button
            type="button"
            onClick={handleChangePassword}
            disabled={!newPassword || !confirmPassword}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Key className="w-4 h-4 mr-2" />
            Update Password
          </Button>
        </div>
      </div>

      {/* Allowed IPs */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Allowed IP Addresses</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newAllowedIP}
            onChange={(e) => setNewAllowedIP(e.target.value)}
            placeholder="192.168.1.1"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
          <Button type="button" onClick={addAllowedIP} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {editData.allowed_ips.map((ip, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              {ip}
              <button onClick={() => removeAllowedIP(ip)} className="hover:text-green-900">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Blocked IPs */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Blocked IP Addresses</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newBlockedIP}
            onChange={(e) => setNewBlockedIP(e.target.value)}
            placeholder="10.0.0.1"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
          <Button type="button" onClick={addBlockedIP} className="bg-red-600 hover:bg-red-700">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {editData.blocked_ips.map((ip, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
              {ip}
              <button onClick={() => removeBlockedIP(ip)} className="hover:text-red-900">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSubscription = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Plan</label>
          <select
            value={editData.plan_id}
            onChange={(e) => setEditData({ ...editData, plan_id: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="free">Free</option>
            <option value="starter">Starter</option>
            <option value="professional">Professional</option>
            <option value="enterprise">Enterprise</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Stripe Customer ID</label>
          <input
            type="text"
            value={editData.stripe_customer_id}
            onChange={(e) => setEditData({ ...editData, stripe_customer_id: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="cus_..."
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Billing Email</label>
          <input
            type="email"
            value={editData.billing_email}
            onChange={(e) => setEditData({ ...editData, billing_email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Discount Code</label>
          <input
            type="text"
            value={editData.discount_code}
            onChange={(e) => setEditData({ ...editData, discount_code: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
        <input
          type="checkbox"
          checked={editData.lifetime_access}
          onChange={(e) => setEditData({ ...editData, lifetime_access: e.target.checked })}
          className="w-4 h-4 text-purple-600 rounded"
        />
        <div>
          <span className="text-sm font-medium text-gray-700">Lifetime Access</span>
          <p className="text-xs text-gray-500">User will never be charged</p>
        </div>
      </label>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Custom Pricing ($/month)</label>
        <input
          type="number"
          step="0.01"
          value={editData.custom_pricing || ''}
          onChange={(e) => setEditData({ ...editData, custom_pricing: e.target.value ? parseFloat(e.target.value) : null })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          placeholder="99.99"
        />
      </div>
    </div>
  );

  const renderLimitsAndFeatures = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-yellow-600" />
          Custom Limits (Override Plan Limits)
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Max Chatbots</label>
            <input
              type="number"
              value={editData.custom_limits.max_chatbots || ''}
              onChange={(e) => setEditData({
                ...editData,
                custom_limits: { ...editData.custom_limits, max_chatbots: e.target.value ? parseInt(e.target.value) : null }
              })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Unlimited"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Max Messages/Month</label>
            <input
              type="number"
              value={editData.custom_limits.max_messages_per_month || ''}
              onChange={(e) => setEditData({
                ...editData,
                custom_limits: { ...editData.custom_limits, max_messages_per_month: e.target.value ? parseInt(e.target.value) : null }
              })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Unlimited"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Max File Uploads</label>
            <input
              type="number"
              value={editData.custom_limits.max_file_uploads || ''}
              onChange={(e) => setEditData({
                ...editData,
                custom_limits: { ...editData.custom_limits, max_file_uploads: e.target.value ? parseInt(e.target.value) : null }
              })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Unlimited"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Max Storage (MB)</label>
            <input
              type="number"
              value={editData.custom_limits.max_storage_mb || ''}
              onChange={(e) => setEditData({
                ...editData,
                custom_limits: { ...editData.custom_limits, max_storage_mb: e.target.value ? parseInt(e.target.value) : null }
              })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Unlimited"
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-4 flex items-center">
          <Star className="w-5 h-5 mr-2 text-purple-600" />
          Feature Flags
        </h4>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(editData.feature_flags).map(([key, value]) => (
            <label key={key} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setEditData({
                  ...editData,
                  feature_flags: { ...editData.feature_flags, [key]: e.target.checked }
                })}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="text-sm text-gray-700">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-blue-600" />
          API Rate Limits
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Requests/Minute</label>
            <input
              type="number"
              value={editData.api_rate_limits.requests_per_minute}
              onChange={(e) => setEditData({
                ...editData,
                api_rate_limits: { ...editData.api_rate_limits, requests_per_minute: parseInt(e.target.value) }
              })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Requests/Hour</label>
            <input
              type="number"
              value={editData.api_rate_limits.requests_per_hour}
              onChange={(e) => setEditData({
                ...editData,
                api_rate_limits: { ...editData.api_rate_limits, requests_per_hour: parseInt(e.target.value) }
              })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Requests/Day</label>
            <input
              type="number"
              value={editData.api_rate_limits.requests_per_day}
              onChange={(e) => setEditData({
                ...editData,
                api_rate_limits: { ...editData.api_rate_limits, requests_per_day: parseInt(e.target.value) }
              })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Burst Limit</label>
            <input
              type="number"
              value={editData.api_rate_limits.burst_limit}
              onChange={(e) => setEditData({
                ...editData,
                api_rate_limits: { ...editData.api_rate_limits, burst_limit: parseInt(e.target.value) }
              })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearance = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
          <select
            value={editData.timezone}
            onChange={(e) => setEditData({ ...editData, timezone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">London</option>
            <option value="Europe/Paris">Paris</option>
            <option value="Asia/Tokyo">Tokyo</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
          <select
            value={editData.language}
            onChange={(e) => setEditData({ ...editData, language: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="ja">Japanese</option>
            <option value="zh">Chinese</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
          <select
            value={editData.theme}
            onChange={(e) => setEditData({ ...editData, theme: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-4 flex items-center">
          <Palette className="w-5 h-5 mr-2 text-purple-600" />
          Custom Branding
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Logo URL</label>
            <input
              type="url"
              value={editData.branding.logo_url}
              onChange={(e) => setEditData({
                ...editData,
                branding: { ...editData.branding, logo_url: e.target.value }
              })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Favicon URL</label>
            <input
              type="url"
              value={editData.branding.favicon_url}
              onChange={(e) => setEditData({
                ...editData,
                branding: { ...editData.branding, favicon_url: e.target.value }
              })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="https://..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Primary Color</label>
              <input
                type="color"
                value={editData.branding.primary_color}
                onChange={(e) => setEditData({
                  ...editData,
                  branding: { ...editData.branding, primary_color: e.target.value }
                })}
                className="w-full h-10 px-2 py-1 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Secondary Color</label>
              <input
                type="color"
                value={editData.branding.secondary_color}
                onChange={(e) => setEditData({
                  ...editData,
                  branding: { ...editData.branding, secondary_color: e.target.value }
                })}
                className="w-full h-10 px-2 py-1 border rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Font Family</label>
            <select
              value={editData.branding.font_family}
              onChange={(e) => setEditData({
                ...editData,
                branding: { ...editData.branding, font_family: e.target.value }
              })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="Inter">Inter</option>
              <option value="Poppins">Poppins</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Montserrat">Montserrat</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Custom CSS</label>
        <textarea
          value={editData.custom_css}
          onChange={(e) => setEditData({ ...editData, custom_css: e.target.value })}
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
          placeholder=".custom-class { color: #7c3aed; }"
        />
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
          <input
            type="checkbox"
            checked={editData.email_notifications}
            onChange={(e) => setEditData({ ...editData, email_notifications: e.target.checked })}
            className="w-4 h-4 text-purple-600 rounded"
          />
          <span className="text-sm text-gray-700">Email Notifications</span>
        </label>
        <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
          <input
            type="checkbox"
            checked={editData.marketing_emails}
            onChange={(e) => setEditData({ ...editData, marketing_emails: e.target.checked })}
            className="w-4 h-4 text-purple-600 rounded"
          />
          <span className="text-sm text-gray-700">Marketing Emails</span>
        </label>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-4 flex items-center">
          <Bell className="w-5 h-5 mr-2 text-blue-600" />
          Notification Preferences
        </h4>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(editData.notification_preferences).map(([key, value]) => (
            <label key={key} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setEditData({
                  ...editData,
                  notification_preferences: { ...editData.notification_preferences, [key]: e.target.checked }
                })}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="text-sm text-gray-700">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMetadata = () => (
    <div className="space-y-6">
      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add tag..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          />
          <Button type="button" onClick={addTag} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {editData.tags.map((tag, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
              {tag}
              <button onClick={() => removeTag(tag)} className="hover:text-purple-900">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Segments */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Segments</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newSegment}
            onChange={(e) => setNewSegment(e.target.value)}
            placeholder="Add segment..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSegment())}
          />
          <Button type="button" onClick={addSegment} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {editData.segments.map((segment, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {segment}
              <button onClick={() => removeSegment(segment)} className="hover:text-blue-900">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Fields */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Custom Fields</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newCustomField.key}
            onChange={(e) => setNewCustomField({ ...newCustomField, key: e.target.value })}
            placeholder="Field name..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="text"
            value={newCustomField.value}
            onChange={(e) => setNewCustomField({ ...newCustomField, value: e.target.value })}
            placeholder="Field value..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
          <Button type="button" onClick={addCustomField} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {Object.entries(editData.custom_fields).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="font-medium text-sm text-gray-700">{key}:</span>
                <span className="ml-2 text-sm text-gray-600">{value}</span>
              </div>
              <button onClick={() => removeCustomField(key)} className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
        <textarea
          value={editData.admin_notes}
          onChange={(e) => setEditData({ ...editData, admin_notes: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          placeholder="Internal notes..."
        />
      </div>

      {/* Internal Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Internal Notes History</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add note..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
          <Button type="button" onClick={addNote} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {editData.internal_notes.map((note, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-600">{note.author}</span>
                <span className="text-xs text-gray-500">
                  {new Date(note.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-700">{note.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAPI = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={editData.api_key}
            readOnly
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
            placeholder="Auto-generated"
          />
          <Button type="button" className="bg-purple-600 hover:bg-purple-700">
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
        <input
          type="url"
          value={editData.webhook_url}
          onChange={(e) => setEditData({ ...editData, webhook_url: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          placeholder="https://your-webhook.com/endpoint"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Webhook Events</label>
        <div className="grid grid-cols-2 gap-3">
          {['user.created', 'user.updated', 'chatbot.created', 'message.sent', 'conversation.started'].map(event => (
            <label key={event} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={editData.webhook_events.includes(event)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setEditData({ ...editData, webhook_events: [...editData.webhook_events, event] });
                  } else {
                    setEditData({ ...editData, webhook_events: editData.webhook_events.filter(ev => ev !== event) });
                  }
                }}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="text-sm text-gray-700">{event}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTracking = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
          <input
            type="checkbox"
            checked={editData.tracking_enabled}
            onChange={(e) => setEditData({ ...editData, tracking_enabled: e.target.checked })}
            className="w-4 h-4 text-purple-600 rounded"
          />
          <span className="text-sm text-gray-700">Tracking Enabled</span>
        </label>
        <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
          <input
            type="checkbox"
            checked={editData.analytics_enabled}
            onChange={(e) => setEditData({ ...editData, analytics_enabled: e.target.checked })}
            className="w-4 h-4 text-purple-600 rounded"
          />
          <span className="text-sm text-gray-700">Analytics Enabled</span>
        </label>
      </div>

      <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
        <input
          type="checkbox"
          checked={editData.onboarding_completed}
          onChange={(e) => setEditData({ ...editData, onboarding_completed: e.target.checked })}
          className="w-4 h-4 text-purple-600 rounded"
        />
        <div>
          <span className="text-sm font-medium text-gray-700">Onboarding Completed</span>
          <p className="text-xs text-gray-500">Mark user as completed onboarding</p>
        </div>
      </label>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Onboarding Step</label>
        <input
          type="number"
          value={editData.onboarding_step}
          onChange={(e) => setEditData({ ...editData, onboarding_step: parseInt(e.target.value) })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          min="0"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Activity Information</h4>
        <div className="space-y-1 text-sm text-blue-800">
          <p><strong>Last Activity:</strong> {editData.last_activity_at ? new Date(editData.last_activity_at).toLocaleString() : 'Never'}</p>
          <p><strong>User ID:</strong> {user?.user_id || user?.id}</p>
          <p><strong>Created:</strong> {user?.created_at ? new Date(user.created_at).toLocaleString() : 'Unknown'}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full h-[90vh] flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ultimate User Editor</h2>
            <p className="text-sm text-gray-500 mt-1">Complete control over user account and settings</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6 overflow-x-auto">
          <div className="flex space-x-1 min-w-max">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {tab.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {activeTab === 'basic' && renderBasicInfo()}
          {activeTab === 'permissions' && renderPermissions()}
          {activeTab === 'security' && renderSecurity()}
          {activeTab === 'subscription' && renderSubscription()}
          {activeTab === 'limits' && renderLimitsAndFeatures()}
          {activeTab === 'appearance' && renderAppearance()}
          {activeTab === 'notifications' && renderNotifications()}
          {activeTab === 'metadata' && renderMetadata()}
          {activeTab === 'api' && renderAPI()}
          {activeTab === 'tracking' && renderTracking()}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between rounded-b-xl">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Info className="w-4 h-4" />
            <span>Changes will be saved immediately</span>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white min-w-[120px]"
            >
              {saving ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UltimateEditUserModal;
