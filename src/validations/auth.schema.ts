import { z } from "zod";

export const loginSchema = z.object({
  matricule: z
    .string()
    .min(1, "Le matricule est requis")
    .trim()
    .toUpperCase(),
  password: z
    .string()
    .min(1, "Le mot de passe est requis"),
});

export type LoginInput = z.infer<typeof loginSchema>;
