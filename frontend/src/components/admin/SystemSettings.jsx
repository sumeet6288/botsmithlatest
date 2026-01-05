import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, Zap, Mail, Shield, Database, Globe, Lock, Plug, Image, Clock, Languages, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../ui/button';

const SystemSettings = ({ backendUrl }) => {
  const [settings, setSettings] = useState({
    // Existing settings
    maintenance_mode: false,
    allow_registrations: true,
    default_plan: 'Free',
    max_chatbots_per_user: 1,
    email_notifications: true,
    auto_moderation: false,
    ai_providers: {
      openai: { enabled: true, rate_limit: 100 },
      anthropic: { enabled: true, rate_limit: 100 },
      google: { enabled: true, rate_limit: 100 }
    },
    // Platform Settings
    platform: {
      site_name: 'BotSmith',
      site_logo_url: '',
      timezone: 'UTC',
      default_language: 'en',
      support_email: 'support@botsmith.com',
      admin_email: 'admin@botsmith.com'
    },
    // Authentication Settings
    authentication: {
      require_email_verification: true,
      enable_oauth: true,
      oauth_providers: {
        google: { enabled: false, client_id: '', client_secret: '' },
        github: { enabled: false, client_id: '', client_secret: '' },
        microsoft: { enabled: false, client_id: '', client_secret: '' }
      },
      password_policy: {
        min_length: 8,
        require_uppercase: true,
        require_lowercase: true,
        require_numbers: true,
        require_special_chars: true,
        password_expiry_days: 90
      },
      two_factor_auth: {
        enforce_for_admins: true,
        enforce_for_all_users: false,
        allowed_methods: ['app', 'sms', 'email']
      },
      session_settings: {
        session_timeout_minutes: 1440,
        max_concurrent_sessions: 3,
        remember_me_duration_days: 30
      },
      auto_approve_registrations: true,
      allowed_email_domains: '',
      blocked_email_domains: 'tempmail.com,throwaway.email,guerrillamail.com',
      registration_welcome_message: 'Welcome to BotSmith! Start building amazing AI chatbots today.',
      failed_login_attempts_limit: 5,
      account_lockout_duration_minutes: 30
    },
    // Integrations Management
    integrations: {
      slack: { enabled: true, max_per_chatbot: 5 },
      telegram: { enabled: true, max_per_chatbot: 5 },
      discord: { enabled: true, max_per_chatbot: 5 },
      whatsapp: { enabled: true, max_per_chatbot: 3 },
      messenger: { enabled: false, max_per_chatbot: 3 },
      instagram: { enabled: false, max_per_chatbot: 3 },
      teams: { enabled: false, max_per_chatbot: 3 },
      webchat: { enabled: true, max_per_chatbot: 10 },
      api: { enabled: true, max_per_chatbot: 10 }
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/api/admin/settings`);
      const data = await response.json();
      // Merge fetched data with default structure
      setSettings(prevSettings => ({
        ...prevSettings,
        ...data,
        platform: { ...prevSettings.platform, ...(data.platform || {}) },
        authentication: { 
          ...prevSettings.authentication, 
          ...(data.authentication || {}),
          oauth_providers: { ...prevSettings.authentication.oauth_providers, ...(data.authentication?.oauth_providers || {}) },
          password_policy: { ...prevSettings.authentication.password_policy, ...(data.authentication?.password_policy || {}) },
          two_factor_auth: { ...prevSettings.authentication.two_factor_auth, ...(data.authentication?.two_factor_auth || {}) },
          session_settings: { ...prevSettings.authentication.session_settings, ...(data.authentication?.session_settings || {}) }
        },
        integrations: { ...prevSettings.integrations, ...(data.integrations || {}) }
      }));
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${backendUrl}/api/admin/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await response.json();
      if (data.success) {
        alert('✅ Settings saved successfully!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('❌ Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">System Settings</h2>
            <p className="text-gray-600">Configure global system parameters and features</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={fetchSettings} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={saveSettings} disabled={saving} className="bg-purple-600 hover:bg-purple-700">
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Settings className="w-6 h-6 text-purple-600" />
          General Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-semibold">Maintenance Mode</div>
              <div className="text-sm text-gray-600">Disable user access for maintenance</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.maintenance_mode || false}
                onChange={(e) => setSettings({...settings, maintenance_mode: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-semibold">Allow Registrations</div>
              <div className="text-sm text-gray-600">Enable new user signups</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.allow_registrations !== false}
                onChange={(e) => setSettings({...settings, allow_registrations: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="block font-semibold mb-2">Default Plan</label>
            <select
              value={settings?.default_plan || 'Free'}
              onChange={(e) => setSettings({...settings, default_plan: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="Free">Free</option>
              <option value="Starter">Starter</option>
              <option value="Professional">Professional</option>
            </select>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="block font-semibold mb-2">Max Chatbots Per User</label>
            <input
              type="number"
              value={settings?.max_chatbots_per_user || 1}
              onChange={(e) => setSettings({...settings, max_chatbots_per_user: parseInt(e.target.value)})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* AI Provider Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Zap className="w-6 h-6 text-blue-600" />
          AI Provider Settings
        </h3>
        <div className="space-y-4">
          {settings?.ai_providers && Object.entries(settings.ai_providers).map(([provider, config]) => (
            <div key={provider} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="font-semibold capitalize">{provider}</div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={(e) => {
                      const newProviders = {...settings.ai_providers};
                      newProviders[provider].enabled = e.target.checked;
                      setSettings({...settings, ai_providers: newProviders});
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rate Limit (requests/min)</label>
                <input
                  type="number"
                  value={config.rate_limit || 100}
                  onChange={(e) => {
                    const newProviders = {...settings.ai_providers};
                    newProviders[provider].rate_limit = parseInt(e.target.value);
                    setSettings({...settings, ai_providers: newProviders});
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Email & Notifications */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Mail className="w-6 h-6 text-green-600" />
          Email & Notifications
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-semibold">Email Notifications</div>
              <div className="text-sm text-gray-600">Send email notifications to users</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.email_notifications !== false}
                onChange={(e) => setSettings({...settings, email_notifications: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Shield className="w-6 h-6 text-red-600" />
          Security & Moderation
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-semibold">Auto-Moderation</div>
              <div className="text-sm text-gray-600">Automatically flag suspicious conversations</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.auto_moderation || false}
                onChange={(e) => setSettings({...settings, auto_moderation: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Platform Settings */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Globe className="w-6 h-6 text-indigo-600" />
          Platform Settings
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-lg border border-indigo-100">
            <label className="block font-semibold mb-2 text-indigo-900">Site Name</label>
            <input
              type="text"
              value={settings.platform?.site_name || ''}
              onChange={(e) => setSettings({...settings, platform: {...settings.platform, site_name: e.target.value}})}
              className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="BotSmith"
            />
            <p className="text-xs text-gray-500 mt-1">This name appears in emails and page titles</p>
          </div>

          <div className="p-4 bg-white rounded-lg border border-indigo-100">
            <label className="block font-semibold mb-2 text-indigo-900 flex items-center gap-2">
              <Image className="w-4 h-4" />
              Site Logo URL
            </label>
            <input
              type="text"
              value={settings.platform?.site_logo_url || ''}
              onChange={(e) => setSettings({...settings, platform: {...settings.platform, site_logo_url: e.target.value}})}
              className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="https://example.com/logo.png"
            />
            <p className="text-xs text-gray-500 mt-1">Full URL to your logo image</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg border border-indigo-100">
              <label className="block font-semibold mb-2 text-indigo-900 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Timezone
              </label>
              <select
                value={settings.platform?.timezone || 'UTC'}
                onChange={(e) => setSettings({...settings, platform: {...settings.platform, timezone: e.target.value}})}
                className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">EST (New York)</option>
                <option value="America/Chicago">CST (Chicago)</option>
                <option value="America/Denver">MST (Denver)</option>
                <option value="America/Los_Angeles">PST (Los Angeles)</option>
                <option value="Europe/London">GMT (London)</option>
                <option value="Europe/Paris">CET (Paris)</option>
                <option value="Asia/Tokyo">JST (Tokyo)</option>
                <option value="Asia/Shanghai">CST (Shanghai)</option>
                <option value="Australia/Sydney">AEST (Sydney)</option>
              </select>
            </div>

            <div className="p-4 bg-white rounded-lg border border-indigo-100">
              <label className="block font-semibold mb-2 text-indigo-900 flex items-center gap-2">
                <Languages className="w-4 h-4" />
                Default Language
              </label>
              <select
                value={settings.platform?.default_language || 'en'}
                onChange={(e) => setSettings({...settings, platform: {...settings.platform, default_language: e.target.value}})}
                className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="zh">Chinese</option>
                <option value="ja">Japanese</option>
                <option value="pt">Portuguese</option>
                <option value="ar">Arabic</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg border border-indigo-100">
              <label className="block font-semibold mb-2 text-indigo-900">Support Email</label>
              <input
                type="email"
                value={settings.platform?.support_email || ''}
                onChange={(e) => setSettings({...settings, platform: {...settings.platform, support_email: e.target.value}})}
                className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="support@example.com"
              />
            </div>

            <div className="p-4 bg-white rounded-lg border border-indigo-100">
              <label className="block font-semibold mb-2 text-indigo-900">Admin Email</label>
              <input
                type="email"
                value={settings.platform?.admin_email || ''}
                onChange={(e) => setSettings({...settings, platform: {...settings.platform, admin_email: e.target.value}})}
                className="w-full px-4 py-2 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="admin@example.com"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Registration & Authentication */}
      <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl border-2 border-rose-200 p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Lock className="w-6 h-6 text-rose-600" />
          Registration & Authentication
        </h3>
        
        {/* Registration Settings */}
        <div className="mb-6">
          <h4 className="font-bold text-rose-900 mb-4">Registration Settings</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-rose-100">
              <div>
                <div className="font-semibold text-rose-900">Allow New Registrations</div>
                <div className="text-sm text-gray-600">Enable new users to create accounts</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings?.allow_registrations !== false}
                  onChange={(e) => setSettings({...settings, allow_registrations: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-rose-100">
              <div>
                <div className="font-semibold text-rose-900">Auto-Approve Registrations</div>
                <div className="text-sm text-gray-600">Automatically approve new user accounts</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.authentication?.auto_approve_registrations !== false}
                  onChange={(e) => setSettings({...settings, authentication: {...settings.authentication, auto_approve_registrations: e.target.checked}})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>

            <div className="p-4 bg-white rounded-lg border border-rose-100">
              <label className="block font-semibold text-rose-900 mb-2">Allowed Email Domains</label>
              <p className="text-xs text-gray-600 mb-3">Comma-separated list of allowed email domains (e.g., company.com, partner.com). Leave empty to allow all domains.</p>
              <input
                type="text"
                value={settings.authentication?.allowed_email_domains || ''}
                onChange={(e) => setSettings({...settings, authentication: {...settings.authentication, allowed_email_domains: e.target.value}})}
                placeholder="company.com, partner.com"
                className="w-full px-4 py-2 border-2 border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="p-4 bg-white rounded-lg border border-rose-100">
              <label className="block font-semibold text-rose-900 mb-2">Blocked Email Domains</label>
              <p className="text-xs text-gray-600 mb-3">Comma-separated list of blocked email domains (e.g., tempmail.com). Users from these domains cannot register.</p>
              <input
                type="text"
                value={settings.authentication?.blocked_email_domains || ''}
                onChange={(e) => setSettings({...settings, authentication: {...settings.authentication, blocked_email_domains: e.target.value}})}
                placeholder="tempmail.com, disposable.com"
                className="w-full px-4 py-2 border-2 border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="p-4 bg-white rounded-lg border border-rose-100">
              <label className="block font-semibold text-rose-900 mb-2">Registration Welcome Message</label>
              <p className="text-xs text-gray-600 mb-3">Custom message shown to new users after successful registration</p>
              <textarea
                value={settings.authentication?.registration_welcome_message || 'Welcome to BotSmith! Start building amazing AI chatbots today.'}
                onChange={(e) => setSettings({...settings, authentication: {...settings.authentication, registration_welcome_message: e.target.value}})}
                rows={3}
                className="w-full px-4 py-2 border-2 border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>
        </div>

        {/* Basic Auth Settings */}
        <div className="mb-6">
          <h4 className="font-bold text-rose-900 mb-4">Authentication Settings</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-rose-100">
              <div>
                <div className="font-semibold text-rose-900">Require Email Verification</div>
                <div className="text-sm text-gray-600">Users must verify email before accessing features</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.authentication?.require_email_verification !== false}
                  onChange={(e) => setSettings({...settings, authentication: {...settings.authentication, require_email_verification: e.target.checked}})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-rose-100">
              <div>
                <div className="font-semibold text-rose-900">Enable OAuth Login</div>
                <div className="text-sm text-gray-600">Allow users to sign in with third-party providers</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.authentication?.enable_oauth !== false}
                  onChange={(e) => setSettings({...settings, authentication: {...settings.authentication, enable_oauth: e.target.checked}})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>

            <div className="p-4 bg-white rounded-lg border border-rose-100">
              <label className="block font-semibold text-rose-900 mb-2">Failed Login Attempts Limit</label>
              <p className="text-xs text-gray-600 mb-3">Number of failed login attempts before account lockout (0 = unlimited)</p>
              <input
                type="number"
                min="0"
                max="10"
                value={settings.authentication?.failed_login_attempts_limit || 5}
                onChange={(e) => setSettings({...settings, authentication: {...settings.authentication, failed_login_attempts_limit: parseInt(e.target.value)}})}
                className="w-full px-4 py-2 border-2 border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="p-4 bg-white rounded-lg border border-rose-100">
              <label className="block font-semibold text-rose-900 mb-2">Account Lockout Duration (minutes)</label>
              <p className="text-xs text-gray-600 mb-3">How long to lock account after failed login attempts</p>
              <input
                type="number"
                min="5"
                max="1440"
                value={settings.authentication?.account_lockout_duration_minutes || 30}
                onChange={(e) => setSettings({...settings, authentication: {...settings.authentication, account_lockout_duration_minutes: parseInt(e.target.value)}})}
                className="w-full px-4 py-2 border-2 border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>
        </div>

        {/* OAuth Providers */}
        {settings.authentication?.enable_oauth && (
          <div className="mb-6">
            <h4 className="font-bold text-rose-900 mb-4 flex items-center gap-2">
              <Plug className="w-5 h-5" />
              OAuth Providers
            </h4>
            <div className="space-y-3">
              {Object.entries(settings.authentication?.oauth_providers || {}).map(([provider, config]) => (
                <div key={provider} className="p-4 bg-white border border-rose-100 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        provider === 'google' ? 'bg-red-100' :
                        provider === 'github' ? 'bg-gray-100' :
                        'bg-blue-100'
                      }`}>
                        <span className="text-lg font-bold">{provider[0].toUpperCase()}</span>
                      </div>
                      <div>
                        <div className="font-semibold capitalize">{provider}</div>
                        <div className="text-xs text-gray-500">OAuth 2.0 Provider</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.enabled || false}
                        onChange={(e) => {
                          const newProviders = {...settings.authentication.oauth_providers};
                          newProviders[provider].enabled = e.target.checked;
                          setSettings({...settings, authentication: {...settings.authentication, oauth_providers: newProviders}});
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                    </label>
                  </div>
                  {config.enabled && (
                    <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-rose-100">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Client ID</label>
                        <input
                          type="text"
                          value={config.client_id || ''}
                          onChange={(e) => {
                            const newProviders = {...settings.authentication.oauth_providers};
                            newProviders[provider].client_id = e.target.value;
                            setSettings({...settings, authentication: {...settings.authentication, oauth_providers: newProviders}});
                          }}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-rose-500"
                          placeholder="Enter client ID"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Client Secret</label>
                        <input
                          type="password"
                          value={config.client_secret || ''}
                          onChange={(e) => {
                            const newProviders = {...settings.authentication.oauth_providers};
                            newProviders[provider].client_secret = e.target.value;
                            setSettings({...settings, authentication: {...settings.authentication, oauth_providers: newProviders}});
                          }}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-rose-500"
                          placeholder="Enter client secret"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Password Policy */}
        <div className="mb-6">
          <h4 className="font-bold text-rose-900 mb-4">Password Policy</h4>
          <div className="bg-white border border-rose-100 rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Length</label>
                <input
                  type="number"
                  min="6"
                  max="32"
                  value={settings.authentication?.password_policy?.min_length || 8}
                  onChange={(e) => setSettings({...settings, authentication: {...settings.authentication, password_policy: {...settings.authentication.password_policy, min_length: parseInt(e.target.value)}}})}
                  className="w-full px-4 py-2 border-2 border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password Expiry (days)</label>
                <input
                  type="number"
                  min="0"
                  max="365"
                  value={settings.authentication?.password_policy?.password_expiry_days || 90}
                  onChange={(e) => setSettings({...settings, authentication: {...settings.authentication, password_policy: {...settings.authentication.password_policy, password_expiry_days: parseInt(e.target.value)}}})}
                  className="w-full px-4 py-2 border-2 border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-500"
                />
                <p className="text-xs text-gray-500 mt-1">0 = never expires</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-rose-50 rounded-lg">
                <span className="text-sm font-medium">Require Uppercase</span>
                <input
                  type="checkbox"
                  checked={settings.authentication?.password_policy?.require_uppercase !== false}
                  onChange={(e) => setSettings({...settings, authentication: {...settings.authentication, password_policy: {...settings.authentication.password_policy, require_uppercase: e.target.checked}}})}
                  className="w-5 h-5 text-rose-600 rounded focus:ring-rose-500"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-rose-50 rounded-lg">
                <span className="text-sm font-medium">Require Lowercase</span>
                <input
                  type="checkbox"
                  checked={settings.authentication?.password_policy?.require_lowercase !== false}
                  onChange={(e) => setSettings({...settings, authentication: {...settings.authentication, password_policy: {...settings.authentication.password_policy, require_lowercase: e.target.checked}}})}
                  className="w-5 h-5 text-rose-600 rounded focus:ring-rose-500"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-rose-50 rounded-lg">
                <span className="text-sm font-medium">Require Numbers</span>
                <input
                  type="checkbox"
                  checked={settings.authentication?.password_policy?.require_numbers !== false}
                  onChange={(e) => setSettings({...settings, authentication: {...settings.authentication, password_policy: {...settings.authentication.password_policy, require_numbers: e.target.checked}}})}
                  className="w-5 h-5 text-rose-600 rounded focus:ring-rose-500"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-rose-50 rounded-lg">
                <span className="text-sm font-medium">Require Special Chars</span>
                <input
                  type="checkbox"
                  checked={settings.authentication?.password_policy?.require_special_chars !== false}
                  onChange={(e) => setSettings({...settings, authentication: {...settings.authentication, password_policy: {...settings.authentication.password_policy, require_special_chars: e.target.checked}}})}
                  className="w-5 h-5 text-rose-600 rounded focus:ring-rose-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="mb-6">
          <h4 className="font-bold text-rose-900 mb-4">Two-Factor Authentication (2FA)</h4>
          <div className="bg-white border border-rose-100 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between p-3 bg-rose-50 rounded-lg">
              <div>
                <div className="font-semibold">Enforce 2FA for Admins</div>
                <div className="text-xs text-gray-600">All admin users must enable 2FA</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.authentication?.two_factor_auth?.enforce_for_admins !== false}
                  onChange={(e) => setSettings({...settings, authentication: {...settings.authentication, two_factor_auth: {...settings.authentication.two_factor_auth, enforce_for_admins: e.target.checked}}})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-rose-50 rounded-lg">
              <div>
                <div className="font-semibold">Enforce 2FA for All Users</div>
                <div className="text-xs text-gray-600">All users must enable 2FA to use the platform</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.authentication?.two_factor_auth?.enforce_for_all_users || false}
                  onChange={(e) => setSettings({...settings, authentication: {...settings.authentication, two_factor_auth: {...settings.authentication.two_factor_auth, enforce_for_all_users: e.target.checked}}})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Allowed 2FA Methods</label>
              <div className="flex gap-3">
                {['app', 'sms', 'email'].map(method => (
                  <label key={method} className="flex items-center gap-2 p-2 bg-rose-50 rounded cursor-pointer hover:bg-rose-100">
                    <input
                      type="checkbox"
                      checked={(settings.authentication?.two_factor_auth?.allowed_methods || []).includes(method)}
                      onChange={(e) => {
                        const currentMethods = settings.authentication?.two_factor_auth?.allowed_methods || [];
                        const newMethods = e.target.checked
                          ? [...currentMethods, method]
                          : currentMethods.filter(m => m !== method);
                        setSettings({...settings, authentication: {...settings.authentication, two_factor_auth: {...settings.authentication.two_factor_auth, allowed_methods: newMethods}}});
                      }}
                      className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                    />
                    <span className="text-sm capitalize">{method}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Session Settings */}
        <div>
          <h4 className="font-bold text-rose-900 mb-4">Session Management</h4>
          <div className="bg-white border border-rose-100 rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                <input
                  type="number"
                  min="5"
                  value={settings.authentication?.session_settings?.session_timeout_minutes || 1440}
                  onChange={(e) => setSettings({...settings, authentication: {...settings.authentication, session_settings: {...settings.authentication.session_settings, session_timeout_minutes: parseInt(e.target.value)}}})}
                  className="w-full px-4 py-2 border-2 border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Concurrent Sessions</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={settings.authentication?.session_settings?.max_concurrent_sessions || 3}
                  onChange={(e) => setSettings({...settings, authentication: {...settings.authentication, session_settings: {...settings.authentication.session_settings, max_concurrent_sessions: parseInt(e.target.value)}}})}
                  className="w-full px-4 py-2 border-2 border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Remember Me (days)</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={settings.authentication?.session_settings?.remember_me_duration_days || 30}
                  onChange={(e) => setSettings({...settings, authentication: {...settings.authentication, session_settings: {...settings.authentication.session_settings, remember_me_duration_days: parseInt(e.target.value)}}})}
                  className="w-full px-4 py-2 border-2 border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Integrations Management */}
      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-200 p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Plug className="w-6 h-6 text-cyan-600" />
          Integrations Management
        </h3>
        <p className="text-sm text-gray-600 mb-6">Control which integrations are available to users and set limits per chatbot</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(settings.integrations || {}).map(([integration, config]) => (
            <div key={integration} className="bg-white border-2 border-cyan-100 rounded-xl p-4 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    config.enabled ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gray-200'
                  }`}>
                    {config.enabled ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold capitalize text-cyan-900">{integration}</div>
                    <div className="text-xs text-gray-500">
                      {config.enabled ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enabled || false}
                    onChange={(e) => {
                      const newIntegrations = {...settings.integrations};
                      newIntegrations[integration].enabled = e.target.checked;
                      setSettings({...settings, integrations: newIntegrations});
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-emerald-600"></div>
                </label>
              </div>
              
              {config.enabled && (
                <div className="mt-3 pt-3 border-t border-cyan-100">
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Max per Chatbot
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={config.max_per_chatbot || 5}
                    onChange={(e) => {
                      const newIntegrations = {...settings.integrations};
                      newIntegrations[integration].max_per_chatbot = parseInt(e.target.value);
                      setSettings({...settings, integrations: newIntegrations});
                    }}
                    className="w-full px-3 py-2 text-sm border-2 border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Limit: {config.max_per_chatbot} per chatbot
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-cyan-100 border border-cyan-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">ℹ️</span>
            </div>
            <div className="text-sm text-cyan-900">
              <p className="font-semibold mb-1">Integration Limits</p>
              <p>Disabled integrations won't appear in user chatbot settings. Max limits prevent users from adding too many connections per chatbot.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
