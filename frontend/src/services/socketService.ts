import { io } from 'socket.io-client';

class SocketService {
  public socket: any | null = null;
  public isConnected: boolean = false;
  public listeners: Map<string, Set<Function>> = new Map();
  public connectionAttempts: number = 0;
  public maxConnectionAttempts: number = 5;
  public audioContext?: AudioContext;

  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = 5;
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

    // Use environment variable with fallback
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
    const apiUrl = baseUrl.replace('/api', ''); // Remove /api if present
    
    // Get token to pass for authentication
    const token = localStorage.getItem('sangeet_token') || localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('adminToken');
    
    try {
      console.log('🔌 Attempting socket connection to:', apiUrl);
      this.socket = io(apiUrl, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: false,
        reconnection: true,
        reconnectionAttempts: this.maxConnectionAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        auth: { token }
      });
    } catch (error) {
      console.error('Socket connection error:', error);
      return;
    }

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.connectionAttempts = 0;
      console.log('🔌 Socket connected successfully');
      // Do not auto-join any room. Pages/components must opt-in.
    });

    this.socket.on('disconnect', (reason: string) => {
      this.isConnected = false;
      console.log('🔌 Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error: any) => {
      this.connectionAttempts++;
      console.error('WebSocket connection error:', error);
      this.isConnected = false;
      
      if (this.connectionAttempts >= this.maxConnectionAttempts) {
        console.error('🔌 Max connection attempts reached. Socket connection failed.');
      }
    });

    this.socket.on('reconnect', (attemptNumber: number) => {
      this.isConnected = true;
      this.connectionAttempts = 0;
      console.log('🔌 Socket reconnected after', attemptNumber, 'attempts');
    });

    this.socket.on('reconnect_error', (error: any) => {
      console.error('WebSocket reconnection error:', error);
      this.isConnected = false;
    });

    this.socket.on('reconnect_failed', () => {
      console.error('🔌 Socket reconnection failed after all attempts');
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
      console.log('🔌 Joining admin room...');
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
  joinCustomer(orderId: string | number) {
    if (this.socket) {
      this.socket.emit('join-customer', orderId);
    }
  }

  // Join table room for all table orders
  joinTable(tableNumber: string | number) {
    if (this.socket) {
      this.socket.emit('join-table', tableNumber);
    }
  }

  // Internal helper to add listeners securely
  _addListener(event: string, callback: Function) {
    if (!this.socket) {
      this.connect();
    }
    
    if (this.socket) {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, new Set());
        // Register the actual socket listener once
        this.socket.on(event, (...args: any[]) => {
          const callbacks = this.listeners.get(event);
          if (callbacks) {
            callbacks.forEach(cb => cb(...args));
          }
        });
      }
      this.listeners.get(event)!.add(callback);
    }
  }

  // Listen for new orders
  onNewOrder(callback: Function) {
    this._addListener('new-order', callback);
  }

  // Listen for order status updates
  onOrderStatusUpdate(callback: Function) {
    this._addListener('order-status-update', callback);
  }

  // Listen for table order updates
  onTableOrderUpdate(callback: Function) {
    this._addListener('table-order-update', callback);
  }

  // Listen for order completion
  onOrderCompleted(callback: Function) {
    this._addListener('order-completed', callback);
  }

  // Listen for new items added to existing orders
  onNewItemsAdded(callback: Function) {
    this._addListener('new-items-added', callback);
  }

  // Listen for order cancellation
  onOrderCancelled(callback: Function) {
    this._addListener('order-cancelled', callback);
  }

  // Listen for order deletion
  onOrderDeleted(callback: Function) {
    this._addListener('order-deleted', callback);
  }

  // Remove specific listener
  removeListener(event: string, callback?: Function) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      if (callback) {
        callbacks!.delete(callback);
      } else {
        callbacks!.clear();
      }
      
      if (callbacks!.size === 0) {
        this.listeners.delete(event);
        if (this.socket) {
          this.socket.off(event);
        }
      }
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      for (const event of Array.from(this.listeners.keys())) {
        this.socket.off(event);
      }
      this.listeners.clear();
    }
  }

  // Play notification sound using browser's built-in audio
  playNotificationSound(type: 'notification' | 'completion' = 'notification') {
    try {
      // Create or resume audio context for browser-based sound generation
      let audioContext = this.audioContext;
      if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.audioContext = audioContext;
      }
      
      // Resume audio context if suspended (required by modern browsers)
      if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
          // Audio context resumed successfully
        }).catch(error => {
          // Failed to resume audio context
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
      
              // Played sound successfully
      
    } catch (error) {
              // Could not play notification sound
      // Fallback: try to play a simple beep using the Web Audio API
      try {
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Audio playback not supported
        });
      } catch (fallbackError) {
        // No audio support available
      }
    }
  }

  // Show browser notification
  showBrowserNotification(title: string, body: string, icon = '/logo192.png') {
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
