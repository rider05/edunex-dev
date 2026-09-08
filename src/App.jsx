import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  fetchBugReports,
  updateBugReport,
  deleteBugReport,
  fetchSystemHealth,
  pingBackend,
  getApiBaseUrl,
  setApiBaseUrl,
} from "./api";

// Components
import Navbar from "./components/Navbar";
import StatsBanner from "./components/StatsBanner";
import FilterBar from "./components/FilterBar";
import KanbanBoard from "./components/KanbanBoard";
import TableView from "./components/TableView";
import AnalyticsView from "./components/AnalyticsView";
import ServerHealthView from "./components/ServerHealthView";
import BugDetailDrawer from "./components/BugDetailDrawer";
import BugSimulatorModal from "./components/BugSimulatorModal";
import ResolutionGreetingModal from "./components/ResolutionGreetingModal";
import Toast from "./components/Toast";

export default function App() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [health, setHealth] = useState(null);
  const [pingData, setPingData] = useState(null);
  const [activeUrl, setActiveUrl] = useState(getApiBaseUrl());

  // Views & Modals
  const [activeTab, setActiveTab] = useState("kanban"); // "kanban" | "table" | "analytics" | "telemetry"
  const [selectedBug, setSelectedBug] = useState(null);
  const [showSimulator, setShowSimulator] = useState(false);
  const [resolveGreetingBug, setResolveGreetingBug] = useState(null);
  const [selectedBugIds, setSelectedBugIds] = useState([]);

  // Toast
  const [toast, setToast] = useState(null);

  // Auto-refresh interval (ms)
  const [refreshInterval, setRefreshInterval] = useState(10000);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [screenFilter, setScreenFilter] = useState("all");

  const showToast = useCallback(({ type = "info", title, message }) => {
    setToast({ type, title, message, id: Date.now() });
  }, []);

  // Fetch Data & Telemetry
  const loadData = useCallback(async () => {
    try {
      const [bugList, healthRes, pingRes] = await Promise.allSettled([
        fetchBugReports(),
        fetchSystemHealth(),
        pingBackend(),
      ]);

      if (bugList.status === "fulfilled") {
        setReports(bugList.value || []);
        setError(null);
      } else {
        setError(`Could not fetch bug reports from ${getApiBaseUrl()}. Check server status.`);
      }

      if (healthRes.status === "fulfilled") {
        setHealth(healthRes.value);
      } else {
        setHealth(null);
      }

      if (pingRes.status === "fulfilled") {
        setPingData(pingRes.value);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Polling Interval
  useEffect(() => {
    loadData();
    if (refreshInterval > 0) {
      const interval = setInterval(loadData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [loadData, refreshInterval]);

  // Switch Backend URL
  const handleSwitchEndpoint = (url) => {
    setApiBaseUrl(url);
    setActiveUrl(url);
    setLoading(true);
    showToast({
      type: "info",
      title: "Environment Switched",
      message: `Connecting to ${url}...`,
    });
    setTimeout(() => {
      loadData();
    }, 150);
  };

  // Open Resolution Greeting Modal
  const handleOpenResolveGreeting = (bug) => {
    setResolveGreetingBug(bug);
  };

  // When greeting is successfully dispatched to mobile app
  const handleResolvedSuccess = (bugId, updates) => {
    setReports((prev) =>
      prev.map((r) => (r.id === bugId || r._id === bugId ? { ...r, ...updates } : r))
    );
    if (selectedBug && (selectedBug.id === bugId || selectedBug._id === bugId)) {
      setSelectedBug((prev) => ({ ...prev, ...updates }));
    }
  };

  // Status Transitions
  const handleStatusChange = async (id, newStatus) => {
    if (newStatus === "resolved") {
      const bug = reports.find((r) => r.id === id || r._id === id);
      if (bug) {
        handleOpenResolveGreeting(bug);
        return;
      }
    }

    try {
      // Optimistic update
      setReports((prev) =>
        prev.map((r) => (r.id === id || r._id === id ? { ...r, status: newStatus } : r))
      );
      if (selectedBug && (selectedBug.id === id || selectedBug._id === id)) {
        setSelectedBug((prev) => ({ ...prev, status: newStatus }));
      }

      await updateBugReport(id, { status: newStatus });
      showToast({
        type: "success",
        title: "Status Updated",
        message: `Incident moved to ${newStatus.replace("_", " ")}.`,
      });
    } catch (e) {
      showToast({
        type: "error",
        title: "Update Failed",
        message: e.message,
      });
      loadData(); // Revert
    }
  };

  // Save Developer Notes
  const handleSaveDevNote = async (id, devNotes) => {
    await updateBugReport(id, { devNotes });
    setReports((prev) =>
      prev.map((r) => (r.id === id || r._id === id ? { ...r, devNotes } : r))
    );
    if (selectedBug && (selectedBug.id === id || selectedBug._id === id)) {
      setSelectedBug((prev) => ({ ...prev, devNotes }));
    }
  };

  // Delete Bug
  const handleDeleteBug = async (id) => {
    if (!window.confirm("Permanently delete this incident report?")) return;
    try {
      await deleteBugReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id && r._id !== id));
      if (selectedBug && (selectedBug.id === id || selectedBug._id === id)) {
        setSelectedBug(null);
      }
      showToast({
        type: "info",
        title: "Incident Deleted",
        message: "Bug report removed from desk.",
      });
    } catch (e) {
      showToast({
        type: "error",
        title: "Delete Failed",
        message: e.message,
      });
    }
  };

  // Batch Status Change
  const handleBatchStatusChange = async (newStatus) => {
    if (selectedBugIds.length === 0) return;
    try {
      await Promise.all(selectedBugIds.map((id) => updateBugReport(id, { status: newStatus })));
      setReports((prev) =>
        prev.map((r) =>
          selectedBugIds.includes(r.id || r._id) ? { ...r, status: newStatus } : r
        )
      );
      showToast({
        type: "success",
        title: "Batch Update Complete",
        message: `Updated ${selectedBugIds.length} incident(s) to ${newStatus}.`,
      });
      setSelectedBugIds([]);
    } catch (e) {
      showToast({ type: "error", title: "Batch Update Failed", message: e.message });
    }
  };

  // Batch Delete
  const handleBatchDelete = async () => {
    if (!window.confirm(`Delete ${selectedBugIds.length} selected incidents?`)) return;
    try {
      await Promise.all(selectedBugIds.map((id) => deleteBugReport(id)));
      setReports((prev) =>
        prev.filter((r) => !selectedBugIds.includes(r.id || r._id))
      );
      showToast({
        type: "info",
        title: "Batch Deleted",
        message: `Removed ${selectedBugIds.length} incidents.`,
      });
      setSelectedBugIds([]);
    } catch (e) {
      showToast({ type: "error", title: "Batch Delete Failed", message: e.message });
    }
  };

  // Copy JSON
  const handleCopyJson = (bug) => {
    navigator.clipboard.writeText(JSON.stringify(bug, null, 2));
    showToast({
      type: "info",
      title: "Copied JSON",
      message: "Bug record JSON copied to clipboard.",
    });
  };

  // Dynamic list of unique screens
  const availableScreens = useMemo(() => {
    const screens = new Set();
    reports.forEach((r) => {
      if (r.screen) screens.add(r.screen);
    });
    return Array.from(screens).sort();
  }, [reports]);

  // Filtered Reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        r.title?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.screen?.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q) ||
        r.reporter?.username?.toLowerCase().includes(q) ||
        r.reporter?.name?.toLowerCase().includes(q) ||
        r.reporter?.rollNo?.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      const matchesSeverity = severityFilter === "all" || r.severity === severityFilter;
      const matchesRole = roleFilter === "all" || r.reporter?.role === roleFilter;
      const matchesScreen = screenFilter === "all" || r.screen === screenFilter;

      return matchesSearch && matchesStatus && matchesSeverity && matchesRole && matchesScreen;
    });
  }, [reports, searchQuery, statusFilter, severityFilter, roleFilter, screenFilter]);

  // Export CSV
  const handleExportCsv = () => {
    if (filteredReports.length === 0) {
      showToast({ type: "warning", title: "No Data", message: "No bug reports to export." });
      return;
    }

    const headers = ["ID", "Title", "Status", "Severity", "Screen", "Reporter", "Role", "Created At"];
    const rows = filteredReports.map((r) => [
      `"${r.id || r._id || ""}"`,
      `"${(r.title || "").replace(/"/g, '""')}"`,
      r.status || "open",
      r.severity || "medium",
      `"${r.screen || "General"}"`,
      `"${r.reporter?.name || ""}"`,
      r.reporter?.role || "user",
      `"${r.createdAt || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `edunex_bugs_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast({ type: "success", title: "CSV Exported", message: "Exported CSV file." });
  };

  // Export JSON
  const handleExportJson = () => {
    if (filteredReports.length === 0) {
      showToast({ type: "warning", title: "No Data", message: "No bug reports to export." });
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredReports, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `edunex_bugs_export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    showToast({ type: "success", title: "JSON Exported", message: "Exported JSON file." });
  };

  return (
    <div className="dev-container">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeUrl={activeUrl}
        onSwitchEndpoint={handleSwitchEndpoint}
        health={health}
        pingData={pingData}
        onRefresh={loadData}
        loading={loading}
        refreshInterval={refreshInterval}
        setRefreshInterval={setRefreshInterval}
        onOpenSimulator={() => setShowSimulator(true)}
        totalBugsCount={reports.length}
      />

      {/* Backend Disconnection Warning */}
      {error && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid var(--rose-500)",
            padding: "12px 18px",
            borderRadius: 12,
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 13, color: "#fca5a5" }}>
            ⚠️ <strong>Backend Offline / Unreachable:</strong> {error}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => handleSwitchEndpoint("https://edunex-backend-rmvx.onrender.com/api/v1")}
            >
              Connect to Render Cloud
            </button>
            <button className="btn btn-secondary btn-sm" onClick={loadData}>
              Retry
            </button>
          </div>
        </div>
      )}

      {/* KPI Stats Banner (Always visible for quick overview & filtering) */}
      <StatsBanner
        reports={reports}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        severityFilter={severityFilter}
        setSeverityFilter={setSeverityFilter}
      />

      {/* Views */}
      {activeTab === "telemetry" ? (
        <ServerHealthView
          pingData={pingData}
          onRefreshPing={async () => {
            const p = await pingBackend();
            setPingData(p);
          }}
        />
      ) : activeTab === "analytics" ? (
        <AnalyticsView reports={reports} />
      ) : (
        /* Bug Management Tabs (Kanban or Table) */
        <>
          <FilterBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            severityFilter={severityFilter}
            setSeverityFilter={setSeverityFilter}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
            screenFilter={screenFilter}
            setScreenFilter={setScreenFilter}
            availableScreens={availableScreens}
            filteredCount={filteredReports.length}
            totalCount={reports.length}
            onExportCsv={handleExportCsv}
            onExportJson={handleExportJson}
          />

          {loading && reports.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 28, marginBottom: 10 }}>⚡</div>
              <h3>Connecting to EduNex BugOps Stream...</h3>
              <p style={{ marginTop: 6, fontSize: 13 }}>
                Establishing secure telemetry socket with {activeUrl}
              </p>
            </div>
          ) : activeTab === "kanban" ? (
            <KanbanBoard
              reports={filteredReports}
              onSelectBug={(bug) => setSelectedBug(bug)}
              onStatusChange={handleStatusChange}
              onOpenResolveGreeting={handleOpenResolveGreeting}
            />
          ) : (
            <TableView
              reports={filteredReports}
              onSelectBug={(bug) => setSelectedBug(bug)}
              onStatusChange={handleStatusChange}
              onDeleteBug={handleDeleteBug}
              onCopyJson={handleCopyJson}
              selectedBugIds={selectedBugIds}
              setSelectedBugIds={setSelectedBugIds}
              onBatchStatusChange={handleBatchStatusChange}
              onBatchDelete={handleBatchDelete}
              onOpenResolveGreeting={handleOpenResolveGreeting}
            />
          )}
        </>
      )}

      {/* Slide-out Bug Detail Inspector */}
      {selectedBug && (
        <BugDetailDrawer
          bug={selectedBug}
          onClose={() => setSelectedBug(null)}
          onStatusChange={handleStatusChange}
          onSaveDevNote={handleSaveDevNote}
          onDelete={handleDeleteBug}
          onShowToast={showToast}
          onOpenResolveGreeting={handleOpenResolveGreeting}
        />
      )}

      {/* Resolution Greeting & Mobile Notification Dispatcher Modal */}
      <ResolutionGreetingModal
        isOpen={Boolean(resolveGreetingBug)}
        onClose={() => setResolveGreetingBug(null)}
        bug={resolveGreetingBug}
        onResolvedSuccess={handleResolvedSuccess}
        onShowToast={showToast}
      />

      {/* Developer Bug Simulator Modal */}
      <BugSimulatorModal
        isOpen={showSimulator}
        onClose={() => setShowSimulator(false)}
        onBugCreated={(newBug) => {
          loadData();
          if (newBug?.data) setSelectedBug(newBug.data);
        }}
        onShowToast={showToast}
      />

      {/* Floating Toast Notification */}
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
