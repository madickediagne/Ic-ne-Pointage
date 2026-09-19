import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Extension de la session retournée par `useSession`, `getSession` et `auth()`
   */
  interface Session {
    user: {
      id: string;
      matricule: string;
      role: string;
      departmentId?: string | null;
      status: string;
    } & DefaultSession["user"];
  }

  /**
   * Extension du type User (ce qui est retourné par la fonction authorize)
   */
  interface User {
    id: string;
    matricule: string;
    role: string;
    departmentId?: string | null;
    status: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extension du token JWT
   */
  interface JWT {
    id: string;
    matricule: string;
    role: string;
    departmentId?: string | null;
    status: string;
  }
}
