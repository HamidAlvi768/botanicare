import io from 'socket.io-client';
import { getToken } from './auth';

const SOCKET_URL = process.env.REACT_APP_WS_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket) return;

    this.socket = io(SOCKET_URL, {
      auth: {
        token: getToken()
      }
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Set up event listeners for different entity updates
    this.setupEventListeners();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  setupEventListeners() {
    // Product updates
    this.socket.on('product:created', (data) => this.emit('product:created', data));
    this.socket.on('product:updated', (data) => this.emit('product:updated', data));
    this.socket.on('product:deleted', (data) => this.emit('product:deleted', data));
    this.socket.on('product:inventory', (data) => this.emit('product:inventory', data));

    // Order updates
    this.socket.on('order:created', (data) => this.emit('order:created', data));
    this.socket.on('order:updated', (data) => this.emit('order:updated', data));
    this.socket.on('order:status', (data) => this.emit('order:status', data));
    this.socket.on('order:payment', (data) => this.emit('order:payment', data));

    // Category updates
    this.socket.on('category:created', (data) => this.emit('category:created', data));
    this.socket.on('category:updated', (data) => this.emit('category:updated', data));
    this.socket.on('category:deleted', (data) => this.emit('category:deleted', data));

    // User updates
    this.socket.on('user:created', (data) => this.emit('user:created', data));
    this.socket.on('user:updated', (data) => this.emit('user:updated', data));
    this.socket.on('user:deleted', (data) => this.emit('user:deleted', data));
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }
}

export const socketService = new SocketService();
export default socketService; 