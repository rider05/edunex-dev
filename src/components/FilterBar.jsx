import React from "react";
import { Search, X, Download, Filter, SlidersHorizontal } from "lucide-react";

export default function FilterBar({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  severityFilter,
  setSeverityFilter,
  roleFilter,
  setRoleFilter,
  screenFilter,
  setScreenFilter,
  availableScreens,
  filteredCount,
  totalCount,
  onExportCsv,
  onExportJson,
}) {
  const isFiltered =
    searchQuery ||
    statusFilter !== "all" ||
    severityFilter !== "all" ||
    roleFilter !== "all" ||
    screenFilter !== "all";

  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSeverityFilter("all");
    setRoleFilter("all");
    setScreenFilter("all");
  };

  return (
    <div className="filter-bar">
      <div className="filter-left-controls">
        {/* Search Input */}
        <div className="search-input-wrap">
          <Search size={15} className="search-icon-inside" />
          <input
            type="text"
            className="search-input"
            placeholder="Search title, desc, roll no, reporter, screen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="filter-selects">
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
            <option value="faculty">Faculty / Staff</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>

          {availableScreens && availableScreens.length > 0 && (
            <select
              className="filter-select"
              value={screenFilter}
              onChange={(e) => setScreenFilter(e.target.value)}
            >
              <option value="all">All Screens</option>
              {availableScreens.map((screen) => (
                <option key={screen} value={screen}>
                  📱 {screen}
                </option>
              ))}
            </select>
          )}

          {isFiltered && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={clearAllFilters}
              style={{ color: "var(--cyan-400)" }}
              title="Reset all filters"
            >
              <X size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Right Tools & Export */}
      <div className="filter-actions">
        <span style={{ fontSize: 11.5, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          Showing <strong>{filteredCount}</strong> of {totalCount}
        </span>

        <button
          className="btn btn-secondary btn-sm"
          onClick={onExportCsv}
          title="Export displayed reports as CSV"
        >
          <Download size={13} />
          <span>CSV</span>
        </button>

        <button
          className="btn btn-secondary btn-sm"
          onClick={onExportJson}
          title="Export displayed reports as JSON"
        >
          <Download size={13} />
          <span>JSON</span>
        </button>
      </div>
    </div>
  );
}
