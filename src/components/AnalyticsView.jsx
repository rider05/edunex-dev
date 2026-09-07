import React from "react";
import { BarChart3, PieChart, Smartphone, Users, AlertTriangle, ShieldCheck } from "lucide-react";

export default function AnalyticsView({ reports }) {
  const total = reports.length;

  // Screen breakdown
  const screenCounts = {};
  reports.forEach((r) => {
    const s = r.screen || "General";
    screenCounts[s] = (screenCounts[s] || 0) + 1;
  });
  const sortedScreens = Object.entries(screenCounts).sort((a, b) => b[1] - a[1]);

  // Severity breakdown
  const severities = ["critical", "high", "medium", "low"];
  const severityCounts = {
    critical: reports.filter((r) => r.severity === "critical").length,
    high: reports.filter((r) => r.severity === "high").length,
    medium: reports.filter((r) => r.severity === "medium").length,
    low: reports.filter((r) => r.severity === "low").length,
  };

  // Role breakdown
  const roleCounts = {};
  reports.forEach((r) => {
    const role = r.reporter?.role || "user";
    roleCounts[role] = (roleCounts[role] || 0) + 1;
  });

  // Platform breakdown
  const platformCounts = { android: 0, ios: 0, web: 0, other: 0 };
  reports.forEach((r) => {
    const p = (r.device?.platform || "").toLowerCase();
    if (p.includes("android")) platformCounts.android++;
    else if (p.includes("ios") || p.includes("apple") || p.includes("iphone")) platformCounts.ios++;
    else if (p.includes("web") || p.includes("chrome") || p.includes("safari")) platformCounts.web++;
    else platformCounts.other++;
  });

  const resolved = reports.filter((r) => r.status === "resolved" || r.status === "closed").length;
  const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Top Velocity Row */}
      <div
        className="telemetry-card"
        style={{
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, var(--bg-card) 100%)",
          borderColor: "rgba(16, 185, 129, 0.25)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>Overall Bug Resolution Rate</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              Percentage of reported mobile/web incidents resolved and verified
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 36, fontWeight: 900, fontFamily: "var(--font-mono)", color: "var(--emerald-400)" }}>
              {rate}%
            </span>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
              {resolved} of {total} closed
            </div>
          </div>
        </div>

        <div style={{ width: "100%", height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
          <div
            style={{
              width: `${rate}%`,
              height: "100%",
              background: "linear-gradient(90deg, #10b981, #06b6d4)",
              borderRadius: 4,
            }}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 18 }}>
        {/* Screens / Modules Hotspots */}
        <div className="telemetry-card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <BarChart3 size={18} className="text-cyan" />
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>Crash & Bug Hotspots by Screen</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sortedScreens.slice(0, 6).map(([screen, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={screen} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>📱 {screen}</span>
                    <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: "var(--cyan-500)", borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="telemetry-card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <AlertTriangle size={18} className="text-rose" />
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>Severity Distribution</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {severities.map((sev) => {
              const count = severityCounts[sev];
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const colorMap = {
                critical: "var(--rose-500)",
                high: "var(--amber-500)",
                medium: "var(--cyan-500)",
                low: "var(--emerald-500)",
              };
              return (
                <div key={sev} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span className={`badge badge-${sev}`}>{sev}</span>
                    <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: colorMap[sev], borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reporter Role Breakdown */}
        <div className="telemetry-card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <Users size={18} className="text-violet" />
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>Reports by User Role</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.entries(roleCounts).map(([role, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={role} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span className={`role-badge role-${role}`}>{role.toUpperCase()}</span>
                    <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: "var(--violet-500)", borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Platform Distribution */}
        <div className="telemetry-card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <Smartphone size={18} className="text-emerald" />
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>Client Operating Systems</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.entries(platformCounts).map(([platform, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={platform} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span style={{ fontWeight: 600, color: "var(--text-secondary)", textTransform: "capitalize" }}>
                      {platform}
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: "var(--emerald-500)", borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
