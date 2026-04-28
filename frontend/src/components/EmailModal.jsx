import { useState } from "react";
import { TYPE } from "./AlertsData";


const Badge = ({ type }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${TYPE[type].badge}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${TYPE[type].dot}`} />{type}
  </span>
);


export default function EmailModal({ onClose, onSave }) {
  const [email, setEmail] = useState({ address: "", types: ["Critical", "Warning"], frequency: "Instant" });
  const [saved, setSaved] = useState(false);


  const toggleType = (t) => setEmail({ ...email, types: email.types.includes(t) ? email.types.filter(x => x !== t) : [...email.types, t] });
  const handleSave = () => { setSaved(true); setTimeout(() => { setSaved(false); onSave(); }, 1200); };


  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-7 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-lg font-bold text-gray-900">📧 Email Notification Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <p className="text-sm text-gray-500 mb-6">Get notified by email when alerts are triggered.</p>


        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email.address}
            onChange={e => setEmail({ ...email, address: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:border-green-400"
          />
        </div>


        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Notify me for</label>
          <div className="flex gap-3 flex-wrap">
            {["Critical", "Warning", "Info"].map(t => (
              <label key={t} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={email.types.includes(t)} onChange={() => toggleType(t)} className="accent-green-600" />
                <Badge type={t} />
              </label>
            ))}
          </div>
        </div>


        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Frequency</label>
          <div className="flex gap-4 flex-wrap">
            {["Instant", "Hourly Digest", "Daily Digest"].map(f => (
              <label key={f} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="freq"
                  value={f}
                  checked={email.frequency === f}
                  onChange={() => setEmail({ ...email, frequency: f })}
                  className="accent-green-600"
                /> {f}
              </label>
            ))}
          </div>
        </div>


        <button
          onClick={handleSave}
          style={{
            backgroundColor: saved ? "#16a34a" : "#22c55e",
            color: "#ffffff",
            border: "none",
            transition: "background-color 0.2s",
          }}
          className="w-full py-2.5 rounded-xl font-bold text-sm"
        >
          {saved ? "✓ Saved!" : "Save Preferences"}
        </button>
      </div>
    </div>
  );
}
