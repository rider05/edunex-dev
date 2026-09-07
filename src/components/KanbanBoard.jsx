import React from "react";
import {
  Clock,
  AlertOctagon,
  CheckCircle2,
  Archive,
  ChevronRight,
  MessageSquare,
  Smartphone,
  Flame,
} from "lucide-react";

export default function KanbanBoard({
  reports,
  onSelectBug,
  onStatusChange,
}) {
  const columns = [
    {
      id: "open",
      title: "Open / Triage",
      color: "var(--rose-500)",
      icon: <Clock size={15} className="text-rose" />,
      nextStatus: "in_progress",
      nextLabel: "Start Fix",
    },
    {
      id: "in_progress",
      title: "In Progress",
      color: "var(--amber-500)",
      icon: <AlertOctagon size={15} className="text-amber" />,
      nextStatus: "resolved",
      nextLabel: "Resolve",
    },
    {
      id: "resolved",
      title: "Resolved",
      color: "var(--emerald-500)",
      icon: <CheckCircle2 size={15} className="text-emerald" />,
      nextStatus: "closed",
      nextLabel: "Close",
    },
    {
      id: "closed",
      title: "Closed / Archived",
      color: "var(--text-muted)",
      icon: <Archive size={15} />,
      nextStatus: "open",
      nextLabel: "Reopen",
    },
  ];

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return "Recently";
    try {
      const date = new Date(timestamp);
      const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
      if (diffSec < 60) return "just now";
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="kanban-board">
      {columns.map((col) => {
        const colReports = reports.filter((r) => (r.status || "open") === col.id);

        return (
          <div key={col.id} className="kanban-column">
            {/* Column Header */}
            <div className="kanban-col-header">
              <div className="kanban-col-title-group">
                <span className="kanban-col-dot" style={{ backgroundColor: col.color }} />
                <span className="kanban-col-title">{col.title}</span>
              </div>
              <span className="kanban-col-count">{colReports.length}</span>
            </div>

            {/* Column Stack */}
            <div className="kanban-cards-stack">
              {colReports.length === 0 ? (
                <div
                  style={{
                    padding: "36px 12px",
                    textAlign: "center",
                    color: "var(--text-dim)",
                    fontSize: 12,
                    fontStyle: "italic",
                  }}
                >
                  No bugs in {col.title.toLowerCase()}
                </div>
              ) : (
                colReports.map((bug) => {
                  const id = bug.id || bug._id;
                  const reporterName = bug.reporter?.name || bug.reporter?.username || "Anonymous";
                  const role = bug.reporter?.role || "user";
                  const platform = bug.device?.platform || "mobile";

                  return (
                    <div
                      key={id}
                      className="kanban-card"
                      onClick={() => onSelectBug(bug)}
                    >
                      {/* Top Badges */}
                      <div className="kanban-card-top">
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
                          <span className={`badge badge-${bug.severity || "medium"}`}>
                            {bug.severity === "critical" && <Flame size={10} />}
                            {bug.severity || "med"}
                          </span>
                          {bug.screen && (
                            <span
                              className="badge"
                              style={{
                                background: "rgba(59, 130, 246, 0.15)",
                                color: "#93c5fd",
                                textTransform: "none",
                              }}
                            >
                              {bug.screen}
                            </span>
                          )}
                        </div>

                        {/* Quick Progression Button */}
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ padding: "2px 6px", fontSize: 10.5 }}
                          title={`Move to ${col.nextLabel}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onStatusChange(id, col.nextStatus);
                          }}
                        >
                          <span>{col.nextLabel}</span>
                          <ChevronRight size={11} />
                        </button>
                      </div>

                      {/* Title & Desc */}
                      <h4 className="kanban-card-title">{bug.title}</h4>
                      {bug.description && (
                        <p className="kanban-card-desc">{bug.description}</p>
                      )}

                      {/* Dev note snippet indicator */}
                      {bug.devNotes && (
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--cyan-400)",
                            background: "rgba(6, 182, 212, 0.08)",
                            padding: "4px 8px",
                            borderRadius: 4,
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <MessageSquare size={11} />
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {bug.devNotes}
                          </span>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="kanban-card-footer">
                        <div className="reporter-avatar-chip">
                          <div className="avatar-initials">
                            {getInitials(reporterName)}
                          </div>
                          <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600 }}>
                            {reporterName}
                          </span>
                          <span className={`role-badge role-${role}`}>
                            {role}
                          </span>
                        </div>

                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5 }}>
                          {formatRelativeTime(bug.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
