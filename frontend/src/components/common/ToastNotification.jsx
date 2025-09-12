import React, { useEffect, useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';

const ToastNotification = () => {
  const [visible, setVisible] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);
  const { notifications } = useNotification();

  useEffect(() => {
    if (notifications.length > 0 && !notifications[0].read) {
      const latestNotification = notifications[0];
      setCurrentNotification(latestNotification);
      setVisible(true);

      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setVisible(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const handleClose = () => {
    setVisible(false);
  };

  if (!visible || !currentNotification) return null;

  const getToastColor = (type) => {
    switch (type) {
      case 'new-order':
        return 'bg-blue-100 border-blue-400 text-blue-800';
      case 'order-ready':
        return 'bg-green-100 border-green-400 text-green-800';
      case 'alert':
        return 'bg-yellow-100 border-yellow-400 text-yellow-800';
      default:
        return 'bg-gray-100 border-gray-400 text-gray-800';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div className={`border rounded-lg p-4 shadow-lg ${getToastColor(currentNotification.type)}`}>
        <div className="flex items-start">
          <div className="flex-1">
            <h4 className="font-semibold">{currentNotification.title}</h4>
            <p className="text-sm mt-1">{currentNotification.message}</p>
          </div>
          <button
            onClick={handleClose}
            className="ml-4 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToastNotification;