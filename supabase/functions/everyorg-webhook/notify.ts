/**
 * "Someone donated" alerts.
 *
 * ── What is deliberately not in here ───────────────────────────────────────
 * Nothing identifying the donor. Not because it is filtered out at this layer,
 * but because it never arrives at it: sendDonationAlert takes the stored row,
 * and the stored row has no name, no email, and no charge id. The alert can
 * only ever say what was given and which cause sent it, which is what the
 * cause page promises the donor when they click Give.
 *
 * ── Choosing a transport ───────────────────────────────────────────────────
 * Whichever secret is set wins, in the order below. Set none and this is a
 * no-op, which is how the function ran before and how a fork of it should run.
 *
 *   RESEND_API_KEY + ALERT_EMAIL_TO   email, via Resend
 *   DISCORD_WEBHOOK_URL               Discord channel message
 *   TELEGRAM_BOT_TOKEN + ..._CHAT_ID  Telegram message
 *   ALERT_WEBHOOK_URL                 plain JSON POST (Slack-compatible)
 *
 * Set with: supabase secrets set NAME=value
 */

/**
 * Cause ids we know how to name. Unknown ids still alert, just unprettified.
 *
 * The retired ids are kept deliberately: a donor who opened a donate link
 * before a rename carries the old id in their partner_metadata, and completes
 * the gift afterwards. Keep them in step with CAUSE_ALIASES in charities.js.
 */
const CAUSE_LABELS: Record<string, string> = {
  "malaria-nets": "Malaria Nets",
  "global-health": "Malaria Nets", // retired
  "malaria-medicine": "Malaria Medicine",
  "disease-prevention": "Malaria Medicine", // retired
  "child-survival": "Child Survival",
  "child-nutrition": "Child Survival", // retired
  "animal-welfare": "Animal Welfare",
  climate: "Climate",
  "extreme-poverty": "Extreme Poverty",
  "direct-cash": "Extreme Poverty", // retired
  "intestinal-worms": "Intestinal Worms",
  deworming: "Intestinal Worms", // retired
  "lead-poisoning": "Lead Poisoning",
  "lead-exposure": "Lead Poisoning", // retired
  climate: "Climate", // retired
  micronutrients: "Micronutrients", // retired
};

export type DonationAlert = {
  amountCents: number;
  causeId: string | null;
  nonprofitSlug: string;
  frequency: string;
  donatedAt: string;
  /** Source tag from a ?ref= link, when the donor arrived on one. */
  referrer?: string | null;
};

const money = (cents: number) =>
  (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

function describe(a: DonationAlert) {
  const cause = a.causeId
    ? (CAUSE_LABELS[a.causeId] ?? a.causeId)
    : "an uncategorised route";
  const cadence = /month/i.test(a.frequency) ? "/month" : "";
  return {
    subject: `${money(a.amountCents)}${cadence} to ${cause}`,
    body:
      `${money(a.amountCents)}${cadence} to ${cause}\n` +
      `Nonprofit: ${a.nonprofitSlug}\n` +
      `Frequency: ${a.frequency}\n` +
      (a.referrer ? `Came from: ${a.referrer}\n` : "") +
      `Donated:   ${a.donatedAt}\n\n` +
      `No donor details are recorded, so there are none to show here.`,
  };
}

/**
 * Never throws and never rejects. A donation that was recorded but not
 * announced is a nuisance; a 500 back to Every.org because an email provider
 * was down would cost us the record itself.
 */
export async function sendDonationAlert(a: DonationAlert): Promise<void> {
  try {
    const { subject, body } = describe(a);

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const emailTo = Deno.env.get("ALERT_EMAIL_TO");
    if (resendKey && emailTo) {
      const from = Deno.env.get("ALERT_EMAIL_FROM") ?? "onboarding@resend.dev";
      await post("https://api.resend.com/emails", {
        headers: { authorization: `Bearer ${resendKey}` },
        body: {
          from: `Ripple Good <${from}>`,
          to: [emailTo],
          subject: `Ripple Good — ${subject}`,
          text: body,
        },
      });
      return;
    }

    const discord = Deno.env.get("DISCORD_WEBHOOK_URL");
    if (discord) {
      await post(discord, { body: { content: `**${subject}**\n${body}` } });
      return;
    }

    const tgToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const tgChat = Deno.env.get("TELEGRAM_CHAT_ID");
    if (tgToken && tgChat) {
      await post(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        body: { chat_id: tgChat, text: `${subject}\n\n${body}` },
      });
      return;
    }

    // Slack and Mattermost both read `text`; anything else gets the fields.
    const hook = Deno.env.get("ALERT_WEBHOOK_URL");
    if (hook) {
      await post(hook, { body: { text: `${subject}\n${body}`, ...a } });
    }
  } catch (err) {
    console.error("donation alert failed", err);
  }
}

async function post(
  url: string,
  { headers = {}, body }: { headers?: Record<string, string>; body: unknown },
) {
  // A hung provider must not hold the webhook response open.
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    console.error("alert transport rejected", res.status, await res.text());
  }
}
