import { getAuth } from "firebase/auth";

export async function apiFetch(url, options = {}) {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error("No user logged in");

  const token = await user.getIdToken();

  const res = await fetch(`http://127.0.0.1:5000/api${url}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "API request failed");
  }

  return data;
}