// Cloudflare Pages Function: POST /api/contact
// Verifies Turnstile, then sends the message via Resend to kontakt@cloudgains.de.
// Secrets (set in Cloudflare Pages -> Settings -> Environment variables):
//   RESEND_API_KEY, TURNSTILE_SECRET_KEY

const TO_ADDRESS = "kontakt@cloudgains.de";
const FROM_ADDRESS = "CloudGains DC <kontakt@cloudgains.de>";
const MAX_FIELD_LENGTH = 5000;

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const { name, email, paket, nachricht, turnstileToken } = body ?? {};

  if (!name || !email || !nachricht || !turnstileToken) {
    return Response.json({ error: "Bitte alle Pflichtfelder ausfüllen." }, { status: 400 });
  }
  if ([name, email, nachricht].some((v) => typeof v !== "string" || v.length > MAX_FIELD_LENGTH)) {
    return Response.json({ error: "Eingabe zu lang." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Ungültige E-Mail-Adresse." }, { status: 400 });
  }

  const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret: env.TURNSTILE_SECRET_KEY,
      response: turnstileToken,
      remoteip: request.headers.get("CF-Connecting-IP"),
    }),
  });
  const verifyResult = await verify.json();
  if (!verifyResult.success) {
    return Response.json({ error: "Spam-Prüfung fehlgeschlagen. Bitte versuche es erneut." }, { status: 403 });
  }

  const resendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: [TO_ADDRESS],
      reply_to: email,
      subject: `Neue Kontaktanfrage von ${name}`,
      html: `
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>E-Mail:</strong> ${escapeHtml(email)}</p>
        <p><strong>Interesse an:</strong> ${escapeHtml(paket || "-")}</p>
        <p><strong>Nachricht:</strong></p>
        <p>${escapeHtml(nachricht).replace(/\n/g, "<br>")}</p>
      `,
    }),
  });

  if (!resendRes.ok) {
    return Response.json({ error: "Versand fehlgeschlagen. Bitte versuche es später erneut." }, { status: 502 });
  }

  return Response.json({ ok: true });
}
