import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, Bell, AlertTriangle, Info, CheckCircle, MessageSquare, Activity, Upload, Users, Zap } from 'lucide-react';
import api from '../utils/api';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const NotificationCenter = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread'
  const { fetchUnreadCount } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications/', {
        params: {
          limit: 50,
          unread_only: filter === 'unread'
        }
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(notifications.filter(n => n.id !== notificationId));
      fetchUnreadCount();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Only navigate if action_url exists and is valid
    if (notification.action_url) {
      try {
        // Validate the URL - check if it starts with / (internal route)
        const url = notification.action_url.trim();
        if (url && url.startsWith('/')) {
          navigate(url);
          onClose();
        } else {
          console.warn('Invalid action_url:', notification.action_url);
        }
      } catch (error) {
        console.error('Error navigating to notification URL:', error);
      }
    }
    // If no action_url, just mark as read (no navigation needed)
  };

  const getNotificationIcon = (type, priority) => {
    const iconClass = `w-5 h-5 ${
      priority === 'critical' ? 'text-red-600' :
      priority === 'high' ? 'text-orange-600' :
      priority === 'medium' ? 'text-blue-600' :
      'text-gray-600'
    }`;

    switch (type) {
      case 'admin_message':
        return <Bell className="w-5 h-5 text-purple-600" />;
      case 'new_conversation':
        return <MessageSquare className={iconClass} />;
      case 'high_priority_message':
        return <AlertTriangle className={iconClass} />;
      case 'performance_alert':
        return <Activity className={iconClass} />;
      case 'usage_warning':
        return <AlertTriangle className={iconClass} />;
      case 'new_user_signup':
        return <Users className={iconClass} />;
      case 'webhook_event':
        return <Zap className={iconClass} />;
      case 'source_processing':
        return <Upload className={iconClass} />;
      case 'chatbot_down':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'api_error':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const seconds = Math.floor((now - then) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return then.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-white text-purple-600'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
              filter === 'unread'
                ? 'bg-white text-purple-600'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            Unread
          </button>
          {notifications.some(n => !n.read) && (
            <button
              onClick={markAllAsRead}
              className="ml-auto px-3 py-1 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1"
            >
              <CheckCircle className="w-4 h-4" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No notifications</p>
            <p className="text-gray-400 text-sm mt-1">
              {filter === 'unread' ? "You're all caught up!" : "We'll notify you when something happens"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.read ? 'bg-purple-50/50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    !notification.read ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    {getNotificationIcon(notification.type, notification.priority)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`text-sm font-semibold ${
                        !notification.read ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <div className="flex-shrink-0 w-2 h-2 bg-purple-600 rounded-full mt-1"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(notification.created_at)}
                      </span>
                      {notification.priority === 'critical' && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">
                          Critical
                        </span>
                      )}
                      {notification.priority === 'high' && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded">
                          High
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {!notification.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <button
            onClick={() => {
              navigate('/notifications');
              onClose();
            }}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
          >
            View all notifications →
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;