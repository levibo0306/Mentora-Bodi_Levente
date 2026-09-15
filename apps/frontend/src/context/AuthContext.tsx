import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
// Importáljuk a típusokat és az API hívókat
import { loginApi, registerApi, updateProfileApi, type AuthUser, type UserRole } from "../api/auth";

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // A login/register itt email/jelszót vár!
  login: (identifier: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, role: UserRole) => Promise<void>;
  updateProfile: (data: { username: string; email: string; current_password: string; new_password?: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({} as any);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Induláskor betöltjük a localStorage-ból
  useEffect(() => {
    const storedToken = localStorage.getItem("mentora_token");
    const storedUser = localStorage.getItem("mentora_user");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Hibás user adat");
        localStorage.removeItem("mentora_token");
      }
    }
    setIsLoading(false);
  }, []);

  // Segédfüggvény a mentéshez
  const persist = (newToken: string, newUser: AuthUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("mentora_token", newToken);
    localStorage.setItem("mentora_user", JSON.stringify(newUser));
  };

  // Login implementáció: API hívás -> Mentés
  const login = async (identifier: string, password: string) => {
    const data = await loginApi(identifier, password);
    persist(data.token, data.user);
  };

  // Register implementáció: API hívás -> Mentés
  const register = async (username: string, email: string, password: string, role: UserRole) => {
    const data = await registerApi(username, email, password, role);
    persist(data.token, data.user);
  };

  const updateProfile = async (data: { username: string; email: string; current_password: string; new_password?: string }) => {
    const result = await updateProfileApi(data);
    persist(result.token, result.user);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("mentora_token");
    localStorage.removeItem("mentora_user");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token,
      login, 
      register,
      updateProfile,
      logout, 
      isAuthenticated: !!user,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
