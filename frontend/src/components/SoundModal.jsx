import { useState } from "react";
import { TYPE, playSound } from "./AlertsData";


const Badge = ({ type }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${TYPE[type].badge}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${TYPE[type].dot}`} />{type}
  </span>
);


export default function SoundModal({ onClose, onSave }) {
  const [sound, setSound] = useState({ enabled: true, type: "chime", volume: 70, types: ["Critical", "Warning"] });
  const toggleType = (t) => setSound({ ...sound, types: sound.types.includes(t) ? sound.types.filter(x => x !== t) : [...sound.types, t] });


  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-7 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-lg font-bold text-gray-900">🔔 Alert Sound Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <p className="text-sm text-gray-500 mb-6">Configure audio cues when new alerts arrive.</p>


        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Enable Alert Sounds</label>
          <div className="flex items-center gap-3">
            <div onClick={() => setSound({ ...sound, enabled: !sound.enabled })}
              className={`w-11 h-6 rounded-full cursor-pointer relative transition-colors ${sound.enabled ? "bg-gray-900" : "bg-gray-300"}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${sound.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
            <span className="text-sm font-semibold text-gray-700">{sound.enabled ? "On" : "Off"}</span>
          </div>
        </div>


        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Sound Type</label>
          <div className="flex gap-2">
            {[["chime","🎵"], ["beep","📟"], ["alarm","🚨"]].map(([s, icon]) => (
              <button key={s} onClick={() => setSound({ ...sound, type: s })}
                className={`flex-1 py-2.5 rounded-lg border text-sm font-semibold transition-colors ${sound.type === s ? "bg-gray-900 text-white border-gray-900" : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"}`}>
                {icon} {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>


        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Volume — {sound.volume}%</label>
          <input type="range" min={0} max={100} value={sound.volume}
            onChange={e => setSound({ ...sound, volume: +e.target.value })} className="w-full accent-gray-900" />
        </div>


        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Play sound for</label>
          <div className="flex gap-3 flex-wrap">
            {["Critical", "Warning", "Info"].map(t => (
              <label key={t} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={sound.types.includes(t)} onChange={() => toggleType(t)} className="accent-green-600" />
                <Badge type={t} />
              </label>
            ))}
          </div>
        </div>


        <div className="flex gap-2">
          <button onClick={() => playSound(sound.type)} className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 font-bold text-sm hover:bg-gray-100 transition-colors">
            ▶ Test Sound
          </button>
          <button onClick={() => { onSave(); }} className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-gray-700 transition-colors">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

