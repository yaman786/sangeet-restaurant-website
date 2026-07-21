import Pusher from 'pusher';
import logger from '../utils/logger';

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export const emitNewOrder = async (data: any) => {
  try {
    await pusherServer.trigger('admin-channel', 'new-order', data);
    await pusherServer.trigger('kitchen-channel', 'new-order', data);
    return true;
  } catch (error) {
    logger.error('Error triggering Pusher event new-order:', error);
    return false;
  }
};



export const emitOrderStatusUpdate = async (data: any) => {
  try {
    await pusherServer.trigger('admin-channel', 'order-status-update', data);
    await pusherServer.trigger('kitchen-channel', 'order-status-update', data);
    
    // Also notify the specific customer or table channel if needed
    if (data.orderId) {
      await pusherServer.trigger(`customer-channel-${data.orderId}`, 'order-status-update', data);
    }
    if (data.tableNumber) {
      await pusherServer.trigger(`table-channel-${data.tableNumber}`, 'order-status-update', data);
    }
    return true;
  } catch (error) {
    logger.error('Error triggering Pusher event order-status-update:', error);
    return false;
  }
};

export const emitOrderDeleted = async (data: any) => {
  try {
    await pusherServer.trigger('admin-channel', 'order-deleted', data);
    await pusherServer.trigger('kitchen-channel', 'order-deleted', data);
    
    if (data.orderId) {
      await pusherServer.trigger(`customer-channel-${data.orderId}`, 'order-deleted', data);
    }
    if (data.tableNumber) {
      await pusherServer.trigger(`table-channel-${data.tableNumber}`, 'order-deleted', data);
    }
    return true;
  } catch (error) {
    logger.error('Error triggering Pusher event order-deleted:', error);
    return false;
  }
};

export const emitNewReservation = async (data: any) => {
  try {
    await pusherServer.trigger('admin-channel', 'new-reservation', data);
    return true;
  } catch (error) {
    logger.error('Error triggering Pusher event new-reservation:', error);
    return false;
  }
};

export const emitReservationUpdate = async (data: any) => {
  try {
    await pusherServer.trigger('admin-channel', 'reservation-status-update', data);
    return true;
  } catch (error) {
    logger.error('Error triggering Pusher event reservation-status-update:', error);
    return false;
  }
};

