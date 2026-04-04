import { z } from "zod";

// ─── Réservation ────────────────────────────────────────────────────────────

export const reservationSchema = z.object({
  firstName:      z.string().min(1, "Prénom requis").max(50),
  lastName:       z.string().min(1, "Nom requis").max(50),
  email:          z.email("Email invalide"),
  phone:          z.string().min(8, "Téléphone invalide").max(20).optional().or(z.literal("")),
  dateISO:        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide"),
  time:           z.string().regex(/^\d{2}:\d{2}$/, "Heure invalide"),
  guests:         z.number().int().min(1).max(12),
  area:           z.enum(["Lounge", "Terrasse", "Salle"]),
  occasion:       z.string().optional(),
  note:           z.string().max(500).optional(),
  preselected:    z.array(z.object({
    label:      z.string(),
    unitPrice:  z.number().optional(),
    qty:        z.number().int().min(0).max(9),
  })).optional(),
});

export type ReservationInput = z.infer<typeof reservationSchema>;

// ─── Auth — Connexion ────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email:    z.email("Email invalide"),
  password: z.string().min(6, "Mot de passe requis (6 caractères minimum)"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ─── Auth — Inscription ──────────────────────────────────────────────────────

export const registerSchema = z.object({
  prenom:           z.string().min(1, "Prénom requis").max(50),
  nom:              z.string().min(1, "Nom requis").max(50),
  email:            z.email("Email invalide"),
  telephone:        z.string().min(8, "Téléphone invalide").max(20).optional().or(z.literal("")),
  password:         z.string().min(8, "8 caractères minimum"),
  confirmPassword:  z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export type RegisterInput = z.infer<typeof registerSchema>;

// ─── Événement ──────────────────────────────────────────────────────────────

export const eventSchema = z.object({
  titre:        z.string().min(1, "Titre requis").max(100),
  description:  z.string().max(2000).optional(),
  date:         z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide"),
  heure_debut:  z.string().regex(/^\d{2}:\d{2}$/, "Heure invalide"),
  heure_fin:    z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal("")),
  type:         z.enum(["DJ Set", "Live Music", "Afterwork", "Soirée à thème", "Dinner & Lounge", "Autre"]),
  dress_code:   z.string().max(100).optional(),
  prix_entree:  z.number().min(0).default(0),
  capacite_max: z.number().int().min(1).optional(),
  a_la_une:     z.boolean().default(false),
  statut:       z.enum(["draft", "published", "cancelled"]).default("published"),
});

export type EventInput = z.infer<typeof eventSchema>;
