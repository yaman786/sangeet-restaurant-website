/**
 * Cart Management Utilities
 * Functions for managing cart data across the application
 */

/**
 * Clear all cart-related data from localStorage for a specific QR code
 * @param {string} qrCode - The QR code identifier
 * @param {string} tableNumber - The table number (optional, for additional clearing)
 */
export const clearCartData = (qrCode, tableNumber = null) => {
  try {
    console.log('🧹 Clearing cart data for QR code:', qrCode);
    
    // Clear all possible cart-related localStorage keys
    localStorage.removeItem(`cart_${qrCode}`);
    localStorage.removeItem(`customer_${qrCode}`);
    localStorage.removeItem(`instructions_${qrCode}`);
    
    // Also clear any table-based keys that might exist
    if (tableNumber) {
      localStorage.removeItem(`cart_${tableNumber}`);
      localStorage.removeItem(`customer_${tableNumber}`);
      localStorage.removeItem(`instructions_${tableNumber}`);
    }
    
    // Clear any other potential variations
    localStorage.removeItem(`cart_table_${tableNumber}`);
    localStorage.removeItem(`customer_table_${tableNumber}`);
    localStorage.removeItem(`instructions_table_${tableNumber}`);
    
    console.log('✅ Cart data cleared successfully');
    return true;
  } catch (error) {
    console.error('❌ Error clearing cart data:', error);
    return false;
  }
};

/**
 * Clear cart data for all possible QR codes and table numbers
 * This is used when an order is deleted and we need to clear all cart data
 */
export const clearAllCartData = () => {
  try {
    console.log('🧹 Clearing ALL cart data from localStorage');
    
    const keysToRemove = [];
    
    // Find all cart-related keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('cart') || key.includes('customer') || key.includes('instructions'))) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all found keys
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`🗑️ Removed: ${key}`);
    });
    
    console.log(`✅ Cleared ${keysToRemove.length} cart-related keys`);
    return true;
  } catch (error) {
    console.error('❌ Error clearing all cart data:', error);
    return false;
  }
};

/**
 * Get all cart-related localStorage keys for debugging
 * @param {string} qrCode - The QR code identifier
 * @param {string} tableNumber - The table number (optional)
 */
export const getCartDebugInfo = (qrCode, tableNumber = null) => {
  const debugInfo = {
    qrCode,
    tableNumber,
    localStorageKeys: [],
    cartData: null,
    customerData: null,
    instructionsData: null
  };
  
  // Get all localStorage keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('cart') || key.includes('customer') || key.includes('instructions'))) {
      debugInfo.localStorageKeys.push({
        key,
        value: localStorage.getItem(key)
      });
    }
  }
  
  // Get specific cart data
  debugInfo.cartData = localStorage.getItem(`cart_${qrCode}`);
  debugInfo.customerData = localStorage.getItem(`customer_${qrCode}`);
  debugInfo.instructionsData = localStorage.getItem(`instructions_${qrCode}`);
  
  if (tableNumber) {
    debugInfo.tableCartData = localStorage.getItem(`cart_${tableNumber}`);
    debugInfo.tableCustomerData = localStorage.getItem(`customer_${tableNumber}`);
    debugInfo.tableInstructionsData = localStorage.getItem(`instructions_${tableNumber}`);
  }
  
  return debugInfo;
};

/**
 * Extract QR code from current URL
 * @returns {string|null} QR code or null if not found
 */
export const getQRCodeFromURL = () => {
  const pathname = window.location.pathname;
  const qrMatch = pathname.match(/\/qr\/([^\/]+)/);
  return qrMatch ? qrMatch[1] : null;
};

/**
 * Extract table number from URL parameters
 * @returns {string|null} Table number or null if not found
 */
export const getTableNumberFromURL = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('table');
};
