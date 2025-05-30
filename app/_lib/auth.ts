import { db } from "@/app/_lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { AuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      const userFromDb = await db.user.findUnique({
        where: { id: user.id },
      });

      // ADICIONE ESTE CONSOLE.LOG
      console.log("[AUTH.TS] Usuário do banco de dados:", userFromDb);

      session.user.id = user.id;
      session.user.role = userFromDb?.role ?? null;

      return session;
    },
  },
  secret: process.env.NEXT_AUTH_SECRET,
};