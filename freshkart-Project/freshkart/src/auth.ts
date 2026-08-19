import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";

import connectDB from "@/lib/db";
import User from "@/models/user.model";

// ============================================
// CANONICAL BASE URL RESOLUTION
// Ensures redirect_uri matches production HTTPS URL on Vercel deployment
// ============================================
const getCanonicalBaseUrl = (): string => {
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/^https?:\/\//, "")}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/^https?:\/\//, "")}`;
  }
  const customUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL;
  if (customUrl && !customUrl.includes("localhost")) {
    const formatted = customUrl.replace(/\/$/, "");
    return formatted.startsWith("http") ? formatted : `https://${formatted}`;
  }
  return "http://localhost:3000";
};

if (process.env.NODE_ENV === "production" || process.env.VERCEL_URL) {
  const baseUrl = getCanonicalBaseUrl();
  process.env.AUTH_URL = baseUrl;
  process.env.NEXTAUTH_URL = baseUrl;
}

export const {
  handlers,
  signIn,
  signOut,
  auth,
} = NextAuth({
  // ============================================
  // DEBUG
  // ============================================

  debug: process.env.NODE_ENV === "development",

  // ============================================
  // TRUST HOST
  // ============================================

  trustHost: true,

  // ============================================
  // PROVIDERS
  // ============================================

  providers: [
    // ==========================================
    // CREDENTIALS
    // ==========================================

    Credentials({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },

        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        try {
          const email =
            typeof credentials?.email ===
            "string"
              ? credentials.email
                  .trim()
                  .toLowerCase()
              : "";

          const password =
            typeof credentials?.password ===
            "string"
              ? credentials.password
              : "";

          if (!email || !password) {
            throw new Error(
              "Please provide both email and password.",
            );
          }

          // --------------------------------------
          // DATABASE
          // --------------------------------------

          await connectDB();

          // --------------------------------------
          // FIND USER
          // --------------------------------------

          const user =
            await User.findOne({
              email,
            }).select(
              "_id email name password role image mobile roleSelected",
            );

          if (!user) {
            throw new Error(
              "Invalid email or password.",
            );
          }

          // --------------------------------------
          // GOOGLE-ONLY ACCOUNT
          // --------------------------------------

          if (!user.password) {
            throw new Error(
              "Please sign in with Google.",
            );
          }

          // --------------------------------------
          // PASSWORD CHECK
          // --------------------------------------

          const isMatch =
            await bcrypt.compare(
              password,
              user.password,
            );

          if (!isMatch) {
            throw new Error(
              "Invalid email or password.",
            );
          }

          // --------------------------------------
          // RETURN USER
          // --------------------------------------

          return {
            id: user._id.toString(),

            email:
              user.email ?? "",

            name:
              user.name ?? "",

            role:
              user.role ?? "user",

            image:
              user.image ?? "",

            mobile:
              user.mobile ?? "",

            roleSelected:
              user.roleSelected ??
              false,
          };
        } catch (error) {
          console.error(
            "❌ Credentials authorize error:",
            error,
          );

          throw error;
        }
      },
    }),

    // ==========================================
    // GOOGLE
    // ==========================================

    Google({
      clientId:
        process.env.GOOGLE_CLIENT_ID ?? "",

      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET ?? "",

      allowDangerousEmailAccountLinking: true,

      authorization: {
        params: {
          prompt:
            "select_account",

          access_type:
            "offline",

          response_type:
            "code",
        },
      },
    }),
  ],

  // ============================================
  // CALLBACKS
  // ============================================

  callbacks: {
    // ==========================================
    // SIGN IN
    // ==========================================

    async signIn({
      user,
      account,
    }) {
      // ----------------------------------------
      // GOOGLE LOGIN
      // ----------------------------------------

      if (
        account?.provider === "google"
      ) {
        try {
          await connectDB();

          const email =
            user.email
              ?.trim()
              .toLowerCase();

          if (!email) {
            console.error(
              "❌ Google account has no email",
            );

            return false;
          }

          let dbUser =
            await User.findOne({
              email,
            }).select(
              "_id email name role image mobile roleSelected",
            );

          // --------------------------------------
          // CREATE GOOGLE USER
          // --------------------------------------

          if (!dbUser) {
            dbUser =
              await User.create({
                name:
                  user.name ?? "",

                email,

                image:
                  user.image ?? "",

                role: "user",

                roleSelected:
                  false,
              });

            console.log(
              "✅ Google user created:",
              dbUser._id,
            );
          }

          // --------------------------------------
          // COPY DATABASE USER DATA
          // --------------------------------------

          user.id =
            dbUser._id.toString();

          (
            user as any
          ).role =
            dbUser.role ??
            "user";

          (
            user as any
          ).mobile =
            dbUser.mobile ?? "";

          (
            user as any
          ).roleSelected =
            dbUser.roleSelected ??
            false;

          return true;
        } catch (error) {
          console.error(
            "❌ Google sign-in error:",
            error,
          );

          return false;
        }
      }

      return true;
    },

    // ==========================================
    // JWT
    // ==========================================

    async jwt({
      token,
      user,
      trigger,
      session,
    }) {
      // ----------------------------------------
      // INITIAL LOGIN
      // ----------------------------------------

      if (user) {
        token.id =
          user.id;

        token.email =
          user.email ?? "";

        token.name =
          user.name ?? "";

        token.picture =
          user.image ?? "";

        token.role =
          (user as any).role ??
          "user";

        token.mobile =
          (user as any).mobile ??
          "";

        token.roleSelected =
          (user as any)
            .roleSelected ??
          false;
      }

      // ----------------------------------------
      // SESSION UPDATE
      // ----------------------------------------

      if (
        trigger === "update" &&
        session
      ) {
        if (
          session.role !==
          undefined
        ) {
          token.role =
            session.role;
        }

        if (
          session.mobile !==
          undefined
        ) {
          token.mobile =
            session.mobile;
        }

        if (
          session.roleSelected !==
          undefined
        ) {
          token.roleSelected =
            session.roleSelected;
        }
      }

      return token;
    },

    // ==========================================
    // SESSION
    // ==========================================

    async session({
      session,
      token,
    }) {
      if (session.user) {
        session.user.id =
          String(
            token.id ?? "",
          );

        session.user.email =
          String(
            token.email ?? "",
          );

        session.user.name =
          String(
            token.name ?? "",
          );

        session.user.image =
          String(
            token.picture ?? "",
          );

        (
          session.user as any
        ).role =
          String(
            token.role ??
              "user",
          );

        (
          session.user as any
        ).mobile =
          String(
            token.mobile ?? "",
          );

        (
          session.user as any
        ).roleSelected =
          Boolean(
            token.roleSelected,
          );
      }

      return session;
    },
  },

  // ============================================
  // PAGES
  // ============================================

  pages: {
    signIn: "/login",
    error: "/login",
  },

  // ============================================
  // SESSION
  // ============================================

  session: {
    strategy: "jwt",

    maxAge:
      30 * 24 * 60 * 60,
  },

  // ============================================
  // SECRET
  // ============================================

  secret:
    process.env.AUTH_SECRET,
});