import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import ResponsiveNav from '../components/ResponsiveNav';
import { useAuth } from '../contexts/AuthContext';

const NotificationDebug = () => {
  const { user, logout } = useAuth();
  const [checks, setChecks] = useState({
    notificationAPI: false,
    serviceWorker: false,
    pushManager: false,
    permission: 'default',
    serviceWorkerRegistered: false,
    https: false
  });

  useEffect(() => {
    runChecks();
  }, []);

  const runChecks = async () => {
    const results = {
      notificationAPI: 'Notification' in window,
      serviceWorker: 'serviceWorker' in navigator,
      pushManager: 'PushManager' in window,
      permission: Notification?.permission || 'not-supported',
      https: window.location.protocol === 'https:',
      serviceWorkerRegistered: false
    };

    // Check if service worker is registered
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        results.serviceWorkerRegistered = !!registration;
      } catch (error) {
        console.error('Error checking service worker:', error);
      }
    }

    setChecks(results);
  };

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setChecks(prev => ({ ...prev, permission }));
      
      if (permission === 'granted') {
        // Send test notification
        new Notification('BotSmith', {
          body: 'Notification permission granted! 🎉',
          icon: '/logo192.png'
        });
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      alert('Error: ' + error.message);
    }
  };

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      await navigator.serviceWorker.ready;
      setChecks(prev => ({ ...prev, serviceWorkerRegistered: true }));
      alert('Service Worker registered successfully!');
    } catch (error) {
      console.error('Error registering service worker:', error);
      alert('Error: ' + error.message);
    }
  };

  const sendTestNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('BotSmith Test', {
        body: 'This is a test notification! 🔔',
        icon: '/logo192.png',
        badge: '/logo192.png',
        vibrate: [200, 100, 200]
      });
    } else {
      alert('Notification permission not granted. Permission: ' + Notification.permission);
    }
  };

  const StatusIcon = ({ status }) => {
    if (status === true) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (status === false) return <XCircle className="w-5 h-5 text-red-600" />;
    return <AlertCircle className="w-5 h-5 text-yellow-600" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <ResponsiveNav user={user} onLogout={logout} />
      
      <div className="max-w-4xl mx-auto p-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Notification Debug Tool
          </h1>
          <p className="text-gray-600">Diagnose push notification issues</p>
        </div>

        {/* Browser Compatibility Checks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="w-6 h-6 text-purple-600" />
            Browser Compatibility
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Notification API</span>
              <div className="flex items-center gap-2">
                <StatusIcon status={checks.notificationAPI} />
                <span className="text-sm text-gray-600">{checks.notificationAPI ? 'Supported' : 'Not Supported'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Service Worker API</span>
              <div className="flex items-center gap-2">
                <StatusIcon status={checks.serviceWorker} />
                <span className="text-sm text-gray-600">{checks.serviceWorker ? 'Supported' : 'Not Supported'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Push Manager API</span>
              <div className="flex items-center gap-2">
                <StatusIcon status={checks.pushManager} />
                <span className="text-sm text-gray-600">{checks.pushManager ? 'Supported' : 'Not Supported'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">HTTPS Connection</span>
              <div className="flex items-center gap-2">
                <StatusIcon status={checks.https} />
                <span className="text-sm text-gray-600">{checks.https ? 'Secure' : 'Insecure'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Service Worker Registered</span>
              <div className="flex items-center gap-2">
                <StatusIcon status={checks.serviceWorkerRegistered} />
                <span className="text-sm text-gray-600">{checks.serviceWorkerRegistered ? 'Yes' : 'No'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Notification Permission</span>
              <div className="flex items-center gap-2">
                <StatusIcon status={checks.permission === 'granted'} />
                <span className={`text-sm font-medium ${
                  checks.permission === 'granted' ? 'text-green-600' :
                  checks.permission === 'denied' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {checks.permission}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Actions</h2>
          
          <div className="space-y-3">
            {!checks.serviceWorkerRegistered && checks.serviceWorker && (
              <button
                onClick={registerServiceWorker}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium"
              >
                Register Service Worker
              </button>
            )}

            {checks.permission === 'default' && (
              <button
                onClick={requestPermission}
                className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all text-sm font-medium"
              >
                Request Notification Permission
              </button>
            )}

            {checks.permission === 'granted' && (
              <button
                onClick={sendTestNotification}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm font-medium"
              >
                Send Test Notification
              </button>
            )}

            <button
              onClick={runChecks}
              className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all text-sm font-medium"
            >
              Refresh Checks
            </button>
          </div>

          {/* Help Text */}
          {checks.permission === 'denied' && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-medium mb-2">⚠️ Notifications Blocked</p>
              <p className="text-xs text-red-700 mb-2">To fix this:</p>
              <ol className="text-xs text-red-700 space-y-1 ml-4 list-decimal">
                <li>Click the 🔒 lock icon in your browser's address bar</li>
                <li>Find "Notifications" in the settings</li>
                <li>Change it to "Allow"</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          )}

          {!checks.https && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Push notifications require HTTPS. Your connection is not secure.
              </p>
            </div>
          )}

          {!checks.notificationAPI && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                ❌ Your browser does not support notifications. Please use Chrome, Firefox, or Safari.
              </p>
            </div>
          )}
        </div>

        {/* Browser Info */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Browser Information</h2>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>User Agent:</strong> {navigator.userAgent}</p>
            <p><strong>Platform:</strong> {navigator.platform}</p>
            <p><strong>Protocol:</strong> {window.location.protocol}</p>
            <p><strong>Host:</strong> {window.location.host}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDebug;
