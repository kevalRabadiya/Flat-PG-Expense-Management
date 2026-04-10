import { useCallback, useEffect, useMemo, useState } from "react";
import {
  authMe,
  getStoredToken,
  loginRequest,
  registerMemberRequest,
  registerOrgRequest,
  setStoredToken,
} from "../api.js";
import { AuthContext } from "./authContext.js";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const t = getStoredToken();
    if (!t) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await authMe();
      setUser(me);
    } catch {
      setStoredToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (username, password) => {
    const { token, user: u } = await loginRequest({ username, password });
    setStoredToken(token);
    setUser(u);
  }, []);

  const registerOrg = useCallback(async (body) => {
    const { token, user: u } = await registerOrgRequest(body);
    setStoredToken(token);
    setUser(u);
  }, []);

  const registerMember = useCallback(async (body) => {
    const { token, user: u } = await registerMemberRequest(body);
    setStoredToken(token);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    setStoredToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      registerOrg,
      registerMember,
      refreshUser,
    }),
    [user, loading, login, logout, registerOrg, registerMember, refreshUser]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
