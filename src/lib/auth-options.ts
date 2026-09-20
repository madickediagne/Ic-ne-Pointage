import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/validations/auth.schema";

export const authOptions: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Connexion",
      credentials: {
        matricule: { label: "Matricule", type: "text", placeholder: "Ex: IMN01" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        // Validation des champs
        const parsedCredentials = loginSchema.safeParse(credentials);
        
        if (!parsedCredentials.success) {
          return null;
        }

        const { matricule, password } = parsedCredentials.data;
        const cleanMatricule = matricule.trim().toUpperCase();

        // Recherche de l'utilisateur dans la base de données
        const user = await prisma.user.findUnique({
          where: { matricule: cleanMatricule },
        });

        if (!user) {
          return null;
        }

        // Vérification si le compte est actif
        if (user.status !== "ACTIF") {
          return null;
        }

        // Vérification du mot de passe
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
          return null;
        }

        // Tout est bon, on retourne l'utilisateur pour la session
        return {
          id: user.id,
          matricule: user.matricule,
          name: `${user.prenom} ${user.nom}`,
          role: user.role,
          departmentId: user.departmentId,
          status: user.status,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.matricule = user.matricule;
        token.role = user.role;
        token.departmentId = user.departmentId;
        token.status = user.status;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.matricule = token.matricule as string;
        session.user.role = token.role as string;
        session.user.departmentId = token.departmentId as string | undefined;
        session.user.status = token.status as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 heures
  },
  secret: process.env.AUTH_SECRET,
};
