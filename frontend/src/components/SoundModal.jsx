import { useState } from "react";
import { TYPE, playSound } from "./AlertsData";


const Badge = ({ type }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${TYPE[type].badge}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${TYPE[type].dot}`} />{type}
  </span>
);

// ── Shared active/inactive styles ──────────────────────
const activeBtn = { backgroundColor: "#dcfce7", color: "#15803d", borderColor: "#dcfce7" };
const inactiveBtn = { backgroundColor: "#f9fafb", color: "#374151", borderColor: "#e5e7eb" };

export default function SoundModal({ onClose, onSave }) {
  const [sound, setSound] = useState({ enabled: true, type: "chime", volume: 70, types: ["Critical", "Warning"] });
  const toggleType = (t) => setSound({ ...sound, types: sound.types.includes(t) ? sound.types.filter(x => x !== t) : [...sound.types, t] });

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-7 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-lg font-bold text-gray-900">🔔 Alert Sound Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <p className="text-sm text-gray-500 mb-6">Configure audio cues when new alerts arrive.</p>

        {/* ── Enable Toggle ── */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Enable Alert Sounds</label>
          <div className="flex items-center gap-3">
            <div
              onClick={() => setSound({ ...sound, enabled: !sound.enabled })}
              style={{
                width: 44,
                height: 24,
                borderRadius: 999,
                cursor: "pointer",
                position: "relative",
                transition: "background 0.2s",
                backgroundColor: sound.enabled ? "#16a34a" : "#d1d5db",
              }}
            >
              <div style={{
                position: "absolute",
                top: 2,
                left: sound.enabled ? 22 : 2,
                width: 20,
                height: 20,
                backgroundColor: "#ffffff",
                borderRadius: "50%",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                transition: "left 0.2s",
              }} />
            </div>
            <span className="text-sm font-semibold text-gray-700">{sound.enabled ? "On" : "Off"}</span>
          </div>
        </div>

        {/* ── Sound Type ── */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Sound Type</label>
          <div className="flex gap-2">
            {[["chime", "🎵"], ["beep", "📟"], ["alarm", "🚨"]].map(([s, icon]) => (
              <button
                key={s}
                onClick={() => setSound({ ...sound, type: s })}
                style={{
                  ...(sound.type === s ? activeBtn : inactiveBtn),
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 8,
                  border: "1px solid",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                {icon} {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* ── Volume ── */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Volume — {sound.volume}%</label>
          <input
            type="range"
            min={0}
            max={100}
            value={sound.volume}
            onChange={e => setSound({ ...sound, volume: +e.target.value })}
            className="w-full accent-green-600"
          />
        </div>

        {/* ── Play Sound For ── */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Play sound for</label>
          <div className="flex gap-3 flex-wrap">
            {["Critical", "Warning", "Info"].map(t => (
              <label key={t} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sound.types.includes(t)}
                  onChange={() => toggleType(t)}
                  className="accent-green-600"
                />
                <Badge type={t} />
              </label>
            ))}
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex gap-2">
          <button
            onClick={() => playSound(sound.type)}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              backgroundColor: "#f9fafb",
              color: "#374151",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
          >
            ▶ Test Sound
          </button>
          <button
            onClick={() => { onSave(); }}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 12,
              border: "none",
              backgroundColor: "#dcfce7",
              color: "#15803d",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              transition: "opacity 0.15s",
            }}
          >
            Save Settings
          </button>
        </div>

      </div>
    </div>
  );
}