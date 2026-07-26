import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import connectDB from "@/app/lib/db";
import User from "@/app/models/user.model";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectDB();

        const email = credentials?.email as string;
        const password = credentials?.password as string;

        if (!email || !password) {
          throw new Error("Please provide both email and password.");
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
          throw new Error("Invalid email or password.");
        }

        // Check if user registered via Google only (no password set)
        if (!user.password) {
          throw new Error("Please sign in with Google.");
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          throw new Error("Invalid email or password.");
        }

        // Return user object directly
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),

    Google({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // Handle Google OAuth Flow
      if (account?.provider === "google") {
        try {
          await connectDB();

          let dbUser = await User.findOne({ email: user.email?.toLowerCase() });

          // Auto-create user if they don't exist
          if (!dbUser) {
            dbUser = await User.create({
              name: user.name,
              email: user.email?.toLowerCase(),
              image: user.image,
              role: "user",
            });
          }

          // Safely attach DB values to the user object for the JWT callback
          user.id = dbUser._id.toString();
          (user as any).role = dbUser.role;

          return true;
        } catch (error) {
          console.error("Error during Google OAuth sign-in:", error);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = (user as any).role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
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