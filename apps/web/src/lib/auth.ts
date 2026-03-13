import type { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";

interface GitHubProfile {
  id: number;
  login: string;
  avatar_url?: string;
  name?: string;
  email?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const githubProfile = profile as unknown as GitHubProfile;
        try {
          // 向后端换取 JWT
          const res = await fetch(`${process.env.API_URL}/api/auth/github`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ access_token: account.access_token }),
          });

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            console.error("Backend auth failed:", errorData);
            throw new Error(errorData.error || "Backend authentication failed");
          }

          const data = await res.json();
          token.backendToken = data.data.token;
          token.userId = githubProfile.id;
        } catch (error) {
          console.error("JWT callback error:", error);
          throw error;
        }
      }
      // 确保 userId 始终是 number 类型
      if (token.userId) {
        token.userId = Number(token.userId);
      }
      return token;
    },
    async session({ session, token }) {
      session.backendToken = token.backendToken;
      session.userId = token.userId ? Number(token.userId) : undefined;
      return session;
    },
  },
};

export default NextAuth(authOptions);
