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
      localStorage.setItem(STORAGE_KEY, String(url).trim().replace(/\/+$/, ""));
    }
  } catch {}
}

export function getRootUrl() {
  return getApiBaseUrl().replace(/\/api\/v1\/?$/, "");
}

/**
 * Measures round-trip ping time to server in milliseconds
 */
export async function pingBackend() {
  const root = getRootUrl();
  const start = performance.now();
  try {
    const res = await fetch(`${root}/health`, { cache: "no-store" });
    const latency = Math.round(performance.now() - start);
    return { ok: res.ok, status: res.status, latency };
  } catch (err) {
    const latency = Math.round(performance.now() - start);
    return { ok: false, status: 0, latency, error: err.message };
  }
}

export async function fetchBugReports() {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/bugReports?limit=250`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const json = await res.json();
  return Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
}

export async function createBugReport(payload) {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/bugReports`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      status: "open",
      createdAt: new Date().toISOString(),
      ...payload,
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
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
  try {
    const res = await fetch(`${base}/stats`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    try {
      const root = getRootUrl();
      const res2 = await fetch(`${root}/stats`);
      if (res2.ok) return await res2.json();
    } catch {}
    throw err;
  }
}

/**
 * Publishes a notification notice to the EduNex Notice Board & mobile notification stream
 */
export async function createNotice(payload) {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/notices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      category: "Bug Fix / Quality Update",
      author: "EduNex Engineering & BugOps Desk",
      sender: "EduNex Engineering & BugOps Desk",
      senderRole: "admin",
      priority: "high",
      isNew: true,
      date: new Date().toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      createdAt: new Date().toISOString(),
      ...payload,
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

/**
 * Sends a direct message to the user's mobile chat/inbox
 */
export async function createDirectMessage(payload) {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      senderId: "SYS-DEVOPS-DESK",
      senderName: "EduNex Engineering Desk",
      senderRole: "admin",
      read: false,
      createdAt: new Date().toISOString(),
      ...payload,
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

/**
 * Resolves a bug report and dispatches a warm, personalized greeting & thank-you notification
 * directly to the EduNex mobile app via Notices and Direct Messages
 */
export async function sendResolutionNotification(bug, { title, message, sendNotice = true, sendMessage = true }) {
  const bugId = bug.id || bug._id;
  const reporter = bug.reporter || {};

  const noticePromise = sendNotice
    ? createNotice({
        title,
        subject: title,
        content: message,
        message: message,
        text: message,
        body: message,
        targetUser: reporter.username,
        targetRollNo: reporter.rollNo,
        targetRole: reporter.role || "student",
        recipient: reporter.username || reporter.rollNo,
        metadata: {
          type: "bug_resolved",
          bugId,
          bugTitle: bug.title,
          screen: bug.screen,
          reporterName: reporter.name,
        },
      }).catch((e) => console.warn("Notice dispatch fallback:", e))
    : Promise.resolve(null);

  const messagePromise = sendMessage
    ? createDirectMessage({
        recipientId: reporter.rollNo || reporter.username || "all",
        receiverId: reporter.rollNo || reporter.username || "all",
        recipientName: reporter.name || "Valued User",
        receiverName: reporter.name || "Valued User",
        recipientRole: reporter.role || "student",
        receiverRole: reporter.role || "student",
        text: `🎉 ${title}\n\n${message}`,
        message: `🎉 ${title}\n\n${message}`,
      }).catch((e) => console.warn("Direct message fallback:", e))
    : Promise.resolve(null);

  const updateBugPromise = updateBugReport(bugId, {
    status: "resolved",
    resolvedAt: new Date().toISOString(),
    resolutionTitle: title,
    resolutionGreeting: message,
    notifiedUser: true,
    notifiedAt: new Date().toISOString(),
  });

  const [noticeResult, messageResult, updatedBug] = await Promise.all([
    noticePromise,
    messagePromise,
    updateBugPromise,
  ]);

  return {
    noticeResult,
    messageResult,
    updatedBug,
  };
}

