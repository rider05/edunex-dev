import React, { useState } from "react";
import {
  ExternalLink,
  Copy,
  Trash2,
  CheckCircle2,
  Clock,
  AlertOctagon,
  Flame,
} from "lucide-react";

export default function TableView({
  reports,
  onSelectBug,
  onStatusChange,
  onDeleteBug,
  onCopyJson,
  selectedBugIds,
  setSelectedBugIds,
  onBatchStatusChange,
  onBatchDelete,
}) {
  const allIds = reports.map((r) => r.id || r._id);
  const isAllSelected = allIds.length > 0 && selectedBugIds.length === allIds.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedBugIds([]);
    } else {
      setSelectedBugIds(allIds);
    }
  };

  const handleToggleRow = (id, e) => {
    e.stopPropagation();
    setSelectedBugIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="table-wrapper">
      {/* Batch Action Bar */}
      {selectedBugIds.length > 0 && (
        <div className="batch-action-bar">
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 600 }}>
            <span>{selectedBugIds.length} incidents selected</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onBatchStatusChange("in_progress")}
            >
              <Clock size={13} className="text-amber" />
              <span>Mark In Progress</span>
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onBatchStatusChange("resolved")}
            >
              <CheckCircle2 size={13} className="text-emerald" />
              <span>Mark Resolved</span>
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={onBatchDelete}
            >
              <Trash2 size={13} />
              <span>Delete ({selectedBugIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* High-density Table */}
      <table className="dev-table">
        <thead>
          <tr>
            <th style={{ width: 40, textAlign: "center" }}>
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleSelectAll}
                aria-label="Select all"
              />
            </th>
            <th style={{ width: 130 }}>Status</th>
            <th style={{ width: 100 }}>Severity</th>
            <th>Title & Issue Summary</th>
            <th style={{ width: 140 }}>Screen / Module</th>
            <th style={{ width: 170 }}>Reporter</th>
            <th style={{ width: 130 }}>Logged At</th>
            <th style={{ width: 100, textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ textAlign: "center", padding: "48px 12px", color: "var(--text-dim)" }}>
                No incidents found matching the filter criteria.
              </td>
            </tr>
          ) : (
            reports.map((bug) => {
              const id = bug.id || bug._id;
              const isSelected = selectedBugIds.includes(id);

              return (
                <tr
                  key={id}
                  className={isSelected ? "table-row-selected" : ""}
                  style={{ cursor: "pointer" }}
                  onClick={() => onSelectBug(bug)}
                >
                  {/* Checkbox */}
                  <td style={{ textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleToggleRow(id, e)}
                    />
                  </td>

                  {/* Status Dropdown */}
                  <td onClick={(e) => e.stopPropagation()}>
                    <select
                      className="filter-select"
                      style={{ padding: "3px 7px", fontSize: 11.5 }}
                      value={bug.status || "open"}
                      onChange={(e) => onStatusChange(id, e.target.value)}
                    >
                      <option value="open">🔴 Open</option>
                      <option value="in_progress">🟡 In Progress</option>
                      <option value="resolved">🟢 Resolved</option>
                      <option value="closed">⚪ Closed</option>
                    </select>
                  </td>

                  {/* Severity Badge */}
                  <td>
                    <span className={`badge badge-${bug.severity || "medium"}`}>
                      {bug.severity === "critical" && <Flame size={10} />}
                      {bug.severity || "medium"}
                    </span>
                  </td>

                  {/* Title & Description */}
                  <td>
                    <div style={{ fontWeight: 700, color: "var(--text-main)", marginBottom: 2 }}>
                      {bug.title}
                    </div>
                    {bug.description && (
                      <div
                        style={{
                          fontSize: 11.5,
                          color: "var(--text-muted)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: 420,
                        }}
                      >
                        {bug.description}
                      </div>
                    )}
                  </td>

                  {/* Screen / Module */}
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: "rgba(59, 130, 246, 0.12)",
                        color: "#93c5fd",
                        textTransform: "none",
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                      }}
                    >
                      📱 {bug.screen || "General"}
                    </span>
                  </td>

                  {/* Reporter */}
                  <td>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-main)" }}>
                      {bug.reporter?.name || bug.reporter?.username || "Unknown"}
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 2 }}>
                      <span className={`role-badge role-${bug.reporter?.role || "user"}`}>
                        {bug.reporter?.role || "user"}
                      </span>
                      {bug.reporter?.rollNo && (
                        <span style={{ fontSize: 10.5, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                          #{bug.reporter.rollNo}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Logged At */}
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)" }}>
                    {bug.createdAt
                      ? new Date(bug.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Recently"}
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: "inline-flex", gap: 5 }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: "4px 7px" }}
                        title="Copy JSON payload"
                        onClick={() => onCopyJson(bug)}
                      >
                        <Copy size={12} />
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        style={{ padding: "4px 7px" }}
                        title="Delete record"
                        onClick={() => onDeleteBug(id)}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
