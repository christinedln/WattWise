export const mockAlerts = [
  { id: 1, type: "Warning", title: "Main AC Unit", description: "AC unit consuming higher than usual power", category: "High Consumption", time: "16 minutes ago", resolved: false },
  { id: 2, type: "Critical", title: "Main AC Unit", description: "AC unit drawing dangerously high current", category: "Overload", time: "1 hour ago", resolved: false },
  { id: 3, type: "Info", title: "Main AC Unit", description: "AC unit usage peaked at 4.2kWh today", category: "Daily Report", time: "3 hours ago", resolved: true },
];


export const mockHistory = [
  { id: 1, type: "Warning",  title: "Main AC Unit", event: "Triggered", timestamp: "Mar 13, 2026 · 10:26 AM" },
  { id: 2, type: "Warning",  title: "Main AC Unit", event: "Resolved",  timestamp: "Mar 13, 2026 · 10:45 AM" },
  { id: 3, type: "Critical", title: "Main AC Unit", event: "Triggered", timestamp: "Mar 13, 2026 · 09:00 AM" },
  { id: 4, type: "Critical", title: "Main AC Unit", event: "Resolved",  timestamp: "Mar 13, 2026 · 09:20 AM" },
  { id: 5, type: "Info",     title: "Main AC Unit", event: "Triggered", timestamp: "Mar 12, 2026 · 08:00 AM" },
  { id: 6, type: "Warning",  title: "Main AC Unit", event: "Triggered", timestamp: "Mar 11, 2026 · 07:55 PM" },
  { id: 7, type: "Warning",  title: "Main AC Unit", event: "Resolved",  timestamp: "Mar 11, 2026 · 08:10 PM" },
];


export const TYPE = {
  Warning:  { badge: "bg-orange-100 text-orange-700 border-orange-200", dot: "bg-orange-400" },
  Critical: { badge: "bg-red-100 text-red-700 border-red-200",         dot: "bg-red-500"    },
  Info:     { badge: "bg-blue-100 text-blue-700 border-blue-200",       dot: "bg-blue-400"   },
};


export const playSound = (type) => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = type === "alarm" ? "sawtooth" : type === "beep" ? "square" : "sine";
  osc.frequency.setValueAtTime(type === "alarm" ? 300 : type === "beep" ? 660 : 880, ctx.currentTime);
  if (type !== "beep") osc.frequency.exponentialRampToValueAtTime(type === "alarm" ? 600 : 440, ctx.currentTime + 0.3);
  gain.gain.setValueAtTime(0.2, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
  osc.start(); osc.stop(ctx.currentTime + 0.5);
};
