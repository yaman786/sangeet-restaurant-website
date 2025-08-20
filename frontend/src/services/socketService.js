import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket && this.isConnected) {
      return;
    }
    
    // If socket exists but not connected, disconnect first
    if (this.socket && !this.isConnected) {
      this.socket.disconnect();
      this.socket = null;
    }

    // Use the base URL without /api for socket connection
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
    const apiUrl = baseUrl.replace('/api', ''); // Remove /api if present
    
    try {
      this.socket = io(apiUrl, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: false,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });
    } catch (error) {
      console.error('Socket connection error:', error);
      return;
    }

    this.socket.on('connect', () => {
      this.isConnected = true;
      // Do not auto-join any room. Pages/components must opt-in.
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.isConnected = false;
    });

    this.socket.on('reconnect', (attemptNumber) => {
      this.isConnected = true;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('WebSocket reconnection error:', error);
      this.isConnected = false;
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Join admin room for order notifications
  joinAdmin() {
    if (this.socket) {
      this.socket.emit('join-admin');
    }
  }

  // Join admin room for order notifications (alias)
  joinAdminRoom() {
    if (!this.socket) {
      this.connect();
    }
    
    if (this.socket) {
      this.socket.emit('join-admin');
    }
  }

  // Join kitchen room for order notifications
  joinKitchen() {
    if (this.socket) {
      this.socket.emit('join-kitchen');
    }
  }

  // Join customer room for order tracking
  joinCustomer(orderId) {
    if (this.socket) {
      this.socket.emit('join-customer', orderId);
    }
  }

  // Join table room for all table orders
  joinTable(tableNumber) {
    if (this.socket) {
      this.socket.emit('join-table', tableNumber);
    }
  }

  // Listen for new orders
  onNewOrder(callback) {
    if (!this.socket) {
      this.connect();
    }
    
    if (this.socket) {
      this.socket.on('new-order', (data) => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in new-order callback:', error);
        }
      });
      this.listeners.set('new-order', callback);
    }
  }

  // Listen for order status updates
  onOrderStatusUpdate(callback) {
    if (this.socket) {
      this.socket.on('order-status-update', (data) => {
        callback(data);
      });
      this.listeners.set('order-status-update', callback);
    } else {
      this.connect();
      if (this.socket) {
        this.socket.on('order-status-update', (data) => {
          callback(data);
        });
        this.listeners.set('order-status-update', callback);
      }
    }
  }



  // Listen for table order updates
  onTableOrderUpdate(callback) {
    if (this.socket) {
      this.socket.on('table-order-update', callback);
      this.listeners.set('table-order-update', callback);
    }
  }

  // Listen for order completion
  onOrderCompleted(callback) {
    if (this.socket) {
      this.socket.on('order-completed', callback);
      this.listeners.set('order-completed', callback);
    }
  }

  // Listen for new items added to existing orders
  onNewItemsAdded(callback) {
    if (this.socket) {
      this.socket.on('new-items-added', callback);
      this.listeners.set('new-items-added', callback);
    }
  }

  // Listen for order cancellation
  onOrderCancelled(callback) {
    if (this.socket) {
      this.socket.on('order-cancelled', callback);
      this.listeners.set('order-cancelled', callback);
    }
  }

  // Listen for order deletion
  onOrderDeleted(callback) {
    if (this.socket) {
      this.socket.on('order-deleted', callback);
      this.listeners.set('order-deleted', callback);
    }
  }

  // Remove specific listener
  removeListener(event) {
    if (this.socket && this.listeners.has(event)) {
      this.socket.off(event, this.listeners.get(event));
      this.listeners.delete(event);
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.listeners.clear();
    }
  }

  // Play notification sound using browser's built-in audio
  playNotificationSound(type = 'notification') {
    try {
      // Create or resume audio context for browser-based sound generation
      let audioContext = this.audioContext;
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.audioContext = audioContext;
      }
      
      // Resume audio context if suspended (required by modern browsers)
      if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
          console.log('Audio context resumed successfully');
        }).catch(error => {
          console.log('Failed to resume audio context:', error);
        });
      }
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different sounds for different notification types
      if (type === 'notification') {
        // High-pitched beep for new orders
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      } else if (type === 'completion') {
        // Success sound for completed orders
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.2);
      }
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      
      console.log(`🔊 Played ${type} sound successfully`);
      
    } catch (error) {
      console.log('Could not play notification sound:', error);
      // Fallback: try to play a simple beep using the Web Audio API
      try {
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
        audio.volume = 0.3;
        audio.play().catch(() => {
          console.log('Audio playback not supported');
        });
      } catch (fallbackError) {
        console.log('No audio support available');
      }
    }
  }

  // Show browser notification
  showBrowserNotification(title, body, icon = '/logo192.png') {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon,
        badge: '/logo192.png'
      });
    }
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService; 