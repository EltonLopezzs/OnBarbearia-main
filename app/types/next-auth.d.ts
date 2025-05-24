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
      // Busca o usuário no banco de dados para garantir que a 'role' esteja atualizada.
      const userFromDb = await db.user.findUnique({
        where: { id: user.id },
      });

      // Adiciona o id e a role ao objeto da sessão.
      session.user.id = user.id;
      session.user.role = userFromDb?.role ?? null; // A role é adicionada aqui!

      return session;
    },
  },
  secret: process.env.NEXT_AUTH_SECRET,
};