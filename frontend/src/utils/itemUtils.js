// Utility functions for item management

// Check if an item is new (added within the last 30 minutes)
export const isNewItem = (createdAt) => {
  if (!createdAt) return false;
  
  const itemTime = new Date(createdAt);
  const now = new Date();
  const diffMinutes = (now - itemTime) / (1000 * 60);
  
  return diffMinutes < 30; // Show as NEW if less than 30 minutes old
};

// Get time since item was added
export const getTimeSinceAdded = (createdAt) => {
  if (!createdAt) return '';
  
  const itemTime = new Date(createdAt);
  const now = new Date();
  const diffMinutes = Math.floor((now - itemTime) / (1000 * 60));
  
  if (diffMinutes < 1) return 'Just added';
  if (diffMinutes === 1) return '1 minute ago';
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours === 1) return '1 hour ago';
  return `${diffHours} hours ago`;
};

// Sort items: new items first, then by creation time
export const sortItemsByNewness = (items) => {
  return [...items].sort((a, b) => {
    // New items first
    const aIsNew = isNewItem(a.created_at);
    const bIsNew = isNewItem(b.created_at);
    
    if (aIsNew && !bIsNew) return -1;
    if (!aIsNew && bIsNew) return 1;
    
    // Then by creation time (newest first)
    return new Date(b.created_at) - new Date(a.created_at);
  });
};

// Group items by order sessions (5-minute windows)
export const groupItemsBySession = (items) => {
  if (!items || items.length === 0) return [];
  
  // Sort items by creation time
  const sortedItems = [...items].sort((a, b) => 
    new Date(a.created_at) - new Date(b.created_at)
  );
  
  const sessions = [];
  let currentSession = {
    id: 1,
    title: 'Original Order',
    timestamp: new Date(sortedItems[0].created_at),
    items: []
  };
  
  sortedItems.forEach((item, index) => {
    const itemTime = new Date(item.created_at);
    const timeDiff = Math.abs(itemTime - currentSession.timestamp) / (1000 * 60); // minutes
    
    // If more than 5 minutes difference, start new session
    if (index > 0 && timeDiff > 5) {
      sessions.push(currentSession);
      currentSession = {
        id: sessions.length + 2,
        title: `Added Items`,
        timestamp: itemTime,
        items: []
      };
    }
    
    currentSession.items.push(item);
  });
  
  sessions.push(currentSession);
  return sessions;
};

// Get session title with timestamp
export const getSessionTitle = (session, isFirst = false) => {
  const timeString = session.timestamp.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  if (isFirst) {
    return `Original Order (${timeString})`;
  } else {
    return `Added Items (${timeString})`;
  }
};

// Check if order has multiple sessions (was merged)
export const hasMultipleSessions = (items) => {
  const sessions = groupItemsBySession(items);
  return sessions.length > 1;
};
