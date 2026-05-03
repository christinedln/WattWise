import { doc, setDoc, getFirestore, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { TYPE } from "./AlertsData";

// ⚠️ Firebase init (safe singleton)
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
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-7 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-lg font-bold text-gray-900">
            📧 Email Notification Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Get notified by emails when device anomalies occur.
        </p>

        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address
          </label>

          <input
            type="email"
            placeholder="you@example.com"
            value={email.address}
            onChange={(e) =>
              setEmail({ ...email, address: e.target.value })
            }
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:border-green-400"
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

        <button
          onClick={handleSave}
          style={{
            backgroundColor: saved ? "#bbf7d0" : "#dcfce7",
            color: "#15803d",
            border: "none",
          }}
          className="w-full py-2.5 rounded-xl font-bold text-sm"
        >
          {saved ? "✓ Saved!" : "Save Preferences"}
        </button>
      </div>
    </div>
  );
}