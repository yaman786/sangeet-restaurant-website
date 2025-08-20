import toast from 'react-hot-toast';

/**
 * Universal logout function that clears all authentication data
 * and redirects to login page
 */
export const logout = (navigate) => {
  try {
    // Clear all possible authentication tokens and user data
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('kitchenToken');
    localStorage.removeItem('kitchenUser');
    
    // Show success message
    toast.success('Logged out successfully');
    
    // Redirect to login page
    navigate('/login');
    
    console.log('🔓 User logged out successfully');
  } catch (error) {
    console.error('Error during logout:', error);
    // Still redirect to login even if there's an error
    navigate('/login');
  }
};

/**
 * Check if user is authenticated (any role)
 */
export const isAuthenticated = () => {
  const authToken = localStorage.getItem('authToken');
  const adminToken = localStorage.getItem('adminToken');
  const kitchenToken = localStorage.getItem('kitchenToken');
  
  return !!(authToken || adminToken || kitchenToken);
};

/**
 * Get current user data (from any stored location)
 */
export const getCurrentUser = () => {
  try {
    // Try to get user from different storage locations
    let user = null;
    
    if (localStorage.getItem('authUser')) {
      user = JSON.parse(localStorage.getItem('authUser'));
    } else if (localStorage.getItem('adminUser')) {
      user = JSON.parse(localStorage.getItem('adminUser'));
    } else if (localStorage.getItem('kitchenUser')) {
      user = JSON.parse(localStorage.getItem('kitchenUser'));
    }
    
    return user;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Get user role
 */
export const getUserRole = () => {
  const user = getCurrentUser();
  return user?.role || null;
};

/**
 * Check if user has admin role
 */
export const isAdmin = () => {
  return getUserRole() === 'admin';
};

/**
 * Check if user has staff role
 */
export const isStaff = () => {
  return getUserRole() === 'staff';
};
