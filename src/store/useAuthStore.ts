import { create } from "zustand";

const SESSION_KEY = "auth_session";

interface AuthState {
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => boolean;
  signOut: () => void;
}

const MOCK_EMAIL = "admin@wellness.com";
const MOCK_PASSWORD = "admin123";

export { MOCK_EMAIL, MOCK_PASSWORD };

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: sessionStorage.getItem(SESSION_KEY) === "true",
  signIn: (email, password) => {
    if (email === MOCK_EMAIL && password === MOCK_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "true");
      set({ isAuthenticated: true });
      return true;
    }
    return false;
  },
  signOut: () => {
    sessionStorage.removeItem(SESSION_KEY);
    set({ isAuthenticated: false });
  }
}));
