import React, { useState } from "react";
import { X, Sparkles, Send, ShieldAlert, Cpu } from "lucide-react";
import { createBugReport } from "../api";

export default function BugSimulatorModal({
  isOpen,
  onClose,
  onBugCreated,
  onShowToast,
}) {
  if (!isOpen) return null;

  const presets = [
    {
      label: "QR Scanner Timeout",
      title: "Attendance QR Scanner fails to initialize camera on Android 14",
      description:
        "When student taps 'Scan Attendance QR', the camera viewfinder stays black for 10 seconds before throwing CameraException: Service Not Available.",
      severity: "high",
      category: "Hardware / Camera",
      screen: "Attendance",
      reporter: { name: "Rahul Verma", username: "rahul_v", role: "student", rollNo: "CS-2024-042" },
      device: { platform: "android", appVersion: "v1.4.2", osVersion: "Android 14" },
    },
    {
      label: "Payment 502 Bad Gateway",
      title: "Fee Payment Razorpay webhook returns 502 Bad Gateway",
      description:
        "Semester fee transaction was debited from bank account, but transaction status remained 'pending' in EduNex app. Receipt not generated.",
      severity: "critical",
      category: "Payment Gateway",
      screen: "Fees",
      reporter: { name: "Sunil Sharma", username: "ssharma_p", role: "parent", rollNo: "ME-2023-118" },
      device: { platform: "ios", appVersion: "v1.4.1", osVersion: "iOS 17.5" },
    },
    {
      label: "Bus GPS Location Stalled",
      title: "Route 7 Bus live GPS location stuck at Depot",
      description:
        "Bus tracking map does not update WebSocket coordinates. Coordinates timestamp shows stale date from 4 hours ago.",
      severity: "medium",
      category: "Real-time Telemetry",
      screen: "Bus Tracking",
      reporter: { name: "Priya Nair", username: "priya_n", role: "student", rollNo: "EC-2024-009" },
      device: { platform: "android", appVersion: "v1.4.2", osVersion: "Android 13" },
    },
    {
      label: "Marksheet PDF Render Fail",
      title: "Mid-Term Marksheet export fails with font ligature error",
      description:
        "Exporting semester grade sheet as PDF crashes with 'Error: Font Helvetica bold character width undefined'.",
      severity: "high",
      category: "PDF Export",
      screen: "Academics",
      reporter: { name: "Dr. K. Swaminathan", username: "prof_swami", role: "faculty", rollNo: "FAC-881" },
      device: { platform: "web", appVersion: "v2.0-web", osVersion: "macOS 14.4" },
    },
  ];

  const [title, setTitle] = useState(presets[0].title);
  const [description, setDescription] = useState(presets[0].description);
  const [severity, setSeverity] = useState(presets[0].severity);
  const [screen, setScreen] = useState(presets[0].screen);
  const [category, setCategory] = useState(presets[0].category);
  const [reporterName, setReporterName] = useState(presets[0].reporter.name);
  const [reporterRole, setReporterRole] = useState(presets[0].reporter.role);
  const [rollNo, setRollNo] = useState(presets[0].reporter.rollNo);
  const [platform, setPlatform] = useState(presets[0].device.platform);
  const [submitting, setSubmitting] = useState(false);

  const applyPreset = (preset) => {
    setTitle(preset.title);
    setDescription(preset.description);
    setSeverity(preset.severity);
    setScreen(preset.screen);
    setCategory(preset.category);
    setReporterName(preset.reporter.name);
    setReporterRole(preset.reporter.role);
    setRollNo(preset.reporter.rollNo);
    setPlatform(preset.device.platform);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please enter a bug title");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        severity,
        category,
        screen,
        status: "open",
        reporter: {
          name: reporterName,
          username: reporterName.toLowerCase().replace(/\s+/g, "_"),
          role: reporterRole,
          rollNo: rollNo || undefined,
        },
        device: {
          platform,
          appVersion: "v1.4.2",
          osVersion: platform === "ios" ? "iOS 17.5" : "Android 14",
        },
      };

      const result = await createBugReport(payload);
      onShowToast({
        type: "success",
        title: "Test Bug Injected",
        message: `Bug "${title.substring(0, 30)}..." logged to backend.`,
      });
      onBugCreated(result);
      onClose();
    } catch (err) {
      onShowToast({
        type: "error",
        title: "Failed to Inject Bug",
        message: err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 620 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Cpu size={20} className="text-cyan" />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>
              Developer Bug Simulator & Mock Injector
            </h3>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>
          Inject realistic crash telemetry directly into the active backend to test triage pipelines and notification webhooks.
        </p>

        {/* Preset Chips */}
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: 6 }}>
            Quick Presets:
          </span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: 11, padding: "3px 8px" }}
                onClick={() => applyPreset(p)}
              >
                <Sparkles size={11} className="text-cyan" />
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ fontSize: 11.5, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
              Bug Title:
            </label>
            <input
              type="text"
              className="search-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short issue summary"
              required
            />
          </div>

          <div>
            <label style={{ fontSize: 11.5, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
              Detailed Description & Logs:
            </label>
            <textarea
              className="search-input"
              style={{ width: "100%", minHeight: 70, resize: "vertical" }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Crash reproduction steps or stack trace"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                Severity
              </label>
              <select
                className="filter-select"
                style={{ width: "100%" }}
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                Screen / Module
              </label>
              <input
                type="text"
                className="search-input"
                style={{ width: "100%" }}
                value={screen}
                onChange={(e) => setScreen(e.target.value)}
                placeholder="Attendance, Fees, etc."
              />
            </div>

            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                Category
              </label>
              <input
                type="text"
                className="search-input"
                style={{ width: "100%" }}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="UI, Network, Auth..."
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                Reporter Name
              </label>
              <input
                type="text"
                className="search-input"
                style={{ width: "100%" }}
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                Reporter Role
              </label>
              <select
                className="filter-select"
                style={{ width: "100%" }}
                value={reporterRole}
                onChange={(e) => setReporterRole(e.target.value)}
              >
                <option value="student">Student</option>
                <option value="parent">Parent</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                Platform
              </label>
              <select
                className="filter-select"
                style={{ width: "100%" }}
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              >
                <option value="android">Android</option>
                <option value="ios">iOS</option>
                <option value="web">Web</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <Send size={14} />
              <span>{submitting ? "Injecting..." : "Inject Simulated Incident"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
