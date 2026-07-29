export interface ConsolidatedTableSession {
  tableId: number | null;
  tableNumber: string | null;
  customerName: string | null;
  orderId: number | string | null;
  orderNumber: string | null;
  cart: any[];
  specialInstructions?: string | null;
  cancelledOrder?: { timestamp: number } | null;
  updatedAt?: string;
}

const SESSION_KEY = 'sangeet_table_session';

/**
 * Get the consolidated table session from localStorage.
 * Optionally pass expectedTableNumber to verify session belongs to the scanned table.
 */
export const getTableSession = (expectedTableNumber?: string | number | null): ConsolidatedTableSession | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    let session: ConsolidatedTableSession | null = null;
    
    if (raw) {
      session = JSON.parse(raw);
    } else {
      // Backward compatibility fallback for legacy separate keys
      const legacySession = localStorage.getItem('orderSession');
      if (legacySession) {
        const parsed = JSON.parse(legacySession);
        session = {
          tableId: parsed.tableId || null,
          tableNumber: parsed.tableNumber || null,
          customerName: parsed.customerName || null,
          orderId: parsed.orderId || null,
          orderNumber: parsed.orderNumber || null,
          cart: []
        };
      }
    }

    if (session && expectedTableNumber !== undefined && expectedTableNumber !== null) {
      const expStr = String(expectedTableNumber).trim();
      const sessStr = String(session.tableNumber || '').trim();
      if (sessStr && expStr && sessStr !== expStr) {
        // Stored session belongs to a different table! Return null so new table starts clean.
        return null;
      }
    }

    return session;
  } catch (e) {
    console.error('Error reading table session:', e);
  }
  return null;
};

/**
 * Save or update the consolidated table session in localStorage
 */
export const saveTableSession = (updates: Partial<ConsolidatedTableSession>): ConsolidatedTableSession => {
  if (typeof window === 'undefined') {
    return updates as ConsolidatedTableSession;
  }
  try {
    const existing = getTableSession() || {
      tableId: null,
      tableNumber: null,
      customerName: null,
      orderId: null,
      orderNumber: null,
      cart: []
    };
    
    const updatedSession: ConsolidatedTableSession = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
    // Keep legacy key in sync for seamless migration
    localStorage.setItem('orderSession', JSON.stringify(updatedSession));
    return updatedSession;
  } catch (e) {
    console.error('Error saving table session:', e);
    return updates as ConsolidatedTableSession;
  }
};

/**
 * Cleanly clear the table session and legacy loose keys
 */
export const clearTableSession = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('orderSession');
    
    // Clean up legacy loose keys
    Object.keys(localStorage).forEach(key => {
      if (
        key.startsWith('cart_') ||
        key.startsWith('orderId_') ||
        key.startsWith('orderNumber_') ||
        key.startsWith('customer_') ||
        key.startsWith('instructions_') ||
        key.startsWith('cancelledOrder_')
      ) {
        localStorage.removeItem(key);
      }
    });
  } catch (e) {
    console.error('Error clearing table session:', e);
  }
};
