/**
 * Structural type matching Cloudflare's `send_email` binding (Email Service public beta).
 *
 * Configured in wrangler.jsonc as:
 *   "send_email": [{ "name": "EMAIL" }]
 *
 * Domain must be onboarded to Email Sending in the Cloudflare dashboard
 * (Email → Email Sending → Onboard Domain) before sends will succeed.
 */
export type EmailBinding = {
  send: (params: {
    from: string;
    to: string;
    subject: string;
    html: string;
  }) => Promise<unknown>;
};

export async function sendEmail({
  binding,
  from,
  to,
  subject,
  html,
}: {
  binding: EmailBinding;
  from: string;
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  try {
    await binding.send({ from, to, subject, html });
  } catch (err) {
    // Don't throw — email failures shouldn't break the request flow.
    // Cloudflare logs the underlying error in Workers Logs.
    console.error(`[email] send failed (to=${to}, subject=${subject}):`, err);
  }
}
