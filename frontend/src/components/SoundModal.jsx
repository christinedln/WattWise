import { useState } from "react";
import { TYPE, playSound } from "./AlertsData";

const iosFont = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', sans-serif",
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
};

const Badge = ({ type }) => {
  const style = TYPE[type] ?? { badge: "bg-gray-100 text-gray-700 border-gray-300", dot: "bg-gray-400" };
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold"
      style={{ letterSpacing: "-0.005em", color: "#111827" }}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />{type}
    </span>
  );
};

const MusicIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
  </svg>
);

const BeepIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);

const AlarmIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3 2 6"/><path d="m22 6-3-3"/>
  </svg>
);

const PlayIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5,3 19,12 5,21"/>
  </svg>
);

export default function SoundModal({ onClose, onSave }) {
  const [sound, setSound] = useState({ enabled: true, type: "chime", volume: 70, types: ["Critical", "Warning"] });
  const toggleType = (t) => setSound({ ...sound, types: sound.types.includes(t) ? sound.types.filter(x => x !== t) : [...sound.types, t] });

  const soundTypes = [
    { key: "chime", label: "Chime", Icon: MusicIcon },
    { key: "beep",  label: "Beep",  Icon: BeepIcon  },
    { key: "alarm", label: "Alarm", Icon: AlarmIcon  },
  ];

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
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: "#111827", letterSpacing: "-0.02em" }}>
              Alert Sound Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: 18, color: "#9ca3af", cursor: "pointer", padding: "0 2px", lineHeight: 1 }}
          >✕</button>
        </div>

        <p style={{ fontSize: 13, color: "#6b7280", margin: "6px 0 20px", letterSpacing: "-0.003em" }}>
          Configure audio cues when new alerts arrive.
        </p>

        <div style={{ height: "0.5px", background: "#f3f4f6", margin: "0 -24px 20px" }} />

        {/* Enable Toggle */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 8, letterSpacing: "-0.01em" }}>
            Enable Alert Sounds
          </label>
          <div className="flex items-center gap-3">
            <div
              onClick={() => setSound({ ...sound, enabled: !sound.enabled })}
              style={{ width: 44, height: 24, borderRadius: 999, cursor: "pointer", position: "relative", transition: "background 0.2s", backgroundColor: sound.enabled ? "#16a34a" : "#d1d5db" }}
            >
              <div style={{ position: "absolute", top: 2, left: sound.enabled ? 22 : 2, width: 20, height: 20, backgroundColor: "#ffffff", borderRadius: "50%", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.2s" }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{sound.enabled ? "On" : "Off"}</span>
          </div>
        </div>

        {/* Sound Type */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 8, letterSpacing: "-0.01em" }}>
            Sound Type
          </label>
          <div style={{ display: "flex", gap: 8 }}>
           {soundTypes.map(({ key, label, Icon: SoundIcon }) => {
            const active = sound.type === key;
            return (
              <button
                key={key}
                onClick={() => setSound({ ...sound, type: key })}
                style={{
                  ...iosFont,
                  flex: 1, padding: "10px 0", borderRadius: 10,
                  border: active ? "1.5px solid #16a34a" : "1px solid #e5e7eb",
                  background: active ? "#dcfce7" : "#f9fafb",
                  color: active ? "#15803d" : "#374151",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  transition: "all 0.15s", letterSpacing: "-0.01em",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                    outline: "none",
                }}
              >
                <SoundIcon /> {label}
              </button>
            );
          })}
          </div>
        </div>

        {/* Volume */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 8, letterSpacing: "-0.01em" }}>
            Volume — {sound.volume}%
          </label>
          <input
            type="range" min={0} max={100} value={sound.volume}
            onChange={e => setSound({ ...sound, volume: +e.target.value })}
            className="w-full accent-green-600"
          />
        </div>

        {/* Play sound for */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 10, letterSpacing: "-0.01em" }}>
            Play sound for
          </label>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {["Critical", "Warning", "Info"].map(t => {
              const checked = sound.types.includes(t);
              return (
                <label key={t} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }} onClick={() => toggleType(t)}>
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

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => playSound(sound.type)}
            style={{
              ...iosFont,
              flex: 1, padding: "13px 0", borderRadius: 14,
              border: "1px solid #e5e7eb", background: "#f9fafb",
              color: "#374151", fontWeight: 600, fontSize: 15,
              cursor: "pointer", letterSpacing: "-0.01em",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            <PlayIcon /> Test Sound
          </button>
          <button
            onClick={onSave}
            style={{
              ...iosFont,
              flex: 1, padding: "13px 0", borderRadius: 14,
              border: "none", background: "#dcfce7",
              color: "#16a34a", fontWeight: 600, fontSize: 15,
              cursor: "pointer", letterSpacing: "-0.01em",
            }}
          >
            Save Settings
          </button>
        </div>

      </div>
    </div>
  );
}

