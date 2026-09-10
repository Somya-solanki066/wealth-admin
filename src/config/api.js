function stripTrailingSlash(url) {
  return String(url || "").replace(/\/+$/, "");
}

/** Split comma/semicolon-separated env URL lists. First entry is primary. */
function parseEnvUrls(value) {
  if (!value) return [];
  return String(value)
    .split(/[,;\n]+/)
    .map((part) => part.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
}

function getRawApiUrl() {
  const urls = parseEnvUrls(import.meta.env.VITE_API_URL);
  return urls[0] || "http://localhost:5000/api";
}

/** All configured API base URLs from VITE_API_URL. */
export const getApiUrls = () => {
  const urls = parseEnvUrls(import.meta.env.VITE_API_URL);
  const seen = new Set();
  const out = [];
  for (const raw of urls.length ? urls : ["http://localhost:5000/api"]) {
    const origin = stripTrailingSlash(raw).replace(/\/api$/i, "");
    if (seen.has(origin)) continue;
    seen.add(origin);
    out.push(origin);
  }
  return out;
};

export const getApiOrigin = () => stripTrailingSlash(getRawApiUrl()).replace(/\/api$/i, "");

export const getApiUrl = () => `${getApiOrigin()}/api`;

export default {
  baseURL: getApiUrl(),
  timeout: 10000,
};
