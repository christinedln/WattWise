import { createContext, useContext, useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (!user) return;

      const ref = collection(db, "user", user.uid, "notif_anomalies");
      const q = query(ref, where("resolved", "==", false));

      const unsubSnap = onSnapshot(q, (snap) => {
        setNotifCount(snap.size);
      });

      return () => unsubSnap();
    });

    return () => unsubAuth();
  }, []);

  return (
    <NotificationContext.Provider value={{ notifCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);