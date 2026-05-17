export type EventType =
  | "DJ Set"
  | "Afterwork"
  | "Live Music"
  | "Soirée à thème"
  | "Dinner & Lounge";

export type EventItem = {
  id: string;
  title: string;
  type: EventType;
  dateISO: string; // YYYY-MM-DD
  time: string; // HH:mm
  dressCode?: string;
  description: string;
  highlight?: boolean;
  image: {
    src: string;
    alt: string;
  };
};

export type MenuCategory =
  | "Cocktails"
  | "Sans alcool"
  | "Softs"
  | "Vins"
  | "Champagnes"
  | "Bières"
  | "Spiritueux"
  | "Shooters";

export type MenuBadge = "Signature" | "Best-seller" | "Premium";

export type MenuItem = {
  id: string;
  category: MenuCategory;
  name: string;
  description: string;
  price: number;
  badge?: MenuBadge;
};

export type BookingStatus = "Confirmée" | "En attente" | "Terminée";

export type Booking = {
  id: string;
  dateISO: string;
  time: string;
  guests: number;
  area: "Lounge" | "Terrasse" | "Salle";
  status: BookingStatus;
  note?: string;
  estimatedTotal?: number;
};

export const brand = {
  name: "XI BestPlaze",
  baseline: "Lounge · Cocktails & Saveurs",
  cta: "Réservez votre expérience",
  address: "56 Rue de Suède, 37100 Tours",
  phone: "07 68 62 73 19",
  email: "reservation@bestplaze.com",
  openingHours: [
    { label: "Lundi",    value: "Fermé" },
    { label: "Mar — Sam", value: "18h — 2h" },
    { label: "Dimanche", value: "Fermé" },
  ],
  social: [
    { label: "Instagram", href: "https://www.instagram.com/xibestplaze/" },
    { label: "TikTok", href: "https://www.tiktok.com/@xibestplaze" },
  ],
  assets: {
    logoSrc: "/brand/mark.clean.png",
  },
} as const;

export const events: EventItem[] = [
  {
    id: "evt-01",
    title: "DJ Set : Gold Hour",
    type: "DJ Set",
    dateISO: "2026-04-04",
    time: "22:30",
    dressCode: "Chic nocturne",
    description:
      "Une nuit intense, deep & groovy. Cocktails, lumières dorées et sélection musicale élégante jusqu'à tard.",
    highlight: true,
    image: { src: "/events/dj-gold-hour.svg", alt: "DJ set — ambiance dorée" },
  },
  {
    id: "evt-02",
    title: "Afterwork Lounge",
    type: "Afterwork",
    dateISO: "2026-04-09",
    time: "19:00",
    dressCode: "Smart casual",
    description:
      "L'afterwork version XI BestPlaze. Cocktails, terrasse ouverte, ambiance lounge.",
    image: { src: "/events/afterwork.svg", alt: "Afterwork — lounge bar" },
  },
  {
    id: "evt-03",
    title: "Live Music Night",
    type: "Live Music",
    dateISO: "2026-04-11",
    time: "21:30",
    dressCode: "Chic",
    description:
      "Live session intimiste. Scène feutrée, énergie chaleureuse, carte cocktails complète.",
    image: { src: "/events/live-music.svg", alt: "Live music — scène feutrée" },
  },
  {
    id: "evt-04",
    title: "Soirée Black & Gold",
    type: "Soirée à thème",
    dateISO: "2026-04-18",
    time: "23:00",
    dressCode: "Black & Gold",
    description:
      "Dress code noir & or, dancefloor, champagne et ambiance nocturne exclusive.",
    image: { src: "/events/black-gold.svg", alt: "Soirée Black & Gold" },
  },
  {
    id: "evt-05",
    title: "Dinner & Lounge Experience",
    type: "Dinner & Lounge",
    dateISO: "2026-04-25",
    time: "20:00",
    dressCode: "Chic",
    description:
      "Dîner, cocktails d'auteur et transition naturelle vers le lounge. Une soirée complète.",
    image: { src: "/events/dinner-lounge.svg", alt: "Dîner — ambiance lounge" },
  },
];

export const menuCategories: { id: MenuCategory; label: string }[] = [
  { id: "Cocktails", label: "Cocktails" },
  { id: "Sans alcool", label: "Sans alcool" },
  { id: "Softs", label: "Softs" },
  { id: "Bières", label: "Bières" },
  { id: "Vins", label: "Vins" },
  { id: "Champagnes", label: "Champagnes" },
  { id: "Spiritueux", label: "Spiritueux" },
  { id: "Shooters", label: "Shooters" },
];

