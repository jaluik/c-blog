import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    userId?: number;
    backendToken?: string;
    user: DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: number;
    backendToken?: string;
  }
}
