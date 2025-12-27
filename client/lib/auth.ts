export type AuthUser = {
  id: string;
  username: string;
  email: string;
  age: number;
  interests: string[];
  role: string;
  avatarUrl?: string;
};

// export function saveAuth(token: string, user: AuthUser) {
//   localStorage.setItem("token", token);
//   localStorage.setItem("user", JSON.stringify(user));
// }
export function saveAuth(token: string, user: any) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  notifyAuthChanged();
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}



export function notifyAuthChanged() {
  window.dispatchEvent(new Event("auth-changed"));
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  notifyAuthChanged();
}