export const menuItems: MenuItem[] = [
  // ── COCKTAILS (12€) ─────────────────────────────────────────────────────
  {
    id: "ct-01",
    category: "Cocktails",
    name: "Blue Perfect",
    description: "Champagne, Crème de pêche, Curaçao bleu, Malibu",
    price: 12,
    badge: "Signature",
  },
  {
    id: "ct-02",
    category: "Cocktails",
    name: "Caïpirinha",
    description: "Cachaça, Citron vert, Sucre de canne",
    price: 12,
  },
  {
    id: "ct-03",
    category: "Cocktails",
    name: "Cuba Libre",
    description: "Havana Club, Citron vert, Coca Cola",
    price: 12,
  },
  {
    id: "ct-04",
    category: "Cocktails",
    name: "French",
    description: "Bombay Gin, Citron vert, Sucre de canne, Champagne",
    price: 12,
  },
  {
    id: "ct-05",
    category: "Cocktails",
    name: "Gin Tonic",
    description: "Gordons, Tonic, Rondelle d'orange, Rondelle concombre",
    price: 12,
  },
  {
    id: "ct-06",
    category: "Cocktails",
    name: "London Mule",
    description: "Bombay Gin, Citron vert, Ginger beer",
    price: 12,
  },
  {
    id: "ct-07",
    category: "Cocktails",
    name: "Long Island",
    description: "Vodka Smirnoff, Tequila Blanco",
    price: 12,
  },
  {
    id: "ct-08",
    category: "Cocktails",
    name: "Margarita",
    description: "Tequila Blanco, Cointreau, Jus de citron",
    price: 12,
  },
  {
    id: "ct-09",
    category: "Cocktails",
    name: "Mojito",
    description: "Havana Club, Citron vert, Sucre de canne, Menthe fraîche, Limonade",
    price: 12,
    badge: "Best-seller",
  },
  {
    id: "ct-10",
    category: "Cocktails",
    name: "Moscow Mule",
    description: "Vodka Absolut, Citron vert, Ginger beer",
    price: 12,
  },
  {
    id: "ct-11",
    category: "Cocktails",
    name: "Pina Colada",
    description: "Havana Club, Jus d'ananas, Sirop de coco, Crème liquide",
    price: 12,
  },
  {
    id: "ct-12",
    category: "Cocktails",
    name: "Pink Paradise",
    description: "Vodka Smirnoff, Limonade, Fraise / Grenadine",
    price: 12,
  },
  {
    id: "ct-13",
    category: "Cocktails",
    name: "Sex On The Beach",
    description: "Vodka Smirnoff, Jus d'ananas, Jus de cranberry, Crème de pêche",
    price: 12,
  },
  {
    id: "ct-14",
    category: "Cocktails",
    name: "Spritz",
    description: "Aperol, Prosecco, Soda, Rondelle d'orange",
    price: 12,
    badge: "Best-seller",
  },
  {
    id: "ct-15",
    category: "Cocktails",
    name: "Tequila Sunrise",
    description: "Tequila Blanco, Jus d'orange, Sirop de grenadine",
    price: 12,
  },
  {
    id: "ct-punch",
    category: "Cocktails",
    name: "Punch",
    description: "Préparation maison à partager",
    price: 25,
    badge: "Signature",
  },

  // ── SANS ALCOOL (9€) ────────────────────────────────────────────────────
  {
    id: "na-01",
    category: "Sans alcool",
    name: "Virgin Mojito",
    description: "Citron vert, Sucre de canne, Menthe fraîche, Limonade",
    price: 9,
  },
  {
    id: "na-02",
    category: "Sans alcool",
    name: "Colada",
    description: "Jus d'ananas, Sirop de coco, Crème liquide",
    price: 9,
  },
  {
    id: "na-03",
    category: "Sans alcool",
    name: "Strawberry Colada",
    description: "Fraise, Jus d'ananas, Sirop de coco, Crème liquide",
    price: 9,
  },

  // ── SOFTS ───────────────────────────────────────────────────────────────
  {
    id: "so-01",
    category: "Softs",
    name: "Sodas",
    description: "Coca Cola · Ice Tea · Limonade · Schweppes · Oasis",
    price: 6,
  },
  {
    id: "so-02",
    category: "Softs",
    name: "Jus de fruits",
    description: "Ananas · Fraise · Orange · Pomme",
    price: 6,
  },
  {
    id: "so-03",
    category: "Softs",
    name: "Sirop à l'eau",
    description: "+0,50€ supplément sirop au choix",
    price: 3.5,
  },

  // ── BIÈRES EN BOUTEILLE (6€) ─────────────────────────────────────────────
  {
    id: "bi-01",
    category: "Bières",
    name: "Heineken",
    description: "Bière blonde en bouteille",
    price: 6,
  },
  {
    id: "bi-02",
    category: "Bières",
    name: "Desperados",
    description: "Bière aromatisée tequila en bouteille",
    price: 6,
  },
  {
    id: "bi-03",
    category: "Bières",
    name: "Leffe",
    description: "Bière d'abbaye en bouteille",
    price: 6,
  },

  // ── VINS ────────────────────────────────────────────────────────────────
  {
    id: "vi-01",
    category: "Vins",
    name: "AOC Brouilly",
    description: "14cl · 28cl · 50cl · 75cl",
    price: 7,
  },
  {
    id: "vi-02",
    category: "Vins",
    name: "Bordeaux",
    description: "14cl · 28cl · 50cl · 75cl",
    price: 5,
  },
  {
    id: "vi-03",
    category: "Vins",
    name: "Chablis",
    description: "14cl · 28cl · 50cl · 75cl",
    price: 8,
  },
  {
    id: "vi-04",
    category: "Vins",
    name: "Chardonnay / Vouvray",
    description: "14cl · 28cl · 50cl · 75cl",
    price: 5.5,
  },
  {
    id: "vi-05",
    category: "Vins",
    name: "Chinon Bourgueil",
    description: "Bouteille 75cl",
    price: 28,
  },
  {
    id: "vi-06",
    category: "Vins",
    name: "Côte du Rhône",
    description: "Bouteille 75cl",
    price: 28,
  },
  {
    id: "vi-07",
    category: "Vins",
    name: "Monbazillac / Coteaux du Layon",
    description: "14cl · 28cl · 50cl · 75cl",
    price: 7,
  },

  // ── CHAMPAGNES ──────────────────────────────────────────────────────────
  {
    id: "ch-01",
    category: "Champagnes",
    name: "Coupe de champagne",
    description: "Sélection maison",
    price: 12,
    badge: "Best-seller",
  },
  {
    id: "ch-02",
    category: "Champagnes",
    name: "Moët et Chandon",
    description: "Bouteille 75cl",
    price: 100,
  },
  {
    id: "ch-03",
    category: "Champagnes",
    name: "Veuve Cliquot",
    description: "Bouteille 75cl",
    price: 130,
  },
  {
    id: "ch-04",
    category: "Champagnes",
    name: "Ruinart",
    description: "Bouteille 75cl",
    price: 150,
    badge: "Premium",
  },
  {
    id: "ch-05",
    category: "Champagnes",
    name: "Dom Pérignon",
    description: "Bouteille 75cl",
    price: 300,
    badge: "Premium",
  },

  // ── SPIRITUEUX ──────────────────────────────────────────────────────────
  {
    id: "sp-ap-01",
    category: "Spiritueux",
    name: "Martini",
    description: "Blanc ou rouge",
    price: 6.5,
  },
  {
    id: "sp-ap-02",
    category: "Spiritueux",
    name: "Ricard",
    description: "Apéritif anisé",
    price: 6.5,
  },
  {
    id: "sp-dg-01",
    category: "Spiritueux",
    name: "Cognac",
    description: "Digestif",
    price: 10,
  },
  {
    id: "sp-dg-02",
    category: "Spiritueux",
    name: "Cognac XO",
    description: "Digestif grande réserve",
    price: 20,
    badge: "Premium",
  },
  {
    id: "sp-dg-03",
    category: "Spiritueux",
    name: "Get 27 / Get 31",
    description: "Liqueur de menthe",
    price: 6,
  },
  {
    id: "sp-dg-04",
    category: "Spiritueux",
    name: "Porto blanc",
    description: "Digestif doux",
    price: 6,
  },
  {
    id: "sp-al-01",
    category: "Spiritueux",
    name: "Alcool — verre",
    description:
      "Smirnoff · Havana · Old Nick · Clan Campbell · Gibson · Absolut · Bouteille : 80€ · +1€ accompagnement",
    price: 10,
  },
  {
    id: "sp-al-02",
    category: "Spiritueux",
    name: "Alcool supérieur — verre",
    description:
      "Jack Daniel's · Jack Honey · Bombay · Chivas · Saint James · Yu Gin · Belvédère · Haig Club · San José · Bouteille : 100€",
    price: 10,
  },
  {
    id: "sp-al-03",
    category: "Spiritueux",
    name: "Cîroc",
    description: "Bouteille 70cl",
    price: 110,
    badge: "Premium",
  },

  // ── SHOOTERS ────────────────────────────────────────────────────────────
  {
    id: "sh-01",
    category: "Shooters",
    name: "Shooter",
    description: "Les 10 verres : 40€",
    price: 5,
  },
  {
    id: "sh-02",
    category: "Shooters",
    name: "Jäger Shooter",
    description: "Les 10 verres : 50€",
    price: 6,
  },
];

export const userProfile = {
  name: "Camille Durand",
  email: "camille.durand@email.com",
  phone: "+33 6 12 34 56 78",
  status: "Client privilégié",
  preferences: {
    newsletter: true,
    sms: false,
    favoriteArea: "Lounge" as const,
  },
};

export const bookings: Booking[] = [
  {
    id: "bk-9012",
    dateISO: "2026-04-04",
    time: "22:00",
    guests: 4,
    area: "Lounge",
    status: "Confirmée",
    estimatedTotal: 220,
    note: "Anniversaire — bougies + table calme si possible.",
  },
  {
    id: "bk-8721",
    dateISO: "2026-03-14",
    time: "20:30",
    guests: 2,
    area: "Salle",
    status: "Terminée",
    estimatedTotal: 98,
  },
];
