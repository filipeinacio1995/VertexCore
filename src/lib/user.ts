const KEY = "tebex_user_v1";

export type TebexUser = {
  username?: string;
  username_id?: string;
};

export function setUser(u: TebexUser) {
  localStorage.setItem(KEY, JSON.stringify(u));
}

export function getUser(): TebexUser | null {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "null");
  } catch {
    return null;
  }
}

export function clearUser() {
  localStorage.removeItem(KEY);
}

export const USER_KEY = KEY;