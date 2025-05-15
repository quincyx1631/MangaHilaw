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

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem("token");
        const userString = localStorage.getItem("user");

        if (token && userString) {
          const user = JSON.parse(userString) as User;
          setState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error("Error initializing auth state:", error);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await axiosInstance.post<AuthResponse>(
          "/auth/login",
          credentials
        );

        // Check if the response is successful and contains the expected data
        if (!response.data.success) {
          throw new Error(response.data.message || "Login failed");
        }

        const { data } = response.data;

        if (!data || !data.session?.access_token || !data.user) {
          throw new Error("Invalid response from server");
        }

        // Save auth data to localStorage
        localStorage.setItem("token", data.session.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setState({
          user: data.user,
          token: data.session.access_token,
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

        return; // Successfully logged in
      } catch (error) {
        console.error("Login error:", error);
        let errorMessage = "Login failed. Please try again.";

        if (axios.isAxiosError(error)) {
          // Handle Axios errors
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            errorMessage =
              error.response.data?.error?.message ||
              error.response.data?.message ||
              "Invalid credentials";
          } else if (error.request) {
            // The request was made but no response was received
            errorMessage =
              "No response from server. Please check your connection.";
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        setState((prev) => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false, // Ensure this is set to false
          user: null, // Clear any user data
          token: null, // Clear any token
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
      await axiosInstance.post("/auth/logout");
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
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      // Redirect to home page
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
