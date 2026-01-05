import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ResponsiveNav from '../components/ResponsiveNav';
import UserProfileDropdown from '../components/UserProfileDropdown';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  MessageSquare, 
  AlertCircle,
  Info,
  TrendingUp,
  AlertTriangle,
  UserPlus,
  Zap,
  FileText,
  Settings,
  X
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const Notifications = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { fetchUnreadCount } = useNotifications();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 100,
        skip: 0,
        unread_only: filter === 'unread'
      };
      const response = await api.get('/notifications/', { params });
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
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
      toast.success('Marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      fetchUnreadCount();
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(notifications.filter(n => n.id !== notificationId));
      toast.success('Notification deleted');
      fetchUnreadCount();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const toggleSelectNotification = (notificationId) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(notificationId)) {
      newSelected.delete(notificationId);
    } else {
      newSelected.add(notificationId);
    }
    setSelectedNotifications(newSelected);
  };

  const selectAll = () => {
    if (selectedNotifications.size === notifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(notifications.map(n => n.id)));
    }
  };

  const deleteSelected = async () => {
    if (selectedNotifications.size === 0) return;
    
    try {
      await Promise.all(
        Array.from(selectedNotifications).map(id => 
          api.delete(`/notifications/${id}`)
        )
      );
      setNotifications(notifications.filter(n => !selectedNotifications.has(n.id)));
      setSelectedNotifications(new Set());
      toast.success(`Deleted ${selectedNotifications.size} notification(s)`);
      fetchUnreadCount();
    } catch (error) {
      console.error('Error deleting notifications:', error);
      toast.error('Failed to delete notifications');
    }
  };

  const getNotificationIcon = (type) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case 'new_conversation':
        return <MessageSquare className={iconClass} />;
      case 'high_priority_message':
        return <AlertTriangle className={iconClass} />;
      case 'performance_alert':
        return <TrendingUp className={iconClass} />;
      case 'usage_warning':
        return <AlertCircle className={iconClass} />;
      case 'new_user_signup':
        return <UserPlus className={iconClass} />;
      case 'webhook_event':
        return <Zap className={iconClass} />;
      case 'source_processing':
        return <FileText className={iconClass} />;
      case 'chatbot_down':
        return <AlertCircle className={iconClass} />;
      case 'api_error':
        return <AlertCircle className={iconClass} />;
      case 'admin_message':
        return <Info className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  const getNotificationColor = (type, priority) => {
    if (priority === 'high') return 'bg-red-100 text-red-600';
    if (priority === 'medium') return 'bg-orange-100 text-orange-600';
    
    switch (type) {
      case 'high_priority_message':
      case 'performance_alert':
      case 'chatbot_down':
      case 'api_error':
        return 'bg-red-100 text-red-600';
      case 'usage_warning':
        return 'bg-yellow-100 text-yellow-600';
      case 'new_conversation':
      case 'new_user_signup':
        return 'bg-green-100 text-green-600';
      case 'webhook_event':
      case 'source_processing':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-purple-100 text-purple-600';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <ResponsiveNav />
            <div className="flex items-center space-x-4">
              <UserProfileDropdown user={user} onLogout={logout} />
            </div>
          </div>
        </div>
      </nav>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Bell className="w-8 h-8 text-purple-600" />
                Notifications
              </h1>
              <p className="text-gray-600 mt-1">
                Stay updated with your chatbot activity
              </p>
            </div>
            <button
              onClick={() => navigate('/notification-preferences')}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Preferences
            </button>
          </div>

          {/* Stats & Actions Bar */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-sm text-gray-600">Total</span>
                  <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Unread</span>
                  <p className="text-2xl font-bold text-purple-600">{unreadCount}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Filter Buttons */}
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'unread'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Unread ({unreadCount})
                </button>

                {/* Action Buttons */}
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <CheckCheck className="w-4 h-4" />
                    Mark all read
                  </button>
                )}
                
                {selectedNotifications.size > 0 && (
                  <button
                    onClick={deleteSelected}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete ({selectedNotifications.size})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Select */}
        {notifications.length > 0 && (
          <div className="mb-4 flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedNotifications.size === notifications.length && notifications.length > 0}
              onChange={selectAll}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-600">
              {selectedNotifications.size > 0 
                ? `${selectedNotifications.size} selected`
                : 'Select all'
              }
            </span>
          </div>
        )}

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600">
              {filter === 'unread' 
                ? "You're all caught up! No unread notifications."
                : "You don't have any notifications yet."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg border transition-all ${
                  notification.read
                    ? 'border-gray-200'
                    : 'border-purple-200 bg-purple-50/30'
                } hover:shadow-md`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedNotifications.has(notification.id)}
                      onChange={() => toggleSelectNotification(notification.id)}
                      className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      onClick={(e) => e.stopPropagation()}
                    />

                    {/* Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${getNotificationColor(notification.type, notification.priority)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="text-base font-semibold text-gray-900 mb-1">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {notification.message}
                          </p>
                          
                          {/* Metadata */}
                          {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {Object.entries(notification.metadata).map(([key, value]) => (
                                <span
                                  key={key}
                                  className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs text-gray-600"
                                >
                                  <span className="font-medium">{key}:</span>
                                  <span className="ml-1">{value}</span>
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(notification.created_at)}
                            </span>
                            {notification.priority && (
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                notification.priority === 'high' 
                                  ? 'bg-red-100 text-red-700'
                                  : notification.priority === 'medium'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {notification.priority}
                              </span>
                            )}
                            {!notification.read && (
                              <span className="text-xs font-medium text-purple-600">
                                • Unread
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
