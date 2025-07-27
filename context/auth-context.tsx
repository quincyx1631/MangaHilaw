"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import axios from "axios";
import type {
  AuthState,
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
} from "@/app/types/auth";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setState((prev) => ({ ...prev, isLoading: false }));
  }, []);

  useEffect(() => {
    const handleForcedLogout = () => {
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      toast({
        title: "Session expired",
        description: "Your session has expired. Please log in again.",
        variant: "destructive",
      });
    };

    window.addEventListener("auth-logout", handleForcedLogout);

    return () => {
      window.removeEventListener("auth-logout", handleForcedLogout);
    };
  }, [toast]);

  // Login function
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await axiosInstance.post<AuthResponse>(
          "/auth/login",
          credentials,
          { withCredentials: true }
        );

        if (!response.data.success) {
          throw new Error(response.data.message || "Login failed");
        }

        const { data } = response.data;
        if (!data || !data.user) {
          throw new Error("Invalid response from server");
        }

        setState({
          user: data.user,
          token: null,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        toast({
          title: "Login successful",
          description: `Welcome back, ${
            data.user.username || data.user.email
          }!`,
          variant: "default",
        });

        return;
      } catch (error) {
        console.error("Login error:", error);
        let errorMessage = "Login failed. Please try again.";

        if (axios.isAxiosError(error)) {
          if (error.response) {
            errorMessage =
              error.response.data?.error?.message ||
              error.response.data?.message ||
              "Invalid credentials";
          } else if (error.request) {
            errorMessage =
              "No response from server. Please check your connection.";
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        setState((prev) => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
          user: null,
          token: null,
          error: errorMessage,
        }));

        toast({
          title: "Login failed",
          description: errorMessage,
          variant: "destructive",
        });

        throw new Error(errorMessage);
      }
    },
    [toast]
  );

  const register = useCallback(
    async (credentials: RegisterCredentials): Promise<void> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await axiosInstance.post<AuthResponse>(
          "/auth/register",
          credentials
        );

        setState((prev) => ({
          ...prev,
          isLoading: false,
        }));

        toast({
          title: "Registration successful",
          description: "Please check your email for verification instructions.",
          variant: "default",
        });
      } catch (error) {
        console.error("Registration error:", error);
        let errorMessage = "Registration failed. Please try again.";

        if (axios.isAxiosError(error) && error.response) {
          errorMessage = error.response.data?.error?.message || errorMessage;
        }

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        toast({
          title: "Registration failed",
          description: errorMessage,
          variant: "destructive",
        });

        throw new Error(errorMessage);
      }
    },
    [toast]
  );

  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      await axiosInstance.post("/auth/logout", {}, { withCredentials: true });
      const username = state.user?.username || state.user?.email || "user";
      toast({
        title: "Logged out",
        description: `You have been successfully logged out. See you soon, ${username}!`,
        variant: "default",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout issue",
        description:
          "There was an issue with the server logout, but you've been logged out locally.",
        variant: "default",
      });
    } finally {
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      router.push("/");
    }
  }, [router, state.user, toast]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
