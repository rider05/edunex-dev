import React, { useState, useEffect } from "react";
import {
  X,
  Send,
  Sparkles,
  Smartphone,
  CheckCircle2,
  Heart,
  MessageSquare,
  BellRing,
  Award,
} from "lucide-react";
import confetti from "canvas-confetti";
import { sendResolutionNotification } from "../api";

export default function ResolutionGreetingModal({
  isOpen,
  onClose,
  bug,
  onResolvedSuccess,
  onShowToast,
}) {
  if (!isOpen || !bug) return null;

  const reporterName = bug.reporter?.name || bug.reporter?.username || "Valued User";
  const reporterRole = (bug.reporter?.role || "student").toLowerCase();
  const screenName = bug.screen || "General App";

  // Pre-crafted warm greetings based on role
  const templates = [
    {
      id: "student",
      label: "🌟 Student Star Contributor",
      title: `🎉 Issue Resolved: ${bug.title}`,
      message: `Hi ${reporterName}! 👋 Huge thanks for being an eagle-eyed contributor to EduNex!

The issue you reported on ${screenName} ("${bug.title}") has been successfully resolved and verified by our engineering team.

Your valuable feedback directly helps make EduNex smoother, faster, and more reliable for all students and faculty across campus. We deeply appreciate your support! Keep shining! 🚀🎓

— With warm regards,
EduNex Engineering & BugOps Team`,
    },
    {
      id: "faculty",
      label: "🏆 Faculty Academic Partner",
      title: `✅ Resolved: ${bug.title}`,
      message: `Dear ${reporterName},

Thank you very much for bringing this to our attention. Our engineering team has investigated and successfully resolved the issue reported regarding ${screenName} ("${bug.title}").

We deeply appreciate your valuable partnership in keeping our institution's digital campus running smoothly. Thank you for your continued support! 📚✨

— Best regards,
EduNex Dev & Operations Desk`,
    },
    {
      id: "parent",
      label: "🤝 Parent Gratitude",
      title: `🎉 Resolved: ${bug.title}`,
      message: `Dear ${reporterName},

Thank you for taking the time to share your valuable feedback with us. The issue regarding ${screenName} ("${bug.title}") has now been resolved by our engineering team.

Your feedback is instrumental in ensuring a seamless experience for parents and families across EduNex. Thank you for your trust and collaboration! 💙

— Warm regards,
EduNex Engineering Team`,
    },
    {
      id: "quick",
      label: "⚡ Quick & Enthusiastic",
      title: `🎉 Bug Squashed: ${bug.title}`,
      message: `Hey ${reporterName}! 🎉 High five! We successfully squashed the bug you reported on ${screenName} ("${bug.title}").

Everything is back up and running smoothly. Thank you for your awesome feedback in helping us make EduNex better every day! 💪✨

— EduNex BugOps Team`,
    },
  ];

  // Default template based on reporter role
  const initialTemplate =
    templates.find((t) => t.id === reporterRole) || templates[0];

  const [selectedTemplateId, setSelectedTemplateId] = useState(initialTemplate.id);
  const [notificationTitle, setNotificationTitle] = useState(initialTemplate.title);
  const [greetingMessage, setGreetingMessage] = useState(initialTemplate.message);
  const [sendNotice, setSendNotice] = useState(true);
  const [sendMessage, setSendMessage] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Update when template changes
  const handleSelectTemplate = (t) => {
    setSelectedTemplateId(t.id);
    setNotificationTitle(t.title);
    setGreetingMessage(t.message);
  };

  const handleDispatch = async () => {
    if (!notificationTitle.trim() || !greetingMessage.trim()) {
      alert("Please provide both a notification title and greeting message.");
      return;
    }

    setIsSending(true);
    try {
      const result = await sendResolutionNotification(bug, {
        title: notificationTitle.trim(),
        message: greetingMessage.trim(),
        sendNotice,
        sendMessage,
      });

      // Confetti celebratory explosion!
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      onShowToast({
        type: "success",
        title: "Greeting Delivered to Mobile App!",
        message: `Personalized notification sent to ${reporterName} and marked as resolved.`,
      });

      onResolvedSuccess(bug.id || bug._id, {
        status: "resolved",
        resolutionTitle: notificationTitle,
        resolutionGreeting: greetingMessage,
        notifiedUser: true,
        resolvedAt: new Date().toISOString(),
      });

      onClose();
    } catch (err) {
      onShowToast({
        type: "error",
        title: "Dispatch Error",
        message: err.message,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 720, maxHeight: "92vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "linear-gradient(135deg, #10b981, #06b6d4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#080c14",
              }}
            >
              <Heart size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>
                Send Resolution Greeting to EduNex Mobile App
              </h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Deliver a warm thank-you message to the reporter & mark issue as resolved
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* Recipient Overview Pill */}
        <div
          style={{
            background: "var(--bg-input)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Recipient:</span>
            <strong style={{ fontSize: 13, color: "var(--text-main)" }}>
              {reporterName} (@{bug.reporter?.username || "user"})
            </strong>
            <span className={`role-badge role-${reporterRole}`}>
              {reporterRole.toUpperCase()}
            </span>
            {bug.reporter?.rollNo && (
              <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                #{bug.reporter.rollNo}
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--cyan-400)" }}>
            <Smartphone size={13} />
            <span>Target: {bug.device?.platform ? `${bug.device.platform.toUpperCase()} App` : "EduNex Mobile App"}</span>
          </div>
        </div>

        {/* Live Mobile Notification Preview */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
            <Smartphone size={12} className="text-cyan" />
            <span>Live Mobile App Notification Preview:</span>
          </div>

          <div
            style={{
              background: "#0c1322",
              border: "1px solid rgba(6, 182, 212, 0.3)",
              borderRadius: 14,
              padding: 14,
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13 }}>⚡</span>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-main)" }}>EduNex Campus</span>
                <span style={{ fontSize: 10.5, color: "var(--text-muted)" }}>• now</span>
              </div>
              <span
                style={{
                  fontSize: 10,
                  background: "rgba(16, 185, 129, 0.15)",
                  color: "var(--emerald-400)",
                  padding: "2px 6px",
                  borderRadius: 4,
                  fontWeight: 700,
                }}
              >
                PUSH & NOTICE
              </span>
            </div>

            <div style={{ fontWeight: 700, fontSize: 13, color: "#fff", marginBottom: 4 }}>
              {notificationTitle || "Notification Title"}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
              {greetingMessage || "Thank you message will appear here..."}
            </div>
          </div>
        </div>

        {/* Template Selector Chips */}
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
            Select Greeting Template:
          </span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                className={`btn btn-sm ${selectedTemplateId === tpl.id ? "btn-primary" : "btn-secondary"}`}
                style={{ fontSize: 11.5 }}
                onClick={() => handleSelectTemplate(tpl)}
              >
                <span>{tpl.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Editable Title & Message */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 11.5, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
              Mobile Notification Subject:
            </label>
            <input
              type="text"
              className="search-input"
              style={{ width: "100%" }}
              value={notificationTitle}
              onChange={(e) => setNotificationTitle(e.target.value)}
              placeholder="e.g. 🎉 Issue Resolved: Attendance Camera Initialized"
            />
          </div>

          <div>
            <label style={{ fontSize: 11.5, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
              Personalized Greeting & Gratitude Message:
            </label>
            <textarea
              className="search-input"
              style={{
                width: "100%",
                minHeight: 120,
                lineHeight: 1.55,
                fontFamily: "var(--font-sans)",
                fontSize: 12.5,
                resize: "vertical",
              }}
              value={greetingMessage}
              onChange={(e) => setGreetingMessage(e.target.value)}
              placeholder="Type your thank you and greeting message..."
            />
          </div>
        </div>

        {/* Dispatch Channels */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "10px 14px",
            background: "var(--bg-input)",
            borderRadius: 8,
            border: "1px solid var(--border-subtle)",
            marginBottom: 20,
            fontSize: 12,
            flexWrap: "wrap",
          }}
        >
          <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Deliver via:</span>

          <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={sendNotice}
              onChange={(e) => setSendNotice(e.target.checked)}
            />
            <span>📢 Notice Board & Push Alert (/notices)</span>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={sendMessage}
              onChange={(e) => setSendMessage(e.target.checked)}
            />
            <span>💬 Direct User Inbox Message (/messages)</span>
          </label>
        </div>

        {/* Footer Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onClose}
          >
            Cancel
          </button>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className="btn btn-primary"
              disabled={isSending}
              onClick={handleDispatch}
              style={{ minWidth: 200 }}
            >
              <Send size={14} />
              <span>{isSending ? "Dispatching to Mobile App..." : "Dispatch to Mobile App & Resolve"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
