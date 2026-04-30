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