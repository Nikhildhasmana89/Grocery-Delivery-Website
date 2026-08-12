import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";

import connectDB from "@/lib/db";
import User from "@/models/user.model";

export const {
  handlers,
  signIn,
  signOut,
  auth,
} = NextAuth({
  // ============================================
  // PROVIDERS
  // ============================================

  providers: [
    // ==========================================
    // CREDENTIALS
    // ==========================================

    Credentials({
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
        const email =
          typeof credentials?.email === "string"
            ? credentials.email
                .trim()
                .toLowerCase()
            : "";

        const password =
          typeof credentials?.password === "string"
            ? credentials.password
            : "";

        if (!email || !password) {
          throw new Error(
            "Please provide both email and password.",
          );
        }

        // ========================================
        // DATABASE
        // ========================================

        await connectDB();

        // ========================================
        // ONLY FETCH REQUIRED FIELDS
        // ========================================

        const user = await User.findOne({
          email,
        }).select(
          "_id email name password role image mobile roleSelected",
        );

        if (!user) {
          throw new Error(
            "Invalid email or password.",
          );
        }

        // ========================================
        // GOOGLE-ONLY ACCOUNT
        // ========================================

        if (!user.password) {
          throw new Error(
            "Please sign in with Google.",
          );
        }

        // ========================================
        // PASSWORD CHECK
        // ========================================

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

        // ========================================
        // RETURN MINIMAL USER
        // ========================================

        return {
          id: user._id.toString(),

          email: user.email,

          name: user.name,

          role: user.role,

          image: user.image ?? "",

          mobile: user.mobile ?? "",

          roleSelected:
            user.roleSelected ?? false,
        };
      },
    }),

    // ==========================================
    // GOOGLE
    // ==========================================

    Google({
      clientId:
        process.env.GOOGLE_CLIENT_ID!,

      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET!,

      authorization: {
        params: {
          prompt: "select_account",

          access_type: "offline",

          response_type: "code",
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
      // GOOGLE
      // ----------------------------------------

      if (account?.provider === "google") {
        try {
          await connectDB();

          const email =
            user.email
              ?.trim()
              .toLowerCase();

          if (!email) {
            return false;
          }

          let dbUser =
            await User.findOne({
              email,
            }).select(
              "_id email name role image mobile roleSelected",
            );

          // --------------------------------------
          // CREATE USER
          // --------------------------------------

          if (!dbUser) {
            dbUser =
              await User.create({
                name: user.name ?? "",

                email,

                image: user.image ?? "",

                role: "user",

                roleSelected: false,
              });
          }

          // --------------------------------------
          // COPY DB DATA TO JWT USER
          // --------------------------------------

          user.id =
            dbUser._id.toString();

          (user as any).role =
            dbUser.role;

          (user as any).mobile =
            dbUser.mobile ?? "";

          (user as any).roleSelected =
            dbUser.roleSelected ?? false;

          return true;
        } catch (error) {
          console.error(
            "Google sign-in error:",
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
        token.id = user.id;

        token.email =
          user.email;

        token.name =
          user.name;

        token.picture =
          user.image;

        token.role =
          (user as any).role;

        token.mobile =
          (user as any).mobile;

        token.roleSelected =
          (user as any).roleSelected;
      }

      // ----------------------------------------
      // CLIENT SESSION UPDATE
      // ----------------------------------------

      if (
        trigger === "update" &&
        session
      ) {
        if (
          session.role !== undefined
        ) {
          token.role =
            session.role;
        }

        if (
          session.mobile !== undefined
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
          token.id as string;

        session.user.email =
          token.email as string;

        session.user.name =
          token.name as string;

        session.user.image =
          token.picture as string;

        (session.user as any).role =
          token.role as string;

        (session.user as any).mobile =
          token.mobile as string;

        (session.user as any).roleSelected =
          token.roleSelected as boolean;
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