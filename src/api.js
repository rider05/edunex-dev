const STORAGE_KEY = "edunex_dev_api_url";
export const DEFAULT_API_URL = "https://edunex-backend-rmvx.onrender.com/api/v1";

export function getApiBaseUrl() {
  try {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_API_URL;
  } catch {
    return DEFAULT_API_URL;
  }
}

export function setApiBaseUrl(url) {
  try {
    if (!url) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, String(url).replace(/\/+$/, ""));
    }
  } catch {}
}

export function getRootUrl() {
  return getApiBaseUrl().replace(/\/api\/v1\/?$/, "");
}

export async function fetchBugReports() {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/bugReports?limit=200`, {
    headers: { "Accept": "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const json = await res.json();
  return Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
}

export async function updateBugReport(id, updates) {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/bugReports/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...updates, updatedAt: new Date().toISOString() }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

export async function deleteBugReport(id) {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/bugReports/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchSystemHealth() {
  const root = getRootUrl();
  const res = await fetch(`${root}/health`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchDatabaseStats() {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/stats`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
