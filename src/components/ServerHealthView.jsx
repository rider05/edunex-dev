import React, { useState, useEffect } from "react";
import { Server, Activity, Database, CheckCircle2, XCircle, RefreshCw, Radio } from "lucide-react";
import { fetchSystemHealth, fetchDatabaseStats, pingBackend, getApiBaseUrl, getRootUrl } from "../api";

export default function ServerHealthView({ pingData, onRefreshPing }) {
  const [healthData, setHealthData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [endpointChecks, setEndpointChecks] = useState([]);
  const [testingEndpoints, setTestingEndpoints] = useState(false);

  const loadTelemetry = async () => {
    setLoading(true);
    try {
      const [hRes, sRes] = await Promise.allSettled([
        fetchSystemHealth(),
        fetchDatabaseStats(),
      ]);

      if (hRes.status === "fulfilled") setHealthData(hRes.value);
      else setHealthData({ error: hRes.reason?.message });

      if (sRes.status === "fulfilled") setStatsData(sRes.value);
      else setStatsData({ message: "No database stats endpoint or unauthorized" });
    } catch {}
    finally {
      setLoading(false);
    }
  };

  const runEndpointSuite = async () => {
    setTestingEndpoints(true);
    const root = getRootUrl();
    const base = getApiBaseUrl();

    const targets = [
      { name: "System Health (/health)", url: `${root}/health` },
      { name: "Bug Reports API (/bugReports)", url: `${base}/bugReports?limit=1` },
      { name: "Stats API (/stats)", url: `${base}/stats` },
    ];

    const results = [];
    for (const target of targets) {
      const start = performance.now();
      try {
        const res = await fetch(target.url, { cache: "no-store" });
        const latency = Math.round(performance.now() - start);
        results.push({
          name: target.name,
          url: target.url,
          status: res.status,
          ok: res.ok,
          latency,
        });
      } catch (e) {
        const latency = Math.round(performance.now() - start);
        results.push({
          name: target.name,
          url: target.url,
          status: 0,
          ok: false,
          latency,
          error: e.message,
        });
      }
    }
    setEndpointChecks(results);
    setTestingEndpoints(false);
  };

  useEffect(() => {
    loadTelemetry();
    runEndpointSuite();
  }, []);

  return (
    <div className="telemetry-grid">
      {/* Ping & Network Card */}
      <div className="telemetry-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Activity size={18} className="text-cyan" />
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>Network Latency & Connectivity</h3>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onRefreshPing}>
            <RefreshCw size={12} />
            <span>Ping Now</span>
          </button>
        </div>

        <div className="telemetry-ping-display">
          <span style={{ color: pingData?.ok ? "var(--emerald-400)" : "var(--rose-400)" }}>
            {pingData?.latency ?? "--"}
          </span>
          <span style={{ fontSize: 20, color: "var(--text-muted)", fontWeight: 600 }}>ms</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
          <span className={`status-dot ${pingData?.ok ? "online" : "offline"}`} />
          <span style={{ color: "var(--text-secondary)" }}>
            {pingData?.ok ? "Backend API responds normally" : "Backend unreachable or timing out"}
          </span>
        </div>

        <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          Base: {getApiBaseUrl()}
        </div>
      </div>

      {/* Endpoint Diagnostics */}
      <div className="telemetry-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Server size={18} className="text-violet" />
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>API Route Health Matrix</h3>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={runEndpointSuite}
            disabled={testingEndpoints}
          >
            <Radio size={12} className={testingEndpoints ? "animate-spin" : ""} />
            <span>{testingEndpoints ? "Probing..." : "Probe Endpoints"}</span>
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {endpointChecks.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Running probes...</div>
          ) : (
            endpointChecks.map((ep, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  background: "var(--bg-input)",
                  borderRadius: 8,
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {ep.ok ? (
                    <CheckCircle2 size={14} className="text-emerald" />
                  ) : (
                    <XCircle size={14} className="text-rose" />
                  )}
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{ep.name}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className={`badge ${ep.ok ? "badge-resolved" : "badge-open"}`}>
                    {ep.status || "ERR"}
                  </span>
                  <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                    {ep.latency}ms
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* System Health Payload */}
      <div className="telemetry-card" style={{ gridColumn: "1 / -1" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Database size={18} className="text-emerald" />
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>Diagnostic Telemetry Feed</h3>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={loadTelemetry} disabled={loading}>
            <RefreshCw size={12} />
            <span>Reload Telemetry</span>
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, fontWeight: 700 }}>
              ROOT /health RESPONSE:
            </div>
            <pre className="telemetry-json-viewer">
              {JSON.stringify(healthData, null, 2)}
            </pre>
          </div>

          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, fontWeight: 700 }}>
              DATABASE STATS /stats RESPONSE:
            </div>
            <pre className="telemetry-json-viewer">
              {JSON.stringify(statsData, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
