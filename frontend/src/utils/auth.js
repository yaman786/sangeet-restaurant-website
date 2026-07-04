import toast from 'react-hot-toast';

const TOKEN_KEY = 'sangeet_token';
const USER_KEY = 'sangeet_user';

/**
 * Universal logout function that clears all authentication data
 * and redirects to login page
 */
export const logout = (navigate) => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    
    // Clear old tokens just in case
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('kitchenToken');
    localStorage.removeItem('kitchenUser');
    
    // Show success message
    toast.success('Logged out successfully');
    
    // Redirect to login page
    if (navigate) {
      navigate('/login');
    }
    
    console.log('🔓 User logged out successfully');
  } catch (error) {
    console.error('Error during logout:', error);
    if (navigate) {
      navigate('/login');
    }
  }
};

/**
 * Check if user is authenticated (any role)
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem(TOKEN_KEY);
};

/**
 * Get current user data
 */
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
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
  return getUserRole() === 'staff' || getUserRole() === 'admin';
};
