import { getApiOrigin } from '../config/api';

/**
 * Resolve upload / media URLs for admin previews.
 * Upgrades http→https and joins relative /uploads paths to the API origin.
 */
export function resolveMediaUrl(url) {
  if (!url) return '';
  let value = String(url).trim();
  if (!value) return '';

  // Already-stored absolute http URLs (mixed content) → https
  if (/^http:\/\//i.test(value)) {
    value = `https://${value.slice(7)}`;
  }

  if (/^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);
      parsed.protocol = 'https:';
      return parsed.toString();
    } catch {
      return value;
    }
  }

  const origin = getApiOrigin();
  return `${origin}${value.startsWith('/') ? '' : '/'}${value}`;
}

export default resolveMediaUrl;
