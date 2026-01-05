import React, { useState, useEffect } from 'react';
import { DollarSign, Save, RefreshCw, Key, Store, Webhook, CheckCircle, XCircle, Eye, EyeOff, Copy, Check, AlertTriangle, Zap } from 'lucide-react';
import { Button } from '../ui/button';

const PaymentGatewaySettings = ({ backendUrl }) => {
  const [settings, setSettings] = useState({
    razorpay: {
      enabled: false,
      test_mode: true,
      key_id: '',
      key_secret: '',
      webhook_url: '',
      webhook_secret: '',
      plans: {
        free: '',
        starter: '',
        professional: '',
        enterprise: ''
      }
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showKeyId, setShowKeyId] = useState(false);
  const [showKeySecret, setShowKeySecret] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [copied, setCopied] = useState('');
  const [fetchingPlans, setFetchingPlans] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/api/admin/payment-settings`);
      if (response.ok) {
        const data = await response.json();
        setSettings(data || settings);
      }
    } catch (error) {
      console.error('Error fetching payment settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${backendUrl}/api/admin/payment-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      
      if (response.ok) {
        const data = await response.json();
        alert('✅ Payment gateway settings saved successfully!');
        setConnectionStatus(null);
      } else {
        const error = await response.json();
        alert(`❌ Failed to save settings: ${error.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving payment settings:', error);
      alert('❌ Failed to save payment settings');
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    try {
      setTestingConnection(true);
      setConnectionStatus(null);
      
      const response = await fetch(`${backendUrl}/api/admin/payment-settings/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          api_key: settings.razorpay.key_id,
          store_id: settings.razorpay.key_secret,
          test_mode: settings.razorpay.test_mode
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setConnectionStatus({ 
          success: true, 
          message: data.message || 'Connection successful!',
          store_name: data.store_name
        });
      } else {
        setConnectionStatus({ 
          success: false, 
          message: data.detail || data.message || 'Connection failed. Please check your credentials.'
        });
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      setConnectionStatus({ 
        success: false, 
        message: 'Failed to test connection. Please check your network.'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const fetchPlans = async () => {
    try {
      setFetchingPlans(true);
      
      const response = await fetch(`${backendUrl}/api/admin/payment-settings/fetch-products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          api_key: settings.razorpay.key_id,
          store_id: settings.razorpay.key_secret,
          test_mode: settings.razorpay.test_mode
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        alert(`✅ Found ${data.plans.length} plans!\n\nPlans will be displayed for you to map to subscription tiers.`);
        console.log('Plans:', data.plans);
      } else {
        alert(`❌ Failed to fetch plans: ${data.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      alert('❌ Failed to fetch plans. Please check your network.');
    } finally {
      setFetchingPlans(false);
    }
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(''), 2000);
  };

  const updateSettings = (path, value) => {
    const keys = path.split('.');
    const newSettings = { ...settings };
    let current = newSettings;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setSettings(newSettings);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <DollarSign className="w-6 h-6" />
              Payment Gateway Settings
            </h2>
            <p className="text-purple-100 mt-1">
              Configure Razorpay for subscription payments
            </p>
          </div>
          <Button
            onClick={saveSettings}
            disabled={saving}
            className="bg-white text-purple-600 hover:bg-purple-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* Razorpay Settings */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Razorpay Integration</h3>
              <p className="text-sm text-gray-500">Accept payments via Razorpay</p>
            </div>
          </div>
          
          {/* Enable Toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <span className="text-sm font-medium text-gray-700">Enable Razorpay</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.razorpay.enabled}
                onChange={(e) => updateSettings('razorpay.enabled', e.target.checked)}
                className="sr-only"
              />
              <div className={`w-14 h-8 rounded-full transition-colors ${settings.razorpay.enabled ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gray-300'}`}>
                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out mt-1 ${settings.razorpay.enabled ? 'translate-x-7' : 'translate-x-1'}`} />
              </div>
            </div>
          </label>
        </div>

        {/* Test Mode Toggle */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">Test Mode</p>
              <p className="text-xs text-blue-700">Use test credentials for development</p>
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <span className="text-sm font-medium text-blue-900">Test Mode</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.razorpay.test_mode}
                onChange={(e) => updateSettings('razorpay.test_mode', e.target.checked)}
                className="sr-only"
              />
              <div className={`w-14 h-8 rounded-full transition-colors ${settings.razorpay.test_mode ? 'bg-gradient-to-r from-blue-500 to-cyan-600' : 'bg-gray-300'}`}>
                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out mt-1 ${settings.razorpay.test_mode ? 'translate-x-7' : 'translate-x-1'}`} />
              </div>
            </div>
          </label>
        </div>

        {settings.razorpay.test_mode && settings.razorpay.enabled && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <strong>Warning:</strong> Test mode is active. Real payments will not be processed. Switch to Live Mode before going to production.
            </p>
          </div>
        )}

        {/* API Credentials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Key ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Key className="w-4 h-4" />
              Key ID {settings.razorpay.test_mode && <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Test Mode</span>}
            </label>
            <div className="relative">
              <input
                type={showKeyId ? 'text' : 'password'}
                value={settings.razorpay.key_id}
                onChange={(e) => updateSettings('razorpay.key_id', e.target.value)}
                placeholder="rzp_test_xxxxxxxxxxxxxx"
                className="w-full px-4 py-2 pr-24 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                <button
                  onClick={() => setShowKeyId(!showKeyId)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {showKeyId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => copyToClipboard(settings.razorpay.key_id, 'key_id')}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {copied === 'key_id' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Key Secret */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Key className="w-4 h-4" />
              Key Secret
            </label>
            <div className="relative">
              <input
                type={showKeySecret ? 'text' : 'password'}
                value={settings.razorpay.key_secret}
                onChange={(e) => updateSettings('razorpay.key_secret', e.target.value)}
                placeholder="Your Razorpay Key Secret"
                className="w-full px-4 py-2 pr-24 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                <button
                  onClick={() => setShowKeySecret(!showKeySecret)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {showKeySecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => copyToClipboard(settings.razorpay.key_secret, 'key_secret')}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {copied === 'key_secret' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Test Connection */}
        <div className="flex gap-3">
          <Button
            onClick={testConnection}
            disabled={testingConnection || !settings.razorpay.key_id || !settings.razorpay.key_secret}
            variant="outline"
            className="flex-1"
          >
            {testingConnection ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            {testingConnection ? 'Testing...' : 'Test Connection'}
          </Button>
          
          <Button
            onClick={fetchPlans}
            disabled={fetchingPlans || !settings.razorpay.key_id || !settings.razorpay.key_secret}
            variant="outline"
            className="flex-1"
          >
            {fetchingPlans ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Store className="w-4 h-4 mr-2" />
            )}
            {fetchingPlans ? 'Fetching...' : 'Fetch Plans'}
          </Button>
        </div>

        {/* Connection Status */}
        {connectionStatus && (
          <div className={`p-4 rounded-lg flex items-start gap-3 ${connectionStatus.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            {connectionStatus.success ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`font-medium ${connectionStatus.success ? 'text-green-900' : 'text-red-900'}`}>
                {connectionStatus.message}
              </p>
              {connectionStatus.store_name && (
                <p className="text-sm text-green-700 mt-1">
                  Connected to: {connectionStatus.store_name}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Webhook Settings */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Webhook className="w-4 h-4" />
              Webhook Configuration
            </h4>
            <span className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
              Auto-configured
            </span>
          </div>
          
          {/* Webhook Help/Instructions */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
            <p className="text-sm font-medium text-blue-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              How to Set Up Razorpay Webhooks
            </p>
            <ol className="text-sm text-blue-800 space-y-1 ml-6 list-decimal">
              <li>Copy the Webhook URL below</li>
              <li>Go to Razorpay Dashboard → Settings → Webhooks</li>
              <li>Click "Create New Webhook"</li>
              <li>Paste the Webhook URL</li>
              <li>Select events: subscription.activated, subscription.charged, subscription.cancelled, subscription.paused</li>
              <li>Copy the Webhook Secret from Razorpay and paste it below</li>
              <li>Click Save Settings</li>
            </ol>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Webhook URL <span className="text-xs text-gray-500">(Copy this to Razorpay Dashboard)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={settings.razorpay.webhook_url || `${backendUrl}/api/razorpay/webhook`}
                onChange={(e) => updateSettings('razorpay.webhook_url', e.target.value)}
                placeholder={`${backendUrl}/api/razorpay/webhook`}
                className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 font-mono text-sm"
              />
              <button
                onClick={() => copyToClipboard(settings.razorpay.webhook_url || `${backendUrl}/api/razorpay/webhook`, 'webhook_url')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100 rounded"
              >
                {copied === 'webhook_url' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Webhook Secret <span className="text-xs text-gray-500">(Get this from Razorpay Dashboard)</span>
            </label>
            <div className="relative">
              <input
                type={showWebhookSecret ? 'text' : 'password'}
                value={settings.razorpay.webhook_secret}
                onChange={(e) => updateSettings('razorpay.webhook_secret', e.target.value)}
                placeholder="whsec_xxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-2 pr-24 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                <button
                  onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {showWebhookSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => copyToClipboard(settings.razorpay.webhook_secret, 'webhook_secret')}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {copied === 'webhook_secret' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Webhook Events to Monitor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supported Webhook Events
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                'subscription.activated',
                'subscription.charged',
                'subscription.cancelled',
                'subscription.paused'
              ].map((event) => (
                <div key={event} className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700 font-mono">{event}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Webhook Status Indicator */}
          {settings.razorpay.webhook_secret ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">Webhook Configured</p>
                <p className="text-xs text-green-700">Your webhook is ready to receive events from Razorpay</p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-900">Webhook Not Configured</p>
                <p className="text-xs text-yellow-700">Add your Webhook Secret to enable automatic subscription updates</p>
              </div>
            </div>
          )}
        </div>

        {/* Plan Mapping */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Store className="w-4 h-4" />
            Plan ID Mapping
          </h4>
          <p className="text-sm text-gray-600">
            Map your Razorpay plan IDs to subscription tiers. Use Fetch Plans button to see your Razorpay plans.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['starter', 'professional', 'enterprise'].map((plan) => (
              <div key={plan}>
                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                  {plan} Plan ID
                </label>
                <input
                  type="text"
                  value={settings.razorpay.plans[plan]}
                  onChange={(e) => updateSettings(`razorpay.plans.${plan}`, e.target.value)}
                  placeholder={`plan_${plan}`}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentGatewaySettings;
