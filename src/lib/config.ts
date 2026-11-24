// Údaje o salóne (fakturačné údaje od klienta 22. 11. 2026). Riadky označené DOPLNIŤ treba skontrolovať s Petou.
export const salon = {
  name: "Relax Žilina",
  fullName: "Relax Žilina – Charlie centrum",
  // Fakturačné údaje uvádzajú „H.M.Gerometta 8772/1A“, ulica v Žiline je J. M. Geromettu (aj podľa Visblee).
  address: "J. M. Geromettu 8772/1A, 010 01 Žilina",
  phone: "+421 911 111 641",
  phoneHref: "tel:+421911111641",
  hours: "Pondelok až sobota 9:00 – 19:00",
  bookingUrl: "https://visblee.sk/charlie-centrum",
  instagram: "https://www.instagram.com/relaxzilina/",
  facebook: "https://www.facebook.com/relaxzilina/",
  rating: { score: "4,9", count: 282 },
  // Prevádzkovateľ a predávajúci (rovnaká firma prevádzkuje aj Paradise Martin)
  operator: {
    company: "PEDORE s.r.o., registrovaný sociálny podnik",
    seat: "1. mája 144/31, 038 51 Turčianska Štiavnička",
    ico: "45284971",
    dic: "2022922737",
    icDph: "SK2022922737",
    email: "zilinarelax@gmail.com",
  },
};

/** Označenie platieb z tejto stránky v metadátach Stripe (ten istý účet PEDORE s.r.o. môže používať aj Paradise Martin). */
export const appId = "relax-darceky";

/** Sadzba DPH na faktúrach zo Stripe (ceny sú vrátane DPH). PEDORE ako registrovaný sociálny podnik má 5 % (klient 24. 11. 2026). VAT_RATE na Verceli ju prepíše. */
export const vatRate = Number(process.env.VAT_RATE ?? 5);

export const siteUrl = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
export const voucherValidUntil = process.env.VOUCHER_VALID_UNTIL || "31. 3. 2027";
export const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";

/** Black Friday stránka (/black-friday). Termín predaja je v products.ts (blackFridayWindow). */
export const blackFriday = {
  theme: "blue" as "gold" | "blue",
  themeColor: "#0B2C86",
  brand: { main: "Relax", sub: "Žilina" },
  place: "v Relaxe",
  packageName: "Body Shape",
  dateLabel: "23. – 29. 11.",
  startLabel: "23.\u00a011.",
  howToBook: `Termín si rezervujete na Visblee alebo na čísle ${salon.phone}`,
  // DOPLNIŤ: platnosť Black Friday balíkov potvrdiť s Petou (10× balík potrebuje dosť času).
  validUntil: process.env.BF_VALID_UNTIL || voucherValidUntil,
};
