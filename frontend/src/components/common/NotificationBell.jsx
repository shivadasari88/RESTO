import React, { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [audioAllowed, setAudioAllowed] = useState(
    localStorage.getItem('audioAllowed') === 'true'
  );
  
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    markAsRead,
    clearNotifications,
    audioEnabled,
    browserNotificationsEnabled,
    toggleAudio,
    toggleBrowserNotifications,
    enableAudio
  } = useNotification();

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new-order':
        return '🆕';
      case 'order-ready':
        return '✅';
      case 'alert':
        return '⚠️';
      default:
        return '🔔';
    }
  };

  const handleEnableAudio = () => {
    // This click will enable audio through user interaction
    enableAudio();
    setAudioAllowed(true);
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleEnableAudio}
                  className={`p-1 rounded ${
                    audioEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}
                  title={audioEnabled ? 'Mute sounds' : 'Enable sounds - Click to allow audio'}
                >
                  {audioEnabled ? '🔊' : '🔇'}
                </button>
                <button
                  onClick={toggleBrowserNotifications}
                  className={`p-1 rounded ${
                    browserNotificationsEnabled ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                  }`}
                  title={browserNotificationsEnabled ? 'Disable browser notifications' : 'Enable browser notifications'}
                >
                  💻
                </button>
                {notifications.length > 0 && (
                  <>
                    <button
                      onClick={markAllAsRead}
                      className="p-1 text-blue-600 hover:text-blue-800"
                      title="Mark all as read"
                    >
                      📋
                    </button>
                    <button
                      onClick={clearNotifications}
                      className="p-1 text-red-600 hover:text-red-800"
                      title="Clear all"
                    >
                      🗑️
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">
                          {notification.title}
                        </p>
                        <p className="text-gray-600 text-sm mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatTime(notification.timestamp)}
                        </p>
                      </div>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;