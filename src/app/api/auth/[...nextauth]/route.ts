import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "john.doe@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        // Here you should add your own logic to find the user from your database.
        // For demonstration purposes, we'll check against a user in the database.
        // In a real application, you would also want to hash and compare the password.
        
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        // This is a placeholder for password validation.
        // In a real app, you should hash passwords and compare the hash.
        // For this example, we'll just check if a user exists with that email.
        // IMPORTANT: Do NOT use this in production without password hashing.
        if (user) {
          // This is where you would compare `credentials.password` with a hashed password from the user object.
          // For now, we return the user if they exist.
          return { id: user.id, name: user.name, email: user.email, image: user.image };
        }
        
        return null;
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "database",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
