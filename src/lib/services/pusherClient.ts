import Pusher from 'pusher-js';

class PusherClientService {
  private pusher: Pusher | null = null;
  private channels: { [key: string]: any } = {};
  public isConnected = false;

  connect() {
    if (this.pusher) return;

    this.pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || '70c6edba52e8763ff592', {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2',
    });

    this.pusher.connection.bind('connected', () => {
      this.isConnected = true;
      console.log('Connected to Pusher');
    });

    this.pusher.connection.bind('disconnected', () => {
      this.isConnected = false;
      console.log('Disconnected from Pusher');
    });
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
      audio.play().catch(e => console.error('Error playing sound:', e));
    } catch (error) {
      console.error('Audio play failed', error);
    }
  }

  // Frontend-to-backend emits are not supported directly in Pusher via client.
  // We mock these so they don't crash, but ideally they should call API routes.
  emitNewOrder() {}
  emitCallWaiter() {}
  emitRequestBill() {}
}

export const pusherClient = new PusherClientService();
