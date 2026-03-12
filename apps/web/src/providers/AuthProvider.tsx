"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Type cast to work around next-auth v4 React 19 compatibility issue
  return <SessionProvider>{children as React.ReactNode}</SessionProvider>;
}
