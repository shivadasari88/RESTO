import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useParams, useLocation } from 'react-router-dom';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const params = useParams();
  const location = useLocation();

  useEffect(() => {
    // Only create socket connection if we're on a page that needs it
    const needsSocket = 
      location.pathname.includes('/order-status/') ||
      location.pathname.includes('/staff/') ||
      location.pathname.includes('/menu/');

    if (!needsSocket) {
      if (socket) {
        console.log('Cleaning up socket connection - not needed');
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Get table ID from URL params or localStorage
    let tableId = params.tableId;
    if (!tableId && location.pathname.includes('/order-status/')) {
      tableId = localStorage.getItem('currentTable');
    }

    // Safely get user data from localStorage
    let user = null;
    let token = null;
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        user = JSON.parse(userString);
      }
      token = localStorage.getItem('token');
    } catch (error) {
      console.error('Error parsing data from localStorage:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }

    // If we already have a socket, check if we need to reconnect with new credentials
    if (socket) {
      const currentTableId = socket.io.opts.query?.tableId;
      const currentToken = socket.auth?.token;
      
      if (currentTableId !== tableId || currentToken !== token) {
        console.log('Reconnecting socket with new credentials...');
        socket.disconnect();
        setSocket(null);
      } else {
        // Same credentials, no need to create new socket
        return;
      }
    }

    const socketOptions = {
      auth: token ? { token } : undefined,
      query: tableId ? { tableId } : undefined,
      transports: ['polling', 'websocket'], // Try polling first for better reliability
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
    };

    console.log('Creating new socket connection...');
    const newSocket = io(
      import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000',
      socketOptions
    );

    newSocket.on('connect', () => {
      console.log('✅ Connected to server with socket ID:', newSocket.id);
      setIsConnected(true);
      
      // Join appropriate rooms
      if (tableId) {
        newSocket.emit('joinTable', tableId);
        console.log('Joined table room:', tableId);
      }
      
      if (user && user.role) {
        newSocket.emit('joinRole', user.role);
        console.log('Joined role room:', user.role);
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from server:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error.message);
      setIsConnected(false);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      if (newSocket) {
        console.log('Cleaning up socket connection');
        newSocket.removeAllListeners();
        newSocket.disconnect();
      }
    };
  }, [location.pathname, params.tableId]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};