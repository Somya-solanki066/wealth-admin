import { getApiOrigin } from '../config/api';

/**
 * Get full image URL from relative path
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  let path = String(imagePath).trim();
  if (!path) return null;

  // Upgrade mixed-content http URLs
  if (/^http:\/\//i.test(path)) {
    path = `https://${path.slice(7)}`;
  }

  // Already a full URL
  if (/^https?:\/\//i.test(path)) {
    try {
      const parsed = new URL(path);
      if (parsed.pathname.startsWith('/uploads/')) {
        parsed.protocol = 'https:';
        return parsed.toString();
      }
    } catch {
      return path;
    }
    return path;
  }

  // Relative path - add base URL (HTTPS when admin is HTTPS)
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${getApiOrigin()}${cleanPath}`;
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

