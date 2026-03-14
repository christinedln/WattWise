import { useState } from "react";
import { mockHistory, TYPE } from "./AlertsData";


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
        <div className="flex justify-between items-start p-6 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">🕐 Alert History</h2>
            <p className="text-xs text-gray-400 mt-0.5">Full log of Main AC Unit alert activity</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>


        <div className="flex gap-2 px-5 py-3 border-b border-gray-100 flex-wrap">
          {["All", "Critical", "Warning", "Info"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${filter === f ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}>
              {f}
            </button>
          ))}
        </div>


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
