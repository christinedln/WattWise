import { useState } from "react";
import { Mail, Clock, Volume2, Eye, EyeOff, Trash2 } from "lucide-react";
import { mockAlerts, TYPE } from "./AlertsData";
import EmailModal from "./EmailModal";
import SoundModal from "./SoundModal";
import HistoryDrawer from "./HistoryDrawer";


const Badge = ({ type }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${TYPE[type].badge}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${TYPE[type].dot}`} />{type}
  </span>
);


export default function AlertNotif() {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [filter, setFilter] = useState("All");
  const [showResolved, setShowResolved] = useState(false);
  const [selected, setSelected] = useState([]);
  const [showEmail, setShowEmail] = useState(false);
  const [showSound, setShowSound] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [toast, setToast] = useState(null);


  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };


  const filtered = alerts.filter(a => (showResolved || !a.resolved) && (filter === "All" || a.type === filter));
  const stats = {
    active:   alerts.filter(a => !a.resolved).length,
    critical: alerts.filter(a => a.type === "Critical" && !a.resolved).length,
    warnings: alerts.filter(a => a.type === "Warning"  && !a.resolved).length,
    total:    alerts.length,
  };


  const toggleSelect    = (id) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const selectAll       = () => setSelected(selected.length === filtered.length ? [] : filtered.map(a => a.id));
  const deleteAlert     = (id) => { setAlerts(p => p.filter(a => a.id !== id)); showToast("Alert dismissed"); };
  const resolveSelected = () => { setAlerts(p => p.map(a => selected.includes(a.id) ? { ...a, resolved: true } : a)); setSelected([]); showToast("Marked as resolved"); };


  return (
    <div className="relative">


      {/* Toast */}
      {toast && <div className="fixed top-6 right-6 z-50 bg-green-500 text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-lg">{toast}</div>}


      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alerts & Notifications</h1>
          <p className="text-gray-500 mt-1">Stay informed about device issues and energy anomalies</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setShowHistory(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
            <Clock size={15} /> Alert History
          </button>
          <button onClick={() => setShowSound(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
            <Volume2 size={15} /> Sound Settings
          </button>
          <button onClick={() => setShowEmail(true)} className="btn-green flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium">
            <Mail size={15} /> Email Notifications
          </button>
        </div>
      </div>


      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Active Alerts", value: stats.active,   sub: "Unresolved",        color: "text-gray-900"   },
          { label: "Critical",      value: stats.critical, sub: "Requires attention", color: "text-red-600"    },
          { label: "Warnings",      value: stats.warnings, sub: "Monitor closely",    color: "text-orange-500" },
          { label: "Total Alerts",  value: stats.total,    sub: "All time",           color: "text-gray-900"   },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>


      {/* Controls */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <button onClick={() => setShowResolved(!showResolved)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${showResolved ? "bg-green-50 border-green-300 text-green-700" : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
          {showResolved ? <EyeOff size={14} /> : <Eye size={14} />} {showResolved ? "Hide Resolved" : "Show Resolved"}
        </button>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500 font-medium">Filter:</span>
          {["All", "Critical", "Warning", "Info"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={filter === f ? { color: "#ffffff", backgroundColor: "#111827", borderColor: "#111827" } : { color: "#374151", borderColor: "#9CA3AF" }}
              className="px-3 py-1.5 rounded-full text-sm font-medium border transition-colors hover:opacity-90">
              {f}
            </button>
          ))}
        </div>
        {selected.length > 0 && (
          <button onClick={resolveSelected} className="ml-auto px-3 py-2 rounded-lg bg-green-50 border border-green-300 text-green-700 text-sm font-semibold hover:bg-green-100 transition-colors">
            ✓ Resolve {selected.length} selected
          </button>
        )}
      </div>


      {/* Select All */}
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100 mb-3">
        <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={selectAll} className="w-4 h-4 accent-gray-900 cursor-pointer" />
        <span className="text-sm font-medium text-gray-700">Select All</span>
      </div>


      {/* Alert List */}
      <div className="space-y-3">
        {filtered.length === 0 && <p className="text-center text-gray-400 py-10 text-sm">No alerts match this filter.</p>}
        {filtered.map(alert => (
          <div key={alert.id} className={`flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4 shadow-sm ${alert.resolved ? "opacity-60" : ""}`}>
            <input type="checkbox" checked={selected.includes(alert.id)} onChange={() => toggleSelect(alert.id)} className="mt-1 w-4 h-4 accent-gray-900 cursor-pointer" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <Badge type={alert.type} />
                {alert.resolved && <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">Resolved</span>}
              </div>
              <p className="text-sm font-bold text-gray-900">{alert.title}</p>
              <p className="text-sm text-gray-500">{alert.description}</p>
              <p className="text-xs text-gray-400 mt-1">Type: {alert.category}</p>
            </div>
            <div className="flex flex-col items-end gap-2 min-w-[90px]">
              <span className="text-xs text-gray-400">{alert.time}</span>
              <button onClick={() => deleteAlert(alert.id)} className="text-gray-300 hover:text-red-400 transition-colors"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>


      {/* Modals & Drawer */}
      {showEmail   && <EmailModal    onClose={() => setShowEmail(false)}   onSave={() => { setShowEmail(false);   showToast("Email notifications saved!"); }} />}
      {showSound   && <SoundModal    onClose={() => setShowSound(false)}   onSave={() => { setShowSound(false);   showToast("Sound settings saved!");       }} />}
      {showHistory && <HistoryDrawer onClose={() => setShowHistory(false)} />}
    </div>
  );
}
