import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";

const SUMMARY_CACHE_KEY = "wattwise.superadmin.dashboardSummary";
const SUMMARY_TTL_MS = 5 * 60 * 1000;
const API_BASE_URL = "http://localhost:5000/api/superadmin/users-summary";

let inMemorySummary = null;
let inMemorySummaryAt = 0;
let inFlightSummary = null;

function readSessionSummary() {
  try {
    const raw = window.sessionStorage.getItem(SUMMARY_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed?.summary || !parsed?.cachedAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeSessionSummary(summary) {
  try {
    window.sessionStorage.setItem(
      SUMMARY_CACHE_KEY,
      JSON.stringify({ summary, cachedAt: Date.now() }),
    );
  } catch {
    // ignore storage failures
  }
}

async function getAuthToken() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();

      if (!user) {
        reject(new Error("User not authenticated"));
        return;
      }

      try {
        const token = await user.getIdToken(true);
        resolve(token);
      } catch (error) {
        reject(error);
      }
    });
  });
}

export function invalidateDashboardSummaryCache() {
  inMemorySummary = null;
  inMemorySummaryAt = 0;
  inFlightSummary = null;

  try {
    window.sessionStorage.removeItem(SUMMARY_CACHE_KEY);
  } catch {
    // ignore storage failures
  }
}

export async function fetchDashboardSummary({ forceRefresh = false } = {}) {
  const now = Date.now();

  if (!forceRefresh) {
    const sessionSummary = typeof window !== "undefined" ? readSessionSummary() : null;
    const memoryFresh = inMemorySummary && now - inMemorySummaryAt < SUMMARY_TTL_MS;
    const sessionFresh = sessionSummary && now - sessionSummary.cachedAt < SUMMARY_TTL_MS;

    if (memoryFresh) {
      return inMemorySummary;
    }

    if (sessionFresh) {
      inMemorySummary = sessionSummary.summary;
      inMemorySummaryAt = sessionSummary.cachedAt;
      return sessionSummary.summary;
    }

    if (inFlightSummary) {
      return inFlightSummary;
    }
  }

  inFlightSummary = (async () => {
    const token = await getAuthToken();
    const response = await fetch(API_BASE_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `Failed to load dashboard summary: ${response.statusText}`);
    }

    const payload = await response.json();
    const summary = payload.summary || {};

    inMemorySummary = summary;
    inMemorySummaryAt = Date.now();
    writeSessionSummary(summary);
    inFlightSummary = null;

    return summary;
  })().catch((error) => {
    inFlightSummary = null;
    throw error;
  });

  return inFlightSummary;
}