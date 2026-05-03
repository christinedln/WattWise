import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { browserLocalPersistence, onAuthStateChanged, setPersistence, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../../firebase";
import { normalizeRole } from "../config/permissions";

const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const AuthContext = createContext(null);

async function loadUserProfile(uid, fallbackUser) {
  const snapshot = await getDoc(doc(db, "users", uid));
  const tokenResult = fallbackUser?.getIdTokenResult ? await fallbackUser.getIdTokenResult(true) : null;
  const claimRole = tokenResult?.claims?.role;
  const claimOrganizationId = tokenResult?.claims?.organizationId || null;

  if (!snapshot.exists()) {
    return {
      uid,
      email: fallbackUser?.email || "",
      displayName: fallbackUser?.displayName || fallbackUser?.email || "Super Admin",
      role: normalizeRole(claimRole || "user"),
      organizationId: claimOrganizationId,
      status: fallbackUser?.emailVerified ? "active" : "pending",
      claims: tokenResult?.claims || {},
    };
  }

  const data = snapshot.data();
  return {
    id: snapshot.id,
    uid,
    ...data,
    organizationId: data.organizationId || claimOrganizationId || null,
    claims: tokenResult?.claims || {},
    role: normalizeRole(claimRole || data.role),
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [idleRemaining, setIdleRemaining] = useState(SESSION_TIMEOUT_MS);
  const navigate = useNavigate();
  const location = useLocation();
  const timerRef = useRef(null);
  const idleRef = useRef(SESSION_TIMEOUT_MS);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const signOutUser = useCallback(async () => {
    clearTimer();
    idleRef.current = SESSION_TIMEOUT_MS;
    setIdleRemaining(SESSION_TIMEOUT_MS);
    await signOut(auth);
    setUser(null);
    setProfile(null);
    if (!location.pathname.includes("/super-admin/login")) {
      navigate("/super-admin/login", { replace: true });
    }
  }, [clearTimer, location.pathname, navigate]);

  const scheduleIdleTimeout = useCallback(() => {
    clearTimer();
    idleRef.current = SESSION_TIMEOUT_MS;
    setIdleRemaining(SESSION_TIMEOUT_MS);

    timerRef.current = window.setTimeout(() => {
      signOutUser();
    }, SESSION_TIMEOUT_MS);
  }, [clearTimer, signOutUser]);

  const markActivity = useCallback(() => {
    if (!user) {
      return;
    }

    scheduleIdleTimeout();
  }, [scheduleIdleTimeout, user]);

  const refreshProfile = useCallback(async () => {
    if (!auth.currentUser) {
      return null;
    }

    const nextProfile = await loadUserProfile(auth.currentUser.uid, auth.currentUser);
    setProfile(nextProfile);
    return nextProfile;
  }, []);

  const signIn = useCallback(async (email, password) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const nextProfile = await loadUserProfile(credential.user.uid, credential.user);
    setUser(credential.user);
    setProfile(nextProfile);
    scheduleIdleTimeout();
    return { user: credential.user, profile: nextProfile };
  }, [scheduleIdleTimeout]);

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch(() => {
      // Keep the existing default if the browser blocks persistence.
    });

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (!nextUser) {
        clearTimer();
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setUser(nextUser);
      setProfile(await loadUserProfile(nextUser.uid, nextUser));
      setLoading(false);
      scheduleIdleTimeout();
    });

    return () => {
      clearTimer();
      unsubscribe();
    };
  }, [clearTimer, scheduleIdleTimeout]);

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    const events = ["click", "keydown", "mousemove", "scroll", "touchstart"];
    events.forEach((eventName) => window.addEventListener(eventName, markActivity, { passive: true }));
    document.addEventListener("visibilitychange", markActivity);

    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, markActivity));
      document.removeEventListener("visibilitychange", markActivity);
    };
  }, [markActivity, user]);

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      idleRef.current = Math.max(0, idleRef.current - 1000);
      setIdleRemaining(idleRef.current);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      profile,
      role: profile?.role || "user",
      loading,
      idleRemaining,
      signIn,
      signOutUser,
      refreshProfile,
    }),
    [idleRemaining, loading, profile, refreshProfile, signIn, signOutUser, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
