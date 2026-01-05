import React, { useState, useEffect } from 'react';
import { Bell, Mail, Globe, Save, Volume2, VolumeX } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import ResponsiveNav from '../components/ResponsiveNav';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';
import { 
  subscribeToPushNotifications, 
  unsubscribeFromPushNotifications,
  sendSubscriptionToBackend,
  testPushNotification,
  isPushSupported as checkPushSupport
} from '../utils/pushNotifications';

const NotificationPreferences = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [preferences, setPreferences] = useState({
    email_enabled: true,
    email_new_conversation: true,
    email_high_priority: true,
    email_performance_alert: true,
    email_usage_warning: true,
    email_digest: 'daily',
    email_digest_time: '09:00',
    push_enabled: true,
    push_new_conversation: true,
    push_high_priority: true,
    push_performance_alert: true,
    push_usage_warning: true,
    inapp_enabled: true,
    inapp_sound: true,
    admin_new_user_signup: true,
    admin_webhook_events: true
  });

  useEffect(() => {
    fetchPreferences();
    checkPushSupportStatus();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await api.get('/notifications/preferences');
      setPreferences(response.data);
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast.error('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const checkPushSupportStatus = () => {
    const supported = checkPushSupport();
    setPushSupported(supported);
    if (supported && 'Notification' in window) {
      const permission = Notification.permission;
      setPushEnabled(permission === 'granted');
      console.log('Push support check:', {
        supported,
        permission,
        enabled: permission === 'granted'
      });
    }
  };

  const handleToggle = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectChange = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const requestPushPermission = async () => {
    if (!pushSupported) {
      toast.error('Push notifications are not supported in your browser. Please use Chrome, Firefox, or Edge.');
      return;
    }

    try {
      toast.loading('Requesting notification permission...');
      
      // First, request basic notification permission
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        
        if (permission !== 'granted') {
          toast.dismiss();
          toast.error('❌ Permission denied. Please click "Allow" when your browser asks.', {
            duration: 6000
          });
          return;
        }
      }
      
      // Check if permission was already denied
      if (Notification.permission === 'denied') {
        toast.dismiss();
        toast.error('❌ Notifications are blocked. Click the 🔒 icon in your address bar → Site Settings → Notifications → Allow', {
          duration: 10000
        });
        return;
      }
      
      toast.dismiss();
      toast.loading('Setting up notifications...', { id: 'setup' });
      
      // Now try to subscribe to push notifications
      const result = await subscribeToPushNotifications();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to setup notifications');
      }
      
      // If we got a subscription, send it to backend
      if (result.subscription) {
        try {
          await sendSubscriptionToBackend(result.subscription, api);
          console.log('✅ Subscription saved to backend');
        } catch (backendError) {
          console.warn('⚠️ Could not save subscription to backend, but notifications will still work:', backendError);
        }
      }
      
      setPushEnabled(true);
      toast.dismiss('setup');
      
      // Show appropriate success message based on mode
      if (result.mode === 'full') {
        toast.success('✅ Push notifications enabled! You\'ll receive notifications even when this tab is closed.', {
          duration: 5000
        });
      } else {
        toast.success('✅ Browser notifications enabled! You\'ll see notifications while this tab is open.', {
          duration: 5000
        });
      }
      
      // Test notification immediately
      setTimeout(() => {
        testPushNotification()
          .then(() => {
            console.log('✅ Test notification sent');
          })
          .catch((err) => {
            console.error('❌ Test notification failed:', err);
          });
      }, 1000);
      
    } catch (error) {
      toast.dismiss();
      console.error('Error enabling push notifications:', error);
      
      if (error.message.includes('Permission denied') || error.message.includes('permission denied')) {
        toast.error('❌ Permission denied. To fix:\n1. Click the 🔒 icon in your address bar\n2. Go to Site Settings\n3. Set Notifications to "Allow"', {
          duration: 10000
        });
      } else if (error.message.includes('not supported')) {
        toast.error('Push notifications are not supported in your browser. Try Chrome, Firefox, or Edge.', {
          duration: 6000
        });
      } else {
        toast.error('Failed to enable notifications: ' + error.message, {
          duration: 6000
        });
      }
    }
  };

  const disablePushNotifications = async () => {
    try {
      await unsubscribeFromPushNotifications();
      setPushEnabled(false);
      toast.success('Push notifications disabled');
    } catch (error) {
      console.error('Error disabling push notifications:', error);
      toast.error('Failed to disable push notifications');
    }
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      await api.put('/notifications/preferences', preferences);
      toast.success('Notification preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <ResponsiveNav user={user} onLogout={logout} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <ResponsiveNav user={user} onLogout={logout} />
      
      <div className="max-w-4xl mx-auto p-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Notification Preferences
          </h1>
          <p className="text-gray-600">Manage how and when you receive notifications</p>
        </div>

        <div className="space-y-6">
          {/* In-App Notifications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">In-App Notifications</h2>
                <p className="text-gray-600 text-sm">Receive notifications while using BotSmith</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Enable in-app notifications</p>
                  <p className="text-sm text-gray-500">Show notifications in the notification center</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.inapp_enabled}
                    onChange={() => handleToggle('inapp_enabled')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {preferences.inapp_sound ? <Volume2 className="w-5 h-5 text-purple-600" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
                  <div>
                    <p className="font-medium text-gray-900">Notification sound</p>
                    <p className="text-sm text-gray-500">Play a sound when receiving notifications</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.inapp_sound}
                    onChange={() => handleToggle('inapp_sound')}
                    disabled={!preferences.inapp_enabled}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 disabled:opacity-50"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Email Notifications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Email Notifications</h2>
                <p className="text-gray-600 text-sm">Get notified via email (TEST MODE)</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Enable email notifications</p>
                  <p className="text-sm text-gray-500">Receive email alerts for important events</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.email_enabled}
                    onChange={() => handleToggle('email_enabled')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="pl-6 space-y-3 border-l-2 border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-700">New conversations</p>
                  <input
                    type="checkbox"
                    checked={preferences.email_new_conversation}
                    onChange={() => handleToggle('email_new_conversation')}
                    disabled={!preferences.email_enabled}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 disabled:opacity-50"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-700">High-priority messages</p>
                  <input
                    type="checkbox"
                    checked={preferences.email_high_priority}
                    onChange={() => handleToggle('email_high_priority')}
                    disabled={!preferences.email_enabled}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 disabled:opacity-50"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-700">Performance alerts</p>
                  <input
                    type="checkbox"
                    checked={preferences.email_performance_alert}
                    onChange={() => handleToggle('email_performance_alert')}
                    disabled={!preferences.email_enabled}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 disabled:opacity-50"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-700">Usage warnings</p>
                  <input
                    type="checkbox"
                    checked={preferences.email_usage_warning}
                    onChange={() => handleToggle('email_usage_warning')}
                    disabled={!preferences.email_enabled}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email digest frequency
                </label>
                <select
                  value={preferences.email_digest}
                  onChange={(e) => handleSelectChange('email_digest', e.target.value)}
                  disabled={!preferences.email_enabled}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                >
                  <option value="none">Never</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </div>
          </div>

          {/* Push Notifications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Browser Push Notifications</h2>
                <p className="text-gray-600 text-sm">Get notified even when BotSmith is closed</p>
              </div>
            </div>

            {!pushSupported ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  Push notifications are not supported in your browser. Please use Chrome, Firefox, or Safari.
                </p>
              </div>
            ) : !pushEnabled ? (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-900 font-medium mb-2">📌 How to enable notifications:</p>
                  <ol className="text-sm text-blue-800 space-y-1 ml-4 list-decimal">
                    <li>Click the button below</li>
                    <li>When your browser asks, click <strong>"Allow"</strong></li>
                    <li>You'll receive a test notification</li>
                  </ol>
                  <p className="text-xs text-blue-700 mt-3">
                    💡 If blocked: Click the 🔒 lock icon in your address bar → Site Settings → Notifications → Allow
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  Enable browser notifications to stay updated even when you're not using BotSmith.
                </p>
                <button
                  onClick={requestPushPermission}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
                >
                  Enable Notifications
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600 mb-4">
                  <Bell className="w-5 h-5" />
                  <span className="text-sm font-medium">Push notifications enabled ✅</span>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => testPushNotification().then(() => {
                      toast.success('Test notification sent!');
                    }).catch((error) => {
                      toast.error('Failed to send test notification');
                      console.error(error);
                    })}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm shadow-sm"
                  >
                    Test Notification
                  </button>
                  
                  <button
                    onClick={disablePushNotifications}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all text-sm"
                  >
                    Disable Push
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={savePreferences}
              disabled={saving}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default NotificationPreferences;
