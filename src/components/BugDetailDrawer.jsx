import React, { useState, useEffect } from "react";
import {
  X,
  Copy,
  Terminal,
  FileCode,
  Trash2,
  CheckCircle2,
  Clock,
  AlertOctagon,
  Smartphone,
  User,
  Calendar,
  Save,
  Code2,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function BugDetailDrawer({
  bug,
  onClose,
  onStatusChange,
  onSaveDevNote,
  onDelete,
  onShowToast,
}) {
  if (!bug) return null;

  const id = bug.id || bug._id;
  const [devNotes, setDevNotes] = useState(bug.devNotes || "");
  const [savingNote, setSavingNote] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  useEffect(() => {
    setDevNotes(bug.devNotes || "");
  }, [bug]);

  const handleSaveNote = async () => {
    setSavingNote(true);
    try {
      await onSaveDevNote(id, devNotes);
      onShowToast({
        type: "success",
        title: "Developer Note Saved",
        message: "Diagnostic note updated successfully.",
      });
    } catch (e) {
      onShowToast({
        type: "error",
        title: "Failed to Save",
        message: e.message,
      });
    } finally {
      setSavingNote(false);
    }
  };

  const handleStatusTransition = async (newStatus) => {
    await onStatusChange(id, newStatus);
    if (newStatus === "resolved") {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7, x: 0.8 },
        });
      } catch {}
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    onShowToast({
      type: "info",
      title: "Copied to Clipboard",
      message: `${label} copied!`,
    });
  };

  const generateGithubIssue = () => {
    const md = `### Bug Report: ${bug.title}

**Screen / Feature:** ${bug.screen || "General"}
**Severity:** ${bug.severity || "medium"}
**Status:** ${bug.status || "open"}
**Reporter:** ${bug.reporter?.name || "User"} (@${bug.reporter?.username || "anon"}) [${bug.reporter?.role || "user"}]
**Device:** ${bug.device?.platform || "Mobile"} | App Version: ${bug.device?.appVersion || "v1.0"}

#### Description
${bug.description}

#### Developer Notes
${devNotes || "None"}
`;
    copyToClipboard(md, "GitHub Issue Markdown");
  };

  const generateCurl = () => {
    const curl = `curl -X PUT "https://edunex-backend-rmvx.onrender.com/api/v1/bugReports/${id}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify({ status: bug.status || "open", devNotes: devNotes })}'`;
    copyToClipboard(curl, "cURL Command");
  };

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span className={`badge badge-${bug.status || "open"}`}>
              {bug.status || "open"}
            </span>
            <span className={`badge badge-${bug.severity || "medium"}`}>
              {bug.severity || "medium"}
            </span>
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              ID: {String(id).slice(-8)}
            </span>
          </div>

          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="drawer-body">
          {/* Title & Screen */}
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#fff", lineHeight: 1.35, marginBottom: 8 }}>
              {bug.title}
            </h2>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span
                className="badge"
                style={{
                  background: "rgba(59, 130, 246, 0.15)",
                  color: "#93c5fd",
                  textTransform: "none",
                }}
              >
                📱 Screen: {bug.screen || "General"}
              </span>
              <span
                className="badge"
                style={{
                  background: "rgba(139, 92, 246, 0.15)",
                  color: "#c4b5fd",
                  textTransform: "none",
                }}
              >
                📁 Category: {bug.category || "General Bug"}
              </span>
            </div>
          </div>

          {/* Status Workflow Action Bar */}
          <div className="drawer-section" style={{ background: "rgba(255, 255, 255, 0.02)" }}>
            <div className="drawer-section-title">Workflow Progression</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                className={`btn btn-sm ${bug.status === "open" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => handleStatusTransition("open")}
              >
                <Clock size={13} />
                <span>Open</span>
              </button>
              <button
                className={`btn btn-sm ${bug.status === "in_progress" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => handleStatusTransition("in_progress")}
              >
                <AlertOctagon size={13} />
                <span>In Progress</span>
              </button>
              <button
                className={`btn btn-sm ${bug.status === "resolved" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => handleStatusTransition("resolved")}
              >
                <CheckCircle2 size={13} />
                <span>Resolved</span>
              </button>
              <button
                className={`btn btn-sm ${bug.status === "closed" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => handleStatusTransition("closed")}
              >
                <span>Closed</span>
              </button>
            </div>
          </div>

          {/* Description Section */}
          <div className="drawer-section">
            <div className="drawer-section-title">Bug Description & User Statement</div>
            <div
              style={{
                fontSize: 13,
                lineHeight: 1.6,
                color: "var(--text-secondary)",
                whiteSpace: "pre-wrap",
                background: "var(--bg-input)",
                padding: "12px 14px",
                borderRadius: 8,
                border: "1px solid var(--border-subtle)",
              }}
            >
              {bug.description || "No description provided."}
            </div>
          </div>

          {/* Reporter & Device Info Grid */}
          <div className="drawer-section">
            <div className="drawer-section-title">Telemetry & Context</div>
            <div className="drawer-meta-grid">
              <div className="drawer-meta-item">
                <span className="drawer-meta-label">Reporter</span>
                <span className="drawer-meta-val">
                  {bug.reporter?.name || "Unknown"} (@{bug.reporter?.username || "anon"})
                </span>
              </div>
              <div className="drawer-meta-item">
                <span className="drawer-meta-label">Role</span>
                <span className="drawer-meta-val">
                  <span className={`role-badge role-${bug.reporter?.role || "user"}`}>
                    {bug.reporter?.role || "user"}
                  </span>
                </span>
              </div>
              {bug.reporter?.rollNo && (
                <div className="drawer-meta-item">
                  <span className="drawer-meta-label">Roll Number / ID</span>
                  <span className="drawer-meta-val">{bug.reporter.rollNo}</span>
                </div>
              )}
              <div className="drawer-meta-item">
                <span className="drawer-meta-label">Client Platform</span>
                <span className="drawer-meta-val">
                  {bug.device?.platform
                    ? `${bug.device.platform.toUpperCase()} (${bug.device.appVersion || "v1.0"})`
                    : "Mobile App"}
                </span>
              </div>
              <div className="drawer-meta-item">
                <span className="drawer-meta-label">Recorded At</span>
                <span className="drawer-meta-val">
                  {new Date(bug.createdAt || Date.now()).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Developer Notes & Diagnostics */}
          <div className="drawer-section">
            <div className="drawer-section-title" style={{ justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <MessageSquare size={13} className="text-cyan" />
                <span>Developer Diagnostic Notes</span>
              </div>
              <span style={{ fontSize: 10.5, color: "var(--text-muted)", textTransform: "none", fontWeight: 400 }}>
                Root cause, PR links, ticket notes
              </span>
            </div>

            <textarea
              className="search-input"
              style={{
                width: "100%",
                minHeight: 90,
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                lineHeight: 1.5,
                padding: 10,
                resize: "vertical",
              }}
              placeholder="e.g. Bug reproduced on Android 14. Fix pushed in PR #142. Awaiting QA verification."
              value={devNotes}
              onChange={(e) => setDevNotes(e.target.value)}
            />

            <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSaveNote}
                disabled={savingNote}
              >
                <Save size={13} />
                <span>{savingNote ? "Saving Note..." : "Save Note"}</span>
              </button>
            </div>
          </div>

          {/* Developer Quick Tools */}
          <div className="drawer-section">
            <div className="drawer-section-title">Developer Quick Actions</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => copyToClipboard(JSON.stringify(bug, null, 2), "JSON payload")}
              >
                <Copy size={13} />
                <span>Copy JSON</span>
              </button>
              <button className="btn btn-secondary btn-sm" onClick={generateCurl}>
                <Terminal size={13} />
                <span>Copy cURL</span>
              </button>
              <button className="btn btn-secondary btn-sm" onClick={generateGithubIssue}>
                <FileCode size={13} />
                <span>Export GitHub Issue MD</span>
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowRawJson(!showRawJson)}
              >
                <Code2 size={13} />
                <span>{showRawJson ? "Hide Raw Payload" : "View Raw Payload"}</span>
              </button>
            </div>

            {showRawJson && (
              <pre
                style={{
                  marginTop: 12,
                  background: "#070a12",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 8,
                  padding: 12,
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--cyan-400)",
                  maxHeight: 220,
                  overflowY: "auto",
                }}
              >
                {JSON.stringify(bug, null, 2)}
              </pre>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="drawer-footer">
          <button
            className="btn btn-danger btn-sm"
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this incident report?")) {
                onDelete(id);
                onClose();
              }
            }}
          >
            <Trash2 size={13} />
            <span>Delete Incident</span>
          </button>

          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
