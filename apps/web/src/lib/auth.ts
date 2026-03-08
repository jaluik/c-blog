import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        // 向后端换取 JWT
        const res = await fetch(`${process.env.API_URL}/api/auth/github`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: account.access_token }),
        });

        const data = await res.json();
        token.backendToken = data.data.token;
        token.userId = profile.id;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).backendToken = token.backendToken;
      (session as any).userId = token.userId;
      return session;
    },
  },
});
