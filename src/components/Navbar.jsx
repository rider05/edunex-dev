import React, { useState } from "react";
import {
  Activity,
  Kanban,
  Table as TableIcon,
  BarChart3,
  Server,
  PlusCircle,
  RefreshCw,
  Globe,
  Check,
  Zap,
} from "lucide-react";
import { getRootUrl } from "../api";

export default function Navbar({
  activeTab,
  setActiveTab,
  activeUrl,
  onSwitchEndpoint,
  health,
  pingData,
  onRefresh,
  loading,
  refreshInterval,
  setRefreshInterval,
  onOpenSimulator,
  totalBugsCount,
}) {
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [customInput, setCustomInput] = useState(activeUrl);

  const getLatencyClass = () => {
    if (!pingData || !pingData.ok) return "slow";
    if (pingData.latency < 250) return "fast";
    if (pingData.latency < 800) return "moderate";
    return "slow";
  };

  const isCloud = activeUrl.includes("render.com");
  const isLocal = activeUrl.includes("localhost");

  return (
    <>
      <header className="dev-header">
        {/* Brand */}
        <div className="dev-brand">
          <div className="dev-logo-badge" title="EduNex Dev Operations">
            ⚡
          </div>
          <div className="dev-title-wrap">
            <div className="dev-title-row">
              <h1 className="dev-title">EduNex BugOps</h1>
              <span className="dev-version-pill">Dev Studio v2.4</span>
            </div>
            <div className="dev-sub">
              <span>Telemetry & Crash Diagnostics Desk</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="dev-nav-tabs">
          <button
            className={`nav-tab-btn ${activeTab === "kanban" ? "active" : ""}`}
            onClick={() => setActiveTab("kanban")}
          >
            <Kanban size={14} />
            <span>Kanban</span>
            <span className="tab-badge">{totalBugsCount}</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === "table" ? "active" : ""}`}
            onClick={() => setActiveTab("table")}
          >
            <TableIcon size={14} />
            <span>Table View</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            <BarChart3 size={14} />
            <span>Analytics</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === "telemetry" ? "active" : ""}`}
            onClick={() => setActiveTab("telemetry")}
          >
            <Server size={14} />
            <span>Telemetry</span>
            {health && <span className="status-dot online" style={{ width: 6, height: 6 }} />}
          </button>
        </div>

        {/* Right Actions */}
        <div className="dev-header-actions">
          {/* Quick Bug Simulator Button */}
          <button
            className="btn btn-accent btn-sm"
            onClick={onOpenSimulator}
            title="Simulate or inject test bug report"
          >
            <PlusCircle size={14} />
            <span>Simulate Bug</span>
          </button>

          {/* Active Backend Environment Chip */}
          <button
            className="endpoint-chip"
            onClick={() => {
              setCustomInput(activeUrl);
              setShowUrlModal(true);
            }}
            title="Click to switch backend environment"
          >
            <span className={`status-dot ${health ? "online" : "offline"}`} />
            <span>{isCloud ? "Render Cloud" : isLocal ? "Localhost:8080" : "Custom API"}</span>
            {pingData && (
              <span className={`latency-badge ${getLatencyClass()}`}>
                {pingData.ok ? `${pingData.latency}ms` : "Down"}
              </span>
            )}
          </button>

          {/* Auto Refresh Select */}
          <select
            className="filter-select btn-sm"
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            title="Auto-refresh polling interval"
          >
            <option value={0}>Refresh: Off</option>
            <option value={5000}>Refresh: 5s</option>
            <option value={10000}>Refresh: 10s</option>
            <option value={30000}>Refresh: 30s</option>
          </select>

          {/* Refresh Action */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={onRefresh}
            disabled={loading}
            title="Fetch latest updates"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Sync</span>
          </button>
        </div>
      </header>

      {/* Switch Backend Modal */}
      {showUrlModal && (
        <div className="modal-backdrop" onClick={() => setShowUrlModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Globe size={20} className="text-cyan" />
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Backend API Environment</h3>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 16 }}>
              Route BugOps desk telemetry and report ingestion to live cloud or local development server.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              <button
                className="btn btn-secondary"
                style={{
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  borderColor: isCloud ? "var(--emerald-500)" : "var(--border-subtle)",
                  background: isCloud ? "rgba(16, 185, 129, 0.08)" : "var(--bg-surface)",
                }}
                onClick={() => {
                  onSwitchEndpoint("https://edunex-backend-rmvx.onrender.com/api/v1");
                  setShowUrlModal(false);
                }}
              >
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                    ☁️ Live Render Cloud (Production)
                    {isCloud && <Check size={14} className="text-emerald" />}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                    https://edunex-backend-rmvx.onrender.com/api/v1
                  </div>
                </div>
              </button>

              <button
                className="btn btn-secondary"
                style={{
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  borderColor: isLocal ? "var(--emerald-500)" : "var(--border-subtle)",
                  background: isLocal ? "rgba(16, 185, 129, 0.08)" : "var(--bg-surface)",
                }}
                onClick={() => {
                  onSwitchEndpoint("http://localhost:8080/api/v1");
                  setShowUrlModal(false);
                }}
              >
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                    💻 Local Development (Localhost)
                    {isLocal && <Check size={14} className="text-emerald" />}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                    http://localhost:8080/api/v1
                  </div>
                </div>
              </button>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11.5, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                Custom API Base URL:
              </label>
              <input
                type="text"
                className="search-input"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="https://your-api.com/api/v1"
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button className="btn btn-secondary" onClick={() => setShowUrlModal(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (customInput.trim()) {
                    onSwitchEndpoint(customInput.trim());
                    setShowUrlModal(false);
                  }
                }}
              >
                Apply & Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
