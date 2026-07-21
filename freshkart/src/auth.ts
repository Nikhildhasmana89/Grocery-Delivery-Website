// auth.ts
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github"; // Example OAuth Provider
import Credentials from "next-auth/providers/credentials"; // For custom email/password
import { connect } from "mongoose";
import connectDB from "./app/lib/db";
import Email from "next-auth/providers/email";
import User from "./app/models/user.model";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "Enter your email",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter your password",
        },
      },
      async authorize(credentials) {
        try {
          await connectDB();
          const email = credentials.email;
          const password = credentials.password as string;
          const user = await User.findOne({ email });

          if (!user) {
            throw new Error("user does not exist");
          }

          const isMatch = await bcrypt.compare(password, user.password);

          if (!isMatch) {
            throw new Error("incorrect password");
          }

          return {
            id: user._id as string,
            email: user.email,
            name: user.name,
            role: user.role,
          };

          return user;
        } catch (error) {
          console.error("Error during authorization:", error);
          throw new Error("An error occurred while processing your request");
        }
      },
    }),
  ],

  callbacks: {
  jwt({ token, user }) {
    if (user) {
      token.id = user.id;
      token.email = user.email;
      token.name = user.name;
      token.role = user.role;
    }
    return token;
  },

  session({ session, token }) {
    if(session.user) {
      session.user.id = token.id as string;
      session.user.email = token.email as string;
      session.user.name = token.name as string;
      session.user.role = token.role as string;
    } 
    return session
  }
},
  pages: {
    signIn: "/login", 
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days

  },
  secret: process.env.AUTH_SECRET,
});

