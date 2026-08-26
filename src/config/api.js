function stripTrailingSlash(url) {
  return String(url || "").replace(/\/+$/, "");
}

function getRawApiUrl() {
  return import.meta.env.VITE_API_URL || "http://localhost:5000/api";
}

export const getApiOrigin = () => stripTrailingSlash(getRawApiUrl()).replace(/\/api$/i, "");

export const getApiUrl = () => `${getApiOrigin()}/api`;

export default {
  baseURL: getApiUrl(),
  timeout: 10000,
};
