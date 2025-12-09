import { getToken, login, logout } from "@/lib/api";
import { createContext, useContext, useEffect, useState } from "react";

// API関数をラップし，トークンをステート管理 => ProtectedRouteでセキュアに管理

type AuthContextType = {
  token: string | null;
  tokenLoading: boolean;
  signIn: (user_id: string, password: string) => Promise<boolean>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(true);

  // マウント時にトークンを復元
  useEffect(() => {
    const token = getToken();
    if (token) setToken(token);
    setTokenLoading(false);
  }, []);

  const signIn = async (user_id: string, password: string) => {
    const status = await login(user_id, password)
    setToken(getToken())
    return status;
  }

  const signOut = () => {
    logout();
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, tokenLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
