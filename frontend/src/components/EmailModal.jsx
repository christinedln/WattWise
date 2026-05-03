import { doc, setDoc, getFirestore, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { TYPE } from "./AlertsData";

// Firebase init (safe singleton)
const app = getApps().length
  ? getApp()
  : initializeApp({
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    });

const db = getFirestore(app);

// ─── Badge (UNCHANGED UI) ───────────────────────────
const Badge = ({ type }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
      TYPE[type]?.badge || TYPE.Warning.badge
    }`}
  >
    <span
      className={`w-1.5 h-1.5 rounded-full ${
        TYPE[type]?.dot || TYPE.Warning.dot
      }`}
    />
    {type}
  </span>
);

const iosFont = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', sans-serif",
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
};
// ─── Frequency normalizer ───────────────────────────
const normalizeFrequency = (freq) => {
  switch (freq) {
    case "Instant":
      return "instant";
    case "Hourly Digest":
      return "hourly";
    case "Daily Digest":
      return "daily";
    default:
      return "instant";
  }
};

export default function EmailModal({ onClose, onSave, isOpen }) {
  const [saved, setSaved] = useState(false);
  const [user, setUser] = useState(null);

  const [email, setEmail] = useState({
    address: "",
    types: [],
    frequency: "Instant",
  });

  // ─── AUTH LISTENER ───────────────────────────────
  useEffect(() => {
    const auth = getAuth();

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    return () => unsub();
  }, []);

  //LOAD FROM FIRESTORE
  useEffect(() => {
    if (!isOpen) return;

    const auth = getAuth();

    const fetchData = async (uid) => {
      try {
        console.log("Fetching for UID:", uid);

        const ref = doc(db, "user", uid, "alert_settings", "main");
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          console.log("No document found");
          return;
        }

        const data = snap.data();
        console.log("Fetched data:", data);

        const types = [];
        if (data.critical) types.push("Critical");
        if (data.warning) types.push("Warning");
        if (data.suspicious) types.push("Suspicious");

        setEmail({
          address: data.email || "",
          types,
          frequency:
            data.frequency === "instant"
              ? "Instant"
              : data.frequency === "hourly"
              ? "Hourly Digest"
              : data.frequency === "daily"
              ? "Daily Digest"
              : "Instant",
        });
      } catch (err) {
        console.error("FETCH ERROR:", err);
      }
    };

    // 🔥 ALWAYS use currentUser first
    if (auth.currentUser?.uid) {
      fetchData(auth.currentUser.uid);
    } else {
      // fallback if auth isn't ready yet
      const unsub = onAuthStateChanged(auth, (u) => {
        if (u?.uid) {
          fetchData(u.uid);
          unsub(); // prevent multiple calls
        }
      });
    }
  }, [isOpen]);

  // ─── TOGGLE CHECKBOX ─────────────────────────────
  const toggleType = (t) => {
    setEmail((prev) => ({
      ...prev,
      types: prev.types.includes(t)
        ? prev.types.filter((x) => x !== t)
        : [...prev.types, t],
    }));
  };

  // ─── SAVE TO FIRESTORE ───────────────────────────
  const handleSave = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.error("No authenticated user");
        return;
      }

      await setDoc(
        doc(db, "user", currentUser.uid, "alert_settings", "main"),
        {
          email: email.address,
          critical: email.types.includes("Critical"),
          warning: email.types.includes("Warning"),
          suspicious: email.types.includes("Suspicious"),
          frequency: normalizeFrequency(email.frequency),
        },
        { merge: true }
      );

      setSaved(true);
      console.log("SAVING UID:", currentUser.uid);

      setTimeout(() => {
        setSaved(false);
        onSave();
      }, 1200);
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  // ─── UI (UNCHANGED) ──────────────────────────────
  return (
    <div
     
      className="fixed inset-0 flex items-center justify-center z-50"
     
      style={{ background: "rgba(15,30,20,0.45)", backdropFilter: "blur(4px)", ...iosFont }}
      onClick={onClose}
    
    >
      <div
       
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
       
        style={{ border: "0.5px solid #e5e7eb", padding: "24px 24px 20px" }}
        onClick={(e) => e.stopPropagation()}
      
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center rounded-lg" style={{ width: 30, height: 30, background: "#16a34a" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
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
            onChange={(e) =>
              setEmail({ ...email, address: e.target.value })
            }
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

        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Notify me for
          </label>

          <div className="flex gap-3 flex-wrap">
            {["Critical", "Suspicious", "Warning"].map((t) => (
              <label key={t} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={email.types.includes(t)}
                  onChange={() => toggleType(t)}
                  className="accent-green-600"
                />
                <Badge type={t} />
              </label>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Frequency
          </label>

          <div className="flex gap-4 flex-wrap">
            {["Instant", "Hourly Digest", "Daily Digest"].map((f) => (
              <label
                key={f}
                className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
              >
                <input
                  type="radio"
                  name="freq"
                  value={f}
                  checked={email.frequency === f}
                  onChange={() =>
                    setEmail({ ...email, frequency: f })
                  }
                  className="accent-green-600"
                />
                {f}
              </label>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSave}
            style={{ backgroundColor: "#16a34a", color: "white" }}
            className="w-[320px] px-5 py-3 rounded-[14px] text-sm font-semibold
               shadow-sm transition-all duration-200 ease-in-out
               hover:shadow-lg hover:-translate-y-0.5
               active:translate-y-0 active:shadow-md
               focus:outline-none"
          >
            {saved ? "✓ Saved!" : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  );
}