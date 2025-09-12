import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { useSocket } from './SocketContext';

const NotificationContext = createContext();

export const useNotification = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState(false);
  const audioRef = useRef(null);

  const { socket } = useSocket();

  // Check browser notification permission
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setBrowserNotificationsEnabled(true);
      }
    }
  }, []);

  // Request browser notification permission
  const requestBrowserNotificationPermission = () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      setBrowserNotificationsEnabled(true);
      return true;
    }

    if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          setBrowserNotificationsEnabled(true);
          return true;
        }
      });
    }
    return false;
  };

  // Play audio notification
 // Replace the playAudio function with this:
const playAudio = (soundType = 'order-new') => {
  if (!audioEnabled) return;

  // Check if audio is allowed (user has interacted with page)
  const canPlayAudio = localStorage.getItem('audioAllowed') === 'true';
  
  if (!canPlayAudio) {
    // Audio not allowed yet, don't try to play
    return;
  }

  try {
    const audio = new Audio(`/sounds/${soundType}.mp3`);
    audio.volume = 0.3;
    audio.play().catch(error => {
      console.log('Audio playback failed:', error);
      // If audio fails, mark as not allowed
      localStorage.setItem('audioAllowed', 'false');
    });
  } catch (error) {
    console.log('Audio creation failed:', error);
    localStorage.setItem('audioAllowed', 'false');
  }
};

// Add this function to enable audio after user interaction
const enableAudio = () => {
  localStorage.setItem('audioAllowed', 'true');
  setAudioEnabled(true);
  
  // Play a test sound to get audio permission
  try {
    const testAudio = new Audio('/sounds/order-new.mp3');
    testAudio.volume = 0.1;
    testAudio.play().then(() => {
      testAudio.pause();
    }).catch(error => {
      console.log('Test audio failed:', error);
      localStorage.setItem('audioAllowed', 'false');
    });
  } catch (error) {
    console.log('Test audio creation failed:', error);
  }
};

  // Show browser notification
  const showBrowserNotification = (title, message) => {
    if (!browserNotificationsEnabled || !('Notification' in window)) return;

    new Notification(title, {
      body: message,
      icon: '/favicon.ico',
      tag: 'restaurant-notification'
    });
  };

  // Add new notification
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      read: false,
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep last 50
    setUnreadCount(prev => prev + 1);

    // Play sound based on type
    if (notification.type === 'new-order') {
      playAudio('order-new');
    } else if (notification.type === 'order-ready') {
      playAudio('order-ready');
    } else {
      playAudio('alert');
    }

    // Show browser notification if enabled
    if (browserNotificationsEnabled) {
      showBrowserNotification(notification.title, notification.message);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  // Mark single notification as read
  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

// Replace the socket useEffect with this optimized version:
useEffect(() => {
  if (!socket) return;

  const handleNewOrder = (order) => {
    // Check if this is a duplicate notification (within 2 seconds)
    const isDuplicate = notifications.some(n => 
      n.orderId === order._id && 
      Date.now() - new Date(n.timestamp).getTime() < 2000
    );
    
    if (!isDuplicate) {
      addNotification({
        type: 'new-order',
        title: 'New Order Received',
        message: `Order #${order._id.slice(-8)} for Table ${order.tableId?.tableNumber}`,
        orderId: order._id,
        tableNumber: order.tableId?.tableNumber
      });
    }
  };

  const handleOrderStatusUpdate = (order) => {
    // Only notify for specific status changes
    if (order.status === 'ready') {
      // Check if this is a duplicate notification
      const isDuplicate = notifications.some(n => 
        n.orderId === order._id && 
        n.type === 'order-ready' &&
        Date.now() - new Date(n.timestamp).getTime() < 2000
      );
      
      if (!isDuplicate) {
        addNotification({
          type: 'order-ready',
          title: 'Order Ready for Delivery',
          message: `Order #${order._id.slice(-8)} is ready for Table ${order.tableId?.tableNumber}`,
          orderId: order._id,
          tableNumber: order.tableId?.tableNumber
        });
      }
    }
  };

  socket.on('newOrder', handleNewOrder);
  socket.on('orderStatusUpdated', handleOrderStatusUpdate);

  return () => {
    socket.off('newOrder', handleNewOrder);
    socket.off('orderStatusUpdated', handleOrderStatusUpdate);
  };
}, [socket, notifications]); // Add notifications to dependencies

  const value = {
    notifications,
    unreadCount,
    audioEnabled,
    browserNotificationsEnabled,
    addNotification,
    markAllAsRead,
    markAsRead,
    clearNotifications,
    toggleAudio: () => setAudioEnabled(prev => !prev),
    toggleBrowserNotifications: () => {
      if (!browserNotificationsEnabled) {
        return requestBrowserNotificationPermission();
      }
      setBrowserNotificationsEnabled(false);
      return true;
    },
    requestBrowserNotificationPermission,
    enableAudio,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};