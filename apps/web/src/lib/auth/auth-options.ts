import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { prisma } from "@/lib/db/prisma";
import { loginSchema } from "@forge/shared";
import { assertRateLimit, getClientIpFromHeaders } from "@/lib/server/rate-limit";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const clientIp = getClientIpFromHeaders(request.headers);
        if (clientIp !== "unknown") {
          assertRateLimit(`auth:login:ip:${clientIp}`, {
            maxRequests: 20,
            windowMs: 10 * 60 * 1000,
            message: "Too many login attempts. Please try again shortly.",
          });
        }

        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        assertRateLimit(`auth:login:email:${parsed.data.email}`, {
          maxRequests: 10,
          windowMs: 10 * 60 * 1000,
          message: "Too many login attempts. Please try again shortly.",
        });

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });

        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
