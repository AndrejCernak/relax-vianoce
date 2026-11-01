import "server-only";

// Transakčné e-maily cez Brevo API.

type Attachment = { name: string; content: string }; // content = base64

export async function sendEmail(opts: {
  to: { email: string; name?: string }[];
  subject: string;
  html: string;
  attachments?: Attachment[];
  replyTo?: string;
}) {
  const key = process.env.BREVO_API_KEY;
  if (!key) {
    console.warn("[email] chýba BREVO_API_KEY, e-mail sa neodoslal:", opts.subject);
    return;
  }
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": key, "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: { email: process.env.EMAIL_FROM, name: process.env.EMAIL_FROM_NAME || "Relax Žilina" },
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
