import Pusher from 'pusher-js';
import env from '@/lib/utils/env';

class PusherClientService {
  private pusher: Pusher | null = null;
  private channels: { [key: string]: any } = {};
  public isConnected = false;

  connect() {
    if (this.pusher) return;

    const key = env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (!key || !cluster) {
      console.warn('Pusher credentials not configured. Real-time features disabled.');
      return;
    }

    this.pusher = new Pusher(key, { cluster });

    this.pusher.connection.bind('connected', () => {
      this.isConnected = true;
      console.log('Connected to Pusher');
    });

    this.pusher.connection.bind('disconnected', () => {
      this.isConnected = false;
      console.log('Disconnected from Pusher');
    });
  }

  /** Alias for connect() — compatibility with legacy Socket.IO interface */
  init() {
    this.connect();
  }

  /** Listen for Pusher connection state changes */
  onConnectionStateChange(callback: (status: string) => void) {
    if (!this.pusher) return;
    this.pusher.connection.bind('state_change', (states: { current: string }) => {
      callback(states.current);
    });
  }

  /** Subscribe to admin channel and return the channel object for direct binding */
  subscribeToAdminChannel() {
    this.connect();
    this.joinAdmin();
    return this.channels['admin-channel'] || { bind: () => {}, unbind: () => {} };
  }

  disconnect() {
    if (this.pusher) {
      this.pusher.disconnect();
      this.pusher = null;
      this.isConnected = false;
      this.channels = {};
    }
  }

  joinAdmin() {
    if (!this.pusher) return;
    if (!this.channels['admin-channel']) {
      this.channels['admin-channel'] = this.pusher.subscribe('admin-channel');
    }
  }

  joinAdminRoom() {
    this.joinAdmin();
  }

  joinKitchen() {
    if (!this.pusher) return;
    if (!this.channels['kitchen-channel']) {
      this.channels['kitchen-channel'] = this.pusher.subscribe('kitchen-channel');
    }
  }

  joinTable(tableNumber: string) {
    if (!this.pusher) return;
    const channelName = `table-channel-${tableNumber}`;
    if (!this.channels[channelName]) {
      this.channels[channelName] = this.pusher.subscribe(channelName);
    }
  }

  joinCustomer(orderId: string) {
    if (!this.pusher) return;
    const channelName = `customer-channel-${orderId}`;
    if (!this.channels[channelName]) {
      this.channels[channelName] = this.pusher.subscribe(channelName);
    }
  }

  onNewOrder(callback: (data: any) => void) {
    if (this.channels['admin-channel']) this.channels['admin-channel'].bind('new-order', callback);
    if (this.channels['kitchen-channel']) this.channels['kitchen-channel'].bind('new-order', callback);
  }

  onOrderStatusUpdate(callback: (data: any) => void) {
    Object.values(this.channels).forEach(channel => {
      channel.bind('order-status-update', callback);
    });
  }

  onOrderDeleted(callback: (data: any) => void) {
    Object.values(this.channels).forEach(channel => {
      channel.bind('order-deleted', callback);
    });
  }

  onItemCancelled(callback: (data: any) => void) {
    Object.values(this.channels).forEach(channel => {
      channel.bind('item-cancelled', callback);
    });
  }

  onNewItemsAdded(callback: (data: any) => void) {
    if (this.channels['admin-channel']) this.channels['admin-channel'].bind('new-items-added', callback);
    if (this.channels['kitchen-channel']) this.channels['kitchen-channel'].bind('new-items-added', callback);
  }

  onOrderCompleted(callback: (data: any) => void) {
    // Maps to status update 'completed'
    this.onOrderStatusUpdate((data) => {
      if (data.status === 'completed') callback(data);
    });
  }

  removeListener(eventName: string) {
    Object.values(this.channels).forEach(channel => {
      channel.unbind(eventName);
    });
  }

  playNotificationSound(type: 'notification' | 'completion') {
    try {
      const audio = new Audio(type === 'notification' ? '/sounds/notification.mp3' : '/sounds/completion.mp3');
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          this.playSynthesizedChime(type);
        });
      }
    } catch (error) {
      this.playSynthesizedChime(type);
    }
  }

  private playSynthesizedChime(type: 'notification' | 'completion') {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'notification') {
        // High-pitched pleasant dual-tone kitchen chime (D5 -> A5)
        const notes = [587.33, 880.00];
        notes.forEach((freq, index) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.15);
          
          gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.15);
          gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + index * 0.15 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.15 + 0.5);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(ctx.currentTime + index * 0.15);
          osc.stop(ctx.currentTime + index * 0.15 + 0.5);
        });
      } else {
        // Completion chime (C5 -> E5 -> G5)
        const notes = [523.25, 659.25, 783.99];
        notes.forEach((freq, index) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.12);

          gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.12);
          gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + index * 0.12 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.12 + 0.4);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(ctx.currentTime + index * 0.12);
          osc.stop(ctx.currentTime + index * 0.12 + 0.4);
        });
      }
    } catch (e) {
      console.warn('Synthesized chime error:', e);
    }
  }

  // Call waiter via server-side Pusher broadcast
  async emitCallWaiter(tableNumber: string) {
    try {
      await fetch('/api/tables/call-waiter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableNumber })
      });
    } catch (error) {
      console.error('Failed to call waiter:', error);
    }
  }

  // Request bill via server-side Pusher broadcast
  async emitRequestBill(tableNumber: string) {
    try {
      await fetch('/api/tables/request-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableNumber })
      });
    } catch (error) {
      console.error('Failed to request bill:', error);
    }
  }
}

export const pusherClient = new PusherClientService();
