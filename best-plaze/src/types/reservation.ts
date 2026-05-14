/** Ligne telle que renvoyée par Supabase (snake_case). */
export type ReservationRow = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  date_reservation: string;
  heure: string;
  nb_personnes: number;
  espace: string;
  occasion: string | null;
  notes: string | null;
  statut: string;
  total_estimatif: number;
  stripe_session_id: string | null;
  stripe_payment_status: string | null;
  preselection: string[] | null;
  montant_paye: number | null;
  created_at: string;
};

/** Corps attendu pour POST /api/reservations (camelCase, aligné sur le formulaire). */
export type CreateReservationBody = {
  firstName: string;
  lastName: string;
  /** Si vide, fournir au moins `phone` (l’API enregistre un email technique pour la base). */
  email?: string;
  phone?: string;
  dateISO: string;
  time: string;
  guests: number;
  area: string;
  occasion?: string;
  note?: string;
  statut?: string;
  totalEstimatif?: number;
};
