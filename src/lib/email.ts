import "server-only";
import { salon } from "./config";

// Transakčné e-maily. Predvolene cez n8n: stránka pošle hotový e-mail na webhook a n8n ho odošle
// cez Send Email (SMTP) z e-mailu WebPointu s menom salónu, workflow je v n8n/poukazky-email.json.
// Webhook nemá heslo, chráni ho náhodná adresa, ktorú pozná len Vercel. Náhradne cez Brevo API.

type Attachment = { name: string; content: string }; // content = base64

type Email = {
  to: { email: string; name?: string }[];
  subject: string;
  html: string;
  attachments?: Attachment[];
  replyTo?: string;
};

export async function sendEmail(opts: Email) {
  if (process.env.N8N_MAIL_WEBHOOK_URL) return sendViaN8n(process.env.N8N_MAIL_WEBHOOK_URL, opts);
  if (process.env.BREVO_API_KEY) return sendViaBrevo(process.env.BREVO_API_KEY, opts);
  console.warn("[email] chýba N8N_MAIL_WEBHOOK_URL aj BREVO_API_KEY, e-mail sa neodoslal:", opts.subject);
}

async function sendViaN8n(url: string, opts: Email) {
  const pdf = opts.attachments?.[0];
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fromName: process.env.EMAIL_FROM_NAME || salon.name,
      to: opts.to.map((t) => t.email).join(", "),
      subject: opts.subject,
      html: opts.html,
      replyTo: opts.replyTo ?? "",
      attachment: pdf ? { filename: pdf.name, base64: pdf.content } : null,
    }),
  });
  if (!res.ok) throw new Error(`n8n ${res.status}: ${(await res.text()).slice(0, 300)}`);
}

async function sendViaBrevo(key: string, opts: Email) {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": key, "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: { email: process.env.EMAIL_FROM, name: process.env.EMAIL_FROM_NAME || salon.name },
      to: opts.to,
      subject: opts.subject,
      htmlContent: opts.html,
      attachment: opts.attachments,
      replyTo: opts.replyTo ? { email: opts.replyTo } : undefined,
    }),
  });
  if (!res.ok) throw new Error(`Brevo ${res.status}: ${await res.text()}`);
}

export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
