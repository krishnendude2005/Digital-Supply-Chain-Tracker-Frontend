import React, { createContext, useContext, useState, useEffect } from "react";
import type { Role, LoginResponse } from "../../types";
import { apiService } from "../../lib/api-client";
import { toast } from "sonner";

interface AuthUser {
  email: string;
  role: Role;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load initial credentials from localStorage
    const savedToken = localStorage.getItem("waypoint_auth_token");
    const savedUserStr = localStorage.getItem("waypoint_auth_user");

    if (savedToken && savedUserStr) {
      try {
        const savedUser = JSON.parse(savedUserStr) as AuthUser;
        setToken(savedToken);
        setUser(savedUser);
      } catch (e) {
        // Clear corrupt storage
        localStorage.removeItem("waypoint_auth_token");
        localStorage.removeItem("waypoint_auth_user");
      }
    }
    setIsLoading(false);

    // Listen to unauthorized interceptor events
    const handleUnauthorized = () => {
      logout();
      toast.error("Session expired. Please sign in again.");
    };

    window.addEventListener("auth_unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth_unauthorized", handleUnauthorized);
    };
  }, []);

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    setIsLoading(true);
    try {
      const response = await apiService.login({ email, password });
      setToken(response.token);
      
      const authUser: AuthUser = {
        email: response.email,
        role: response.role
      };
      
      setUser(authUser);
      localStorage.setItem("waypoint_auth_token", response.token);
      localStorage.setItem("waypoint_auth_user", JSON.stringify(authUser));
      
      toast.success(`Logged in as ${response.name || email} (${response.role})`);
      return response;
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in. Verify your email.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("waypoint_auth_token");
    localStorage.removeItem("waypoint_auth_user");
    toast.info("Logged out of control center");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
