import React from "react";
import { Bug, Clock, CheckCircle2, AlertOctagon, Flame } from "lucide-react";

export default function StatsBanner({
  reports,
  statusFilter,
  setStatusFilter,
  severityFilter,
  setSeverityFilter,
}) {
  const total = reports.length;
  const openCount = reports.filter((r) => r.status === "open").length;
  const inProgressCount = reports.filter((r) => r.status === "in_progress").length;
  const resolvedCount = reports.filter(
    (r) => r.status === "resolved" || r.status === "closed"
  ).length;
  const criticalCount = reports.filter((r) => r.severity === "critical").length;

  const resolutionRate = total > 0 ? Math.round((resolvedCount / total) * 100) : 0;

  const handleCardClick = (type, val) => {
    if (type === "status") {
      setStatusFilter((prev) => (prev === val ? "all" : val));
    } else if (type === "severity") {
      setSeverityFilter((prev) => (prev === val ? "all" : val));
    } else {
      setStatusFilter("all");
      setSeverityFilter("all");
    }
  };

  return (
    <div className="stats-grid">
      {/* Total Reports */}
      <div
        className={`stat-card ${statusFilter === "all" && severityFilter === "all" ? "active-filter" : ""}`}
        onClick={() => handleCardClick("reset")}
      >
        <div className="stat-card-glow" style={{ background: "var(--cyan-500)" }} />
        <div className="stat-header">
          <span className="stat-label">Total Volume</span>
          <div className="stat-icon" style={{ background: "rgba(6, 182, 212, 0.15)", color: "var(--cyan-400)" }}>
            <Bug size={16} />
          </div>
        </div>
        <div className="stat-number-row">
          <span className="stat-num" style={{ color: "var(--cyan-400)" }}>
            {total}
          </span>
        </div>
        <div className="stat-meta">
          <span>All tracked mobile & web incidents</span>
        </div>
        <div className="stat-progress-bar">
          <div
            className="stat-progress-fill"
            style={{ width: "100%", background: "var(--cyan-500)" }}
          />
        </div>
      </div>

      {/* Open / Triaging */}
      <div
        className={`stat-card ${statusFilter === "open" ? "active-filter" : ""}`}
        onClick={() => handleCardClick("status", "open")}
      >
        <div className="stat-card-glow" style={{ background: "var(--rose-500)" }} />
        <div className="stat-header">
          <span className="stat-label">Open / Unassigned</span>
          <div className="stat-icon" style={{ background: "rgba(239, 68, 68, 0.15)", color: "var(--rose-400)" }}>
            <Clock size={16} />
          </div>
        </div>
        <div className="stat-number-row">
          <span className="stat-num" style={{ color: "var(--rose-400)" }}>
            {openCount}
          </span>
          {total > 0 && (
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {Math.round((openCount / total) * 100)}%
            </span>
          )}
        </div>
        <div className="stat-meta">
          <span>Awaiting triage or diagnosis</span>
        </div>
        <div className="stat-progress-bar">
          <div
            className="stat-progress-fill"
            style={{
              width: `${total ? (openCount / total) * 100 : 0}%`,
              background: "var(--rose-500)",
            }}
          />
        </div>
      </div>

      {/* In Progress */}
      <div
        className={`stat-card ${statusFilter === "in_progress" ? "active-filter" : ""}`}
        onClick={() => handleCardClick("status", "in_progress")}
      >
        <div className="stat-card-glow" style={{ background: "var(--amber-500)" }} />
        <div className="stat-header">
          <span className="stat-label">In Active Fix</span>
          <div className="stat-icon" style={{ background: "rgba(245, 158, 11, 0.15)", color: "var(--amber-400)" }}>
            <AlertOctagon size={16} />
          </div>
        </div>
        <div className="stat-number-row">
          <span className="stat-num" style={{ color: "var(--amber-400)" }}>
            {inProgressCount}
          </span>
          {total > 0 && (
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {Math.round((inProgressCount / total) * 100)}%
            </span>
          )}
        </div>
        <div className="stat-meta">
          <span>Currently under developer investigation</span>
        </div>
        <div className="stat-progress-bar">
          <div
            className="stat-progress-fill"
            style={{
              width: `${total ? (inProgressCount / total) * 100 : 0}%`,
              background: "var(--amber-500)",
            }}
          />
        </div>
      </div>

      {/* Resolved */}
      <div
        className={`stat-card ${statusFilter === "resolved" ? "active-filter" : ""}`}
        onClick={() => handleCardClick("status", "resolved")}
      >
        <div className="stat-card-glow" style={{ background: "var(--emerald-500)" }} />
        <div className="stat-header">
          <span className="stat-label">Resolved / Closed</span>
          <div className="stat-icon" style={{ background: "rgba(16, 185, 129, 0.15)", color: "var(--emerald-400)" }}>
            <CheckCircle2 size={16} />
          </div>
        </div>
        <div className="stat-number-row">
          <span className="stat-num" style={{ color: "var(--emerald-400)" }}>
            {resolvedCount}
          </span>
          <span style={{ fontSize: 12, color: "var(--emerald-400)", fontWeight: 600 }}>
            {resolutionRate}% resolved
          </span>
        </div>
        <div className="stat-meta">
          <span>Fixed & verified in test build</span>
        </div>
        <div className="stat-progress-bar">
          <div
            className="stat-progress-fill"
            style={{
              width: `${resolutionRate}%`,
              background: "var(--emerald-500)",
            }}
          />
        </div>
      </div>

      {/* Critical */}
      <div
        className={`stat-card ${severityFilter === "critical" ? "active-filter" : ""}`}
        onClick={() => handleCardClick("severity", "critical")}
      >
        <div className="stat-card-glow" style={{ background: "linear-gradient(90deg, #ef4444, #f97316)" }} />
        <div className="stat-header">
          <span className="stat-label">Critical / Blockers</span>
          <div className="stat-icon" style={{ background: "rgba(239, 68, 68, 0.2)", color: "#f87171" }}>
            <Flame size={16} />
          </div>
        </div>
        <div className="stat-number-row">
          <span className="stat-num" style={{ color: "#f87171" }}>
            {criticalCount}
          </span>
          {criticalCount > 0 && (
            <span className="badge badge-critical" style={{ fontSize: 10 }}>
              Action Req.
            </span>
          )}
        </div>
        <div className="stat-meta">
          <span>Crash, data loss, or blocker bugs</span>
        </div>
        <div className="stat-progress-bar">
          <div
            className="stat-progress-fill"
            style={{
              width: `${total ? (criticalCount / total) * 100 : 0}%`,
              background: "var(--rose-500)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
