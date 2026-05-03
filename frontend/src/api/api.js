import { getAuth } from "firebase/auth";

/**
 * apiFetch
 * Automatically attaches Firebase ID token to every request
 */
export async function apiFetch(url, options = {}) {
  const auth = getAuth();

  // 1. Wait for Firebase to initialize user properly
  const user = await new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      unsubscribe();
      resolve(u);
    });
  });

  if (!user) {
    throw new Error("User not authenticated");
  }
  // 2. Get a fresh token so newly assigned custom claims are included immediately
  const token = await user.getIdToken(true);

  // 3. Send request with Authorization header
  const res = await fetch(`http://127.0.0.1:5000/api${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  // 4. Safely parse response
  let data = null;

  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  // 5. Handle API errors properly
  if (res.status === 401) {
    // token expired or invalid
    await auth.signOut();
    window.location.href = "/";
    throw new Error("Session expired. Please log in again.");
  }

  if (!res.ok) {
    const message =
      data?.error ||
      data?.message ||
      `HTTP ${res.status} ${res.statusText}`;

    throw new Error(message);
  }

  return data;
}