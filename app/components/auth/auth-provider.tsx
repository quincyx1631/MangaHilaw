"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type User = {
  username: string;
  email: string;
} | null;

interface AuthContextType {
  user: User;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);

  const signIn = async (email: string, password: string) => {
    // This is a mock implementation
    // In a real app, you would call your API here
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock successful login
      setUser({
        username: email.split("@")[0], // Just using part of email as username for demo
        email,
      });
    } catch (error) {
      console.error("Sign in failed:", error);
      throw error;
    }
  };

  const signOut = () => {
    setUser(null);
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    // This is a mock implementation
    // In a real app, you would call your API here
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock successful registration and auto login
      setUser({
        username,
        email,
      });
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
