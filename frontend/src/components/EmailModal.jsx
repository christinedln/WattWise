import { useState } from "react";
import { TYPE } from "./AlertsData";

const Badge = ({ type }) => (
  <span className={`inline-flex items-center gap-1.5 text-xs font-bold`}
    style={{ color: "#111827", letterSpacing: "-0.005em" }}>
    <span className={`w-1.5 h-1.5 rounded-full ${TYPE[type].dot}`} />{type}
  </span>
);

const iosFont = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', sans-serif",
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
};

export default function EmailModal({ onClose, onSave }) {
  const [email, setEmail] = useState({ address: "", types: ["Critical", "Warning"], frequency: "Instant" });
  const [saved, setSaved] = useState(false);

  const toggleType = (t) => setEmail({ ...email, types: email.types.includes(t) ? email.types.filter(x => x !== t) : [...email.types, t] });
  const handleSave = () => { setSaved(true); setTimeout(() => { setSaved(false); onSave(); }, 1200); };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: "rgba(15,30,20,0.45)", backdropFilter: "blur(4px)", ...iosFont }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ border: "0.5px solid #e5e7eb", padding: "24px 24px 20px" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center rounded-lg" style={{ width: 30, height: 30, background: "#16a34a" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: "#111827", letterSpacing: "-0.02em" }}>
              Email Notification Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: 18, color: "#9ca3af", cursor: "pointer", padding: "0 2px", lineHeight: 1 }}
          >✕</button>
        </div>

        <p style={{ fontSize: 13, color: "#6b7280", margin: "6px 0 20px", letterSpacing: "-0.003em" }}>
          Get notified by email when alerts are triggered.
        </p>

        {/* Divider */}
        <div style={{ height: "0.5px", background: "#f3f4f6", margin: "0 -24px 20px" }} />

        {/* Email Address */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 8, letterSpacing: "-0.01em" }}>
            Email Address
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email.address}
            onChange={e => setEmail({ ...email, address: e.target.value })}
            style={{
              ...iosFont,
              width: "100%", boxSizing: "border-box",
              padding: "10px 14px", borderRadius: 10,
              border: "1px solid #e5e7eb", background: "#f9fafb",
              fontSize: 15, color: "#111827", outline: "none",
              letterSpacing: "-0.005em",
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
            onFocus={e => { e.target.style.borderColor = "#16a34a"; e.target.style.boxShadow = "0 0 0 3px rgba(22,163,74,0.1)"; }}
            onBlur={e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }}
          />
        </div>

        {/* Notify me for */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 10, letterSpacing: "-0.01em" }}>
            Notify me for
          </label>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {["Critical", "Warning", "Info"].map(t => {
              const checked = email.types.includes(t);
              return (
                <label key={t} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }} onClick={() => toggleType(t)}>
                  {/* Custom iOS-style checkbox */}
                  <div style={{
                    width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                    background: checked ? "#16a34a" : "white",
                    border: checked ? "none" : "1.5px solid #d1d5db",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.15s",
                  }}>
                    {checked && (
                      <svg width="11" height="11" viewBox="0 0 11 11">
                        <polyline points="1.5,5.5 4.5,8.5 9.5,2.5" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <Badge type={t} />
                </label>
              );
            })}
          </div>
        </div>

        {/* Frequency */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 10, letterSpacing: "-0.01em" }}>
            Frequency
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {["Instant", "Hourly Digest", "Daily Digest"].map(f => {
              const selected = email.frequency === f;
              return (
                <label key={f} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setEmail({ ...email, frequency: f })}>
                  {/* Custom iOS-style radio */}
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                    border: selected ? "none" : "1.5px solid #d1d5db",
                    background: selected ? "#16a34a" : "white",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.15s, border 0.15s",
                  }}>
                    {selected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "white" }} />}
                  </div>
                  <span style={{ fontSize: 15, color: "#111827", letterSpacing: "-0.005em" }}>{f}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          style={{
            ...iosFont,
            width: "100%", padding: "13px", borderRadius: 14, border: "none",
            background: saved ? "#bbf7d0" : "#dcfce7",
            color: "#16a34a",
            fontSize: 15, fontWeight: 600,
            letterSpacing: "-0.01em",
            cursor: "pointer", transition: "background 0.2s",
          }}

        >
          {saved ? "✓ Saved!" : "Save Preferences"}
        </button>
      </div>
    </div>
  );
}
