// Mails a new account request to info@soulfulyoga.nl through the Hostnet mailbox.
// Called by the database (notify_account_request) with only the request id: the function
// reads the request itself and marks it mailed in the same step, so each request is
// mailed once and a caller can't make it send anything else.
// Secret: SMTP_PASSWORD (Hostnet mailbox). SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are
// provided by Supabase. Port 465 (SSL): Supabase blocks outgoing ports 25 and 587.
import { createClient } from 'npm:@supabase/supabase-js@2';
import nodemailer from 'npm:nodemailer@6.9.16';

const STUDIO = 'info@soulfulyoga.nl';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

Deno.serve(async (req) => {
  const { id } = (await req.json().catch(() => ({}))) as { id?: string };
  if (req.method !== 'POST' || !id) return new Response('Ongeldig verzoek', { status: 400 });

  // Claim the request: only an unmailed request from the last hour.
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: request } = await db
    .from('account_requests')
    .update({ mailed_at: new Date().toISOString() })
    .eq('id', id)
    .is('mailed_at', null)
    .gt('created_at', new Date(Date.now() - 3600_000).toISOString())
    .select('name, email, phone')
    .maybeSingle();
  if (!request) return new Response('Niets te versturen', { status: 200 });
  const { name, email, phone } = request as { name: string; email: string; phone: string };

  const transport = nodemailer.createTransport({
    host: 'smtp.hostnet.nl',
    port: 465,
    secure: true,
    auth: { user: STUDIO, pass: Deno.env.get('SMTP_PASSWORD') },
  });

  await transport.sendMail({
    from: `"Soulful Yoga app" <${STUDIO}>`,
    to: STUDIO,
    replyTo: email,
    subject: `Accountaanvraag: ${name}`,
    text: `Nieuwe accountaanvraag via de Soulful Yoga-app.\n\nNaam: ${name}\nE-mailadres: ${email}\nTelefoon: ${phone}\n\nMaak het account aan in de app (Profiel → Klanten beheren) of in het beheerportaal (Klanten). De klant krijgt dan automatisch een mail om een wachtwoord in te stellen.`,
    html: `<div style="font-family:Helvetica,Arial,sans-serif;color:#1F3D2B;font-size:15px;line-height:22px">
      <p style="font-size:18px;font-weight:bold;margin:0 0 12px">Nieuwe accountaanvraag</p>
      <table style="border-collapse:collapse">
        <tr><td style="padding:3px 16px 3px 0;color:#6E7A70">Naam</td><td><b>${esc(name)}</b></td></tr>
        <tr><td style="padding:3px 16px 3px 0;color:#6E7A70">E-mailadres</td><td><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
        <tr><td style="padding:3px 16px 3px 0;color:#6E7A70">Telefoon</td><td><a href="tel:${esc(phone)}">${esc(phone)}</a></td></tr>
      </table>
      <p style="margin:16px 0 0">Maak het account aan in de app (Profiel → Klanten beheren) of in het beheerportaal (Klanten). De klant krijgt dan automatisch een mail om een wachtwoord in te stellen.</p>
    </div>`,
  });

  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
});
