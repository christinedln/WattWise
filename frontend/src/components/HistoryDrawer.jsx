import { useState } from "react";
import { mockHistory, TYPE } from "./AlertsData";

// ─── Filter meta — per-filter active color ──────────────
const filterMeta = [
  { key: "All",      activeClass: "border-gray-900  text-gray-900  bg-white font-semibold" },
  { key: "Critical", activeClass: "border-red-500   text-red-600   bg-white font-semibold" },
  { key: "Warning",  activeClass: "border-amber-500 text-amber-600 bg-white font-semibold" },
  { key: "Info",     activeClass: "border-blue-500  text-blue-600  bg-white font-semibold" },
];

const Badge = ({ type }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${TYPE[type].badge}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${TYPE[type].dot}`} />{type}
  </span>
);


export default function HistoryDrawer({ onClose }) {
  const [filter, setFilter] = useState("All");
  const filtered = mockHistory.filter(h => filter === "All" || h.type === filter);

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 w-96 bg-white shadow-2xl z-50 flex flex-col" style={{ animation: "slideIn 0.25s ease" }}>

        {/* ── Header ── */}
        <div className="flex justify-between items-start p-6 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">🕐 Alert History</h2>
            <p className="text-xs text-gray-400 mt-0.5">Full log of Main AC Unit alert activity</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>

        {/* ── Filter Buttons ── */}
        <div className="flex gap-2 px-5 py-3 border-b border-gray-100 flex-wrap">
          {filterMeta.map(({ key, activeClass }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1 rounded-full text-xs font-medium border-2 transition-all duration-150 ${
                filter === key
                  ? activeClass
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {key}
            </button>
          ))}
        </div>

        {/* ── Timeline ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {filtered.map((h, i) => {
            const isResolved = h.event === "Resolved";
            return (
              <div key={h.id} className="flex gap-3 mb-1">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${isResolved ? "bg-green-500" : TYPE[h.type].dot}`} />
                  {i < filtered.length - 1 && <div className="w-0.5 flex-1 bg-gray-100 my-1" />}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge type={h.type} />
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${isResolved ? "text-green-600 bg-green-50 border-green-200" : "text-red-600 bg-red-50 border-red-200"}`}>
                      {isResolved ? "✓ Resolved" : "⚡ Triggered"}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{h.title}</p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{h.timestamp}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
    </>
  );
}
