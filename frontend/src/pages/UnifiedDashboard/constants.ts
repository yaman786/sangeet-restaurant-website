export const ORDER_STATUSES = {
  'pending': {
    label: 'Order Received',
    description: 'Your order has been received and is being processed',
    icon: '📋',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    borderColor: 'border-blue-400/30'
  },
  'preparing': {
    label: 'Preparing',
    description: 'Our kitchen is preparing your delicious meal',
    icon: '👨‍🍳',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    borderColor: 'border-yellow-400/30'
  },
  'ready': {
    label: 'Ready for Pickup',
    description: 'Your order is ready! Please collect from the counter',
    icon: '✅',
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
    borderColor: 'border-green-400/30'
  },
  'completed': {
    label: 'Completed',
    description: 'Thank you for dining with us!',
    icon: '🎉',
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    borderColor: 'border-purple-400/30'
  },
  'cancelled': {
    label: 'Order Cancelled',
    description: 'Your order has been cancelled by the restaurant',
    icon: '❌',
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
    borderColor: 'border-red-400/30'
  }
};
