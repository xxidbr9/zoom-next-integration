import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Zoom from "next-auth/providers/zoom"
import { prisma } from '@/lib/prisma'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Zoom],
  // adapter: PrismaAdapter(prisma),
  // debug: true,
  callbacks: {
    async session({ session, token }) {
      // Attach the access token to the session object
      if (token) {
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // Store the access token when signing in
      if (account?.provider === "zoom") {
        token.accessToken = account.access_token;
      }
      return token;
    },
  }
})