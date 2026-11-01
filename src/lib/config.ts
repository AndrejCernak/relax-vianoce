// Údaje o salóne. Riadky označené DOPLNIŤ treba pred spustením skontrolovať s Petou.
export const salon = {
  name: "Relax Žilina",
  fullName: "Relax Žilina – Charlie centrum",
  // Visblee uvádza „J. M. Geromettu 8772“, interne evidujeme „1A“. DOPLNIŤ: overiť presnú adresu.
  address: "J. M. Geromettu 1A, 010 01 Žilina",
  phone: "+421 911 111 641",
  phoneHref: "tel:+421911111641",
  hours: "Pondelok až sobota 9:00 – 19:00",
  bookingUrl: "https://visblee.sk/charlie-centrum",
  instagram: "https://www.instagram.com/relaxzilina/",
  facebook: "https://www.facebook.com/relaxzilina/",
  rating: { score: "4,9", count: 282 },
  // DOPLNIŤ: prevádzkovateľ (obchodné meno, sídlo, IČO, DIČ / IČ DPH, e-mail)
  operator: {
    company: "DOPLNIŤ obchodné meno",
    seat: "DOPLNIŤ sídlo",
    ico: "DOPLNIŤ",
    dic: "DOPLNIŤ",
    email: "DOPLNIŤ e-mail",
  },
};

export const siteUrl = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
export const voucherValidUntil = process.env.VOUCHER_VALID_UNTIL || "31. 3. 2027";
export const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";
