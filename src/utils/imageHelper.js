// Image Helper for Admin Panel
const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

/**
 * Get full image URL from relative path
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Already a full URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Relative path - add base URL
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${API_BASE_URL}${cleanPath}`;
};

/**
 * Get profile picture URL with fallback
 */
export const getProfilePictureUrl = (user, size = 40) => {
  if (!user) {
    return getInitialsAvatar('User', size);
  }
  
  // Get picture from various possible fields
  const picture = user.picture || user.avatar || user.profilePicture || user.profilePhoto;
  
  if (picture) {
    const fullUrl = getImageUrl(picture);
    if (fullUrl) return fullUrl;
  }
  
  // Fallback to initials avatar
  return getInitialsAvatar(user.name || user.fullName || 'User', size);
};

/**
 * Get initials avatar URL
 */
export const getInitialsAvatar = (name, size = 128) => {
  const safeName = name || 'User';
  const initials = safeName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  const color = getAvatarColor(safeName).replace('#', '');
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${color}&color=fff&size=${size}&bold=true`;
};

/**
 * Get avatar color based on name
 */
const getAvatarColor = (name) => {
  const colors = [
    '#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe',
    '#43e97b', '#fa709a', '#fee140', '#30cfd0', '#a8edea',
    '#ff9a9e', '#fecfef', '#fecfef', '#ffecd2', '#fcb69f'
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

