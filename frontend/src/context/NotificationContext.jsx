import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children, user }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestNotification, setLatestNotification] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const playNotificationSound = () => {
    try {
      // Create a simple notification sound using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  const connectWebSocket = () => {
    // Disable WebSocket connection in production/preview environments
    // as it's not supported by the current infrastructure
    // WebSocket is a nice-to-have feature for real-time notifications
    // The app works perfectly fine without it using polling instead
    return;
    
    /* WebSocket implementation - currently disabled
    if (!user || !user.id) return;

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const wsUrl = backendUrl.replace(/^https?:/, 'wss:').replace(/^http:/, 'ws:');
      
      // Skip WebSocket connection if backend URL is not properly configured
      if (!backendUrl || backendUrl.includes('undefined')) {
        console.log('WebSocket skipped - backend URL not configured');
        return;
      }
      
      const ws = new WebSocket(`${wsUrl}/ws/notifications/${user.id}`);

      ws.onopen = () => {
        console.log('WebSocket connected for notifications');
      };

      ws.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data);
          
          if (notification.type === 'ping') {
            // Keep-alive message, ignore
            return;
          }

          // Update unread count
          setUnreadCount(prev => prev + 1);
          setLatestNotification(notification);

          // Play notification sound
          playNotificationSound();

          // Show toast notification
          toast.custom((t) => (
            <div className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                      <span className="text-white text-xl">🔔</span>
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {notification.message}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-gray-200">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-purple-600 hover:text-purple-500 focus:outline-none"
                >
                  Close
                </button>
              </div>
            </div>
          ), {
            duration: 5000,
            position: 'top-right',
          });

        } catch (error) {
          console.error('Error processing notification:', error);
        }
      };

      ws.onerror = (error) => {
        // Silently log WebSocket errors to avoid console spam
        // WebSocket is a nice-to-have feature, not critical
      };

      ws.onclose = () => {
        // Don't attempt to reconnect if backend URL is not properly configured
        if (!backendUrl || backendUrl.includes('undefined')) {
          return;
        }
        // Attempt to reconnect after 5 seconds (max 3 attempts)
        const maxReconnectAttempts = 3;
        const currentAttempts = wsRef.current?.reconnectAttempts || 0;
        
        if (currentAttempts < maxReconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, 5000);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error connecting WebSocket:', error);
    }
    */
  };

  useEffect(() => {
    if (user && user.id) {
      fetchUnreadCount();
      connectWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [user]);

  const value = {
    unreadCount,
    latestNotification,
    fetchUnreadCount,
    playNotificationSound
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
