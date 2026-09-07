import React, { useEffect } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 size={18} className="toast-icon text-emerald" />,
    warning: <AlertTriangle size={18} className="toast-icon text-amber" />,
    error: <XCircle size={18} className="toast-icon text-rose" />,
    info: <Info size={18} className="toast-icon text-cyan" />,
  };

  return (
    <div className={`toast-notification toast-${toast.type || "info"}`}>
      <div className="toast-icon-wrap">
        {icons[toast.type] || icons.info}
      </div>
      <div className="toast-content">
        {toast.title && <div className="toast-title">{toast.title}</div>}
        <div className="toast-message">{toast.message}</div>
      </div>
      <button className="toast-close" onClick={onClose} aria-label="Dismiss">
        <X size={14} />
      </button>
    </div>
  );
}
