// auth.ts
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github"; // Example OAuth Provider
import Credentials from "next-auth/providers/credentials"; // For custom email/password

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub, 
    Credentials({
      // Your custom authorization logic goes here (e.g. comparing passwords via bcrypt)
      async authorize(credentials) {
        // const user = await getUserFromDb(credentials.email)
        // return user
        return null;
      }
    })
  ],
});