import { z } from "zod";
import { MATRICULE_REGEX, MATRICULE_PREFIX } from "@/lib/constants";

export const loginSchema = z.object({
  matricule: z
    .string()
    .min(1, "Le matricule est requis")
    .toUpperCase()
    .trim()
    .refine((val) => val.startsWith(MATRICULE_PREFIX), {
      message: `Le matricule doit commencer par ${MATRICULE_PREFIX}`,
    })
    .refine((val) => MATRICULE_REGEX.test(val), {
      message: "Format du matricule invalide (ex: ICN001)",
    }),
  password: z
    .string()
    .min(1, "Le mot de passe est requis")
    .min(6, "Le mot de passe doit faire au moins 6 caractères"),
});

export type LoginInput = z.infer<typeof loginSchema>;
