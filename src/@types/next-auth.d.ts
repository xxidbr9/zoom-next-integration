import NextAuth from "next-auth";

// Extend the NextAuth session type
declare module "next-auth" {
  interface Session {
    accessToken?: string; // Add accessToken to the session
  }

  interface JWT {
    accessToken?: string; // Add accessToken to the JWT token
  }
}