import React, { useState, useEffect, useCallback } from "react";
import {
  fetchBugReports,
  updateBugReport,
  deleteBugReport,
  fetchSystemHealth,
  getApiBaseUrl,
  setApiBaseUrl,
  DEFAULT_API_URL,
} from "./api";

export default function App() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [health, setHealth] = useState(null);
  const [activeUrl, setActiveUrl] = useState(getApiBaseUrl());
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState(getApiBaseUrl());

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  // Editing Developer Notes
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [devNotesText, setDevNotesText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [bugList, healthRes] = await Promise.allSettled([
        fetchBugReports(),
        fetchSystemHealth(),
      ]);

      if (bugList.status === "fulfilled") {
        setReports(bugList.value || []);
        setError(null);
      } else {
        setError(`Could not load bug reports from ${getApiBaseUrl()}. Check server status.`);
      }

      if (healthRes.status === "fulfilled") {
        setHealth(healthRes.value);
      } else {
        setHealth(null);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleSwitchEndpoint = (url) => {
    setApiBaseUrl(url);
    setActiveUrl(url);
    setShowUrlModal(false);
    setLoading(true);
    setTimeout(() => {
      loadData();
    }, 100);
  };

  // Metrics
  const totalCount = reports.length;
  const openCount = reports.filter((r) => r.status === "open").length;
  const inProgressCount = reports.filter((r) => r.status === "in_progress").length;
  const resolvedCount = reports.filter((r) => r.status === "resolved" || r.status === "closed").length;
  const criticalCount = reports.filter((r) => r.severity === "critical").length;

  // Filtered List
  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      !searchQuery ||
      r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.screen?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reporter?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reporter?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const matchesSeverity = severityFilter === "all" || r.severity === severityFilter;
    const matchesRole = roleFilter === "all" || r.reporter?.role === roleFilter;

    return matchesSearch && matchesStatus && matchesSeverity && matchesRole;
  });

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateBugReport(id, { status: newStatus });
      setReports((prev) =>
        prev.map((r) => (r.id === id || r._id === id ? { ...r, status: newStatus } : r))
      );
    } catch (e) {
      alert("Failed to update status: " + e.message);
    }
  };

  const handleSaveNotes = async (id) => {
    setSavingNote(true);
    try {
      await updateBugReport(id, { devNotes: devNotesText });
      setReports((prev) =>
        prev.map((r) => (r.id === id || r._id === id ? { ...r, devNotes: devNotesText } : r))
      );
      setEditingNotesId(null);
    } catch (e) {
      alert("Failed to save note: " + e.message);
    } finally {
      setSavingNote(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this bug report record?")) return;
    try {
      await deleteBugReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id && r._id !== id));
    } catch (e) {
      alert("Failed to delete bug report: " + e.message);
    }
  };

  const handleCopyJson = (report) => {
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    alert("📋 Copied Bug Report JSON to Clipboard!");
  };

  return (
    <div className="dev-container">
      {/* Header */}
      <header className="dev-header">
        <div className="dev-brand">
          <div className="dev-logo-badge">⚡</div>
          <div>
            <h1 className="dev-title">EduNex Dev Console</h1>
            <p className="dev-sub">Developer Controls & Diagnostic Bug Desk</p>
          </div>
        </div>

        <div className="dev-header-actions">
          {/* Active Backend Endpoint Pill */}
          <button
            className="btn btn-secondary"
            onClick={() => {
              setCustomUrlInput(activeUrl);
              setShowUrlModal(true);
            }}
            title="Click to switch backend environment"
            style={{ fontSize: 11, fontFamily: "var(--font-mono)", display: "flex", alignItems: "center", gap: 6 }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: health ? "#10b981" : "#ef4444",
                boxShadow: health ? "0 0 8px #10b981" : "0 0 8px #ef4444",
              }}
            />
            {activeUrl.includes("render.com") ? "☁️ Render Cloud" : "💻 Localhost"}
          </button>

          <button className="btn btn-secondary" onClick={loadData}>
            🔄 Refresh Desk
          </button>
        </div>
      </header>

      {/* Endpoint Switcher Modal */}
      {showUrlModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 20,
          }}
        >
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: 14,
              padding: 24,
              maxWidth: 480,
              width: "100%",
            }}
          >
            <h3 style={{ marginBottom: 12, fontSize: 16 }}>🌐 Switch Backend API Environment</h3>
            <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 16 }}>
              Select an environment or enter a custom backend API base URL:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              <button
                className="btn btn-secondary"
                style={{
                  justifyContent: "flex-start",
                  padding: 10,
                  borderColor: activeUrl.includes("render.com") ? "#10b981" : "var(--border-color)",
                }}
                onClick={() => handleSwitchEndpoint("https://edunex-backend-rmvx.onrender.com/api/v1")}
              >
                ☁️ <strong>Live Render Cloud:</strong> https://edunex-backend-rmvx.onrender.com/api/v1
              </button>

              <button
                className="btn btn-secondary"
                style={{
                  justifyContent: "flex-start",
                  padding: 10,
                  borderColor: activeUrl.includes("localhost:8080") ? "#10b981" : "var(--border-color)",
                }}
                onClick={() => handleSwitchEndpoint("http://localhost:8080/api/v1")}
              >
                💻 <strong>Local Development:</strong> http://localhost:8080/api/v1
              </button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11.5, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                Custom API URL:
              </label>
              <input
                type="text"
                className="search-input"
                style={{ width: "100%" }}
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button className="btn btn-secondary" onClick={() => setShowUrlModal(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleSwitchEndpoint(customUrlInput.trim())}
              >
                Apply & Connect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Banner */}
      <div className="stats-grid">
        <div className="stat-box" style={{ borderLeft: "3px solid #06b6d4" }}>
          <div className="stat-label">Total Reports</div>
          <div className="stat-num" style={{ color: "#06b6d4" }}>
            {totalCount}
          </div>
        </div>
        <div className="stat-box" style={{ borderLeft: "3px solid #ef4444" }}>
          <div className="stat-label">Open / Pending</div>
          <div className="stat-num" style={{ color: "#ef4444" }}>
            {openCount}
          </div>
        </div>
        <div className="stat-box" style={{ borderLeft: "3px solid #f59e0b" }}>
          <div className="stat-label">In Progress</div>
          <div className="stat-num" style={{ color: "#f59e0b" }}>
            {inProgressCount}
          </div>
        </div>
        <div className="stat-box" style={{ borderLeft: "3px solid #10b981" }}>
          <div className="stat-label">Resolved / Fixed</div>
          <div className="stat-num" style={{ color: "#10b981" }}>
            {resolvedCount}
          </div>
        </div>
        <div className="stat-box" style={{ borderLeft: "3px solid #f87171" }}>
          <div className="stat-label">Critical Priority</div>
          <div className="stat-num" style={{ color: "#f87171" }}>
            {criticalCount}
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="toolbar">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search bugs, reporter, screens, or keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="filter-group">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="open">🔴 Open</option>
            <option value="in_progress">🟡 In Progress</option>
            <option value="resolved">🟢 Resolved</option>
            <option value="closed">⚪ Closed</option>
          </select>

          <select
            className="filter-select"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            className="filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="student">Student</option>
            <option value="parent">Parent</option>
            <option value="staff">Staff / Faculty</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid #ef4444",
            padding: "12px 16px",
            borderRadius: 8,
            marginBottom: 20,
            color: "#fca5a5",
            fontSize: 13,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>⚠️ {error}</span>
          <button
            className="btn btn-secondary"
            style={{ padding: "4px 8px", fontSize: 11 }}
            onClick={() => handleSwitchEndpoint("https://edunex-backend-rmvx.onrender.com/api/v1")}
          >
            Switch to Render Cloud
          </button>
        </div>
      )}

      {/* Bug Reports Feed */}
      {loading ? (
        <div className="empty-state">Loading bug reports & developer telemetry...</div>
      ) : filteredReports.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 36, marginBottom: 12 }}>🎉</div>
          <h3>No bug reports matching criteria</h3>
          <p style={{ marginTop: 6, fontSize: 13 }}>
            User bug reports submitted from mobile app will appear here in real-time.
          </p>
        </div>
      ) : (
        <div className="bugs-grid">
          {filteredReports.map((bug) => {
            const id = bug.id || bug._id;
            const isEditingNote = editingNotesId === id;

            return (
              <div key={id} className="bug-card">
                <div className="bug-card-top">
                  <div>
                    <div className="bug-title-row">
                      <span className={`badge badge-${bug.status || "open"}`}>
                        {bug.status || "open"}
                      </span>
                      <span className={`badge badge-${bug.severity || "medium"}`}>
                        {bug.severity || "medium"}
                      </span>
                      <span className="badge" style={{ background: "#3b82f620", color: "#60a5fa" }}>
                        📁 {bug.category || "Bug"}
                      </span>
                      <span className="badge" style={{ background: "#8b5cf620", color: "#c084fc" }}>
                        📱 {bug.screen || "General"}
                      </span>
                      <h3 className="bug-title">{bug.title}</h3>
                    </div>
                  </div>

                  {/* 1-Click Status Transitions */}
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <select
                      className="filter-select"
                      value={bug.status || "open"}
                      onChange={(e) => handleStatusChange(id, e.target.value)}
                      style={{ padding: "4px 8px", fontSize: 11.5 }}
                    >
                      <option value="open">🔴 Open</option>
                      <option value="in_progress">🟡 In Progress</option>
                      <option value="resolved">🟢 Resolved</option>
                      <option value="closed">⚪ Closed</option>
                    </select>

                    <button
                      className="btn btn-secondary"
                      style={{ padding: "5px 8px" }}
                      onClick={() => handleCopyJson(bug)}
                      title="Copy JSON Payload"
                    >
                      📋
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ padding: "5px 8px" }}
                      onClick={() => handleDelete(id)}
                      title="Delete Record"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Bug Description */}
                <div className="bug-desc">{bug.description}</div>

                {/* Developer Diagnostic Notes */}
                <div style={{ margin: "10px 0" }}>
                  {isEditingNote ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <textarea
                        className="search-input"
                        style={{ width: "100%", minHeight: 60, fontFamily: "var(--font-mono)", fontSize: 12 }}
                        value={devNotesText}
                        onChange={(e) => setDevNotesText(e.target.value)}
                        placeholder="Add developer diagnostic notes, root cause, or PR link..."
                      />
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleSaveNotes(id)}
                          disabled={savingNote}
                        >
                          {savingNote ? "Saving..." : "Save Note"}
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => setEditingNotesId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>
                        🛠️ Dev Note: {bug.devNotes || "No developer notes added yet."}
                      </span>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: "2px 8px", fontSize: 11 }}
                        onClick={() => {
                          setEditingNotesId(id);
                          setDevNotesText(bug.devNotes || "");
                        }}
                      >
                        ✏️ {bug.devNotes ? "Edit" : "Add Note"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Metadata Footer */}
                <div className="bug-meta-bar">
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <div className="bug-reporter-pill">
                      👤 {bug.reporter?.name || "User"} (@{bug.reporter?.username || "anon"})
                    </div>
                    <div className="bug-reporter-pill">
                      🎭 Role: {(bug.reporter?.role || "user").toUpperCase()}
                    </div>
                    {bug.reporter?.rollNo && (
                      <div className="bug-reporter-pill">
                        🆔 {bug.reporter.rollNo}
                      </div>
                    )}
                    <div className="bug-reporter-pill">
                      📲 {bug.device?.platform ? `${bug.device.platform.toUpperCase()} (${bug.device.appVersion || "v1.0"})` : "Mobile App"}
                    </div>
                  </div>

                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
                    🕒 {new Date(bug.createdAt || Date.now()).toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
