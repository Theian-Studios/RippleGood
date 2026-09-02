/**
 * Fires one fake donation through the real webhook, to prove the alert path.
 *
 *   node scripts/test-webhook.mjs
 *
 * Exists because the last link in the chain — a stored row turning into a
 * Telegram message — only runs on a genuine insert, and there is no way to
 * exercise it without one. Everything either side of it is already proven by a
 * real donation; this closes the gap without spending money.
 *
 * The URL secret is typed at a hidden prompt, so it stays out of shell history
 * and the process list, and is never written down. It is the only credential
 * that can authenticate to the webhook, which is the whole reason the endpoint
 * is safe to leave open.
 *
 * This writes a real row. It is one cent, and the script tells you which row to
 * delete afterwards — leaving fake data in a table whose entire purpose is that
 * it is verified would be the wrong habit to start.
 */
import { createInterface } from "node:readline";
import { stdin, stdout } from "node:process";

const PROJECT = "petyjtrvdodvewdvfmzy";
const ENDPOINT = `https://${PROJECT}.supabase.co/functions/v1/everyorg-webhook`;

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: stdin, output: stdout, terminal: true });
    if (hidden) {
      const onData = (char) => {
        if (["\n", "\r", ""].includes(String(char))) stdin.pause();
        else stdout.write("[2K[200D" + question + "*".repeat(rl.line.length));
      };
      stdin.on("data", onData);
      rl.question(question, (a) => {
        stdin.removeListener("data", onData);
        stdout.write("\n");
        rl.close();
        resolve(a.trim());
      });
      return;
    }
    rl.question(question, (a) => {
      rl.close();
      resolve(a.trim());
    });
  });
}

const secret = await ask("EVERYORG_URL_SECRET (hidden): ", { hidden: true });
if (!secret) {
  console.error("No secret given.");
  process.exit(1);
}

// A charge id nobody could mistake for a real one, and unique per run so a
// second attempt isn't swallowed as a duplicate delivery.
const chargeId = `test-alert-${Date.now().toString(36)}`;
const payload = {
  chargeId,
  toNonprofit: { slug: "againstmalaria", ein: "20-3069841" },
  amount: "0.01",
  netAmount: "0.01",
  currency: "USD",
  frequency: "One-time",
  paymentMethod: "test",
  partnerDonationId: chargeId,
  partnerMetadata: Buffer.from(JSON.stringify({ cause: "malaria-nets" })).toString("base64"),
  donationDate: new Date().toISOString(),
};

const res = await fetch(`${ENDPOINT}?k=${encodeURIComponent(secret)}`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(payload),
});
const body = await res.text();

console.log(`\nHTTP ${res.status}  ${body}`);

if (res.status === 401) {
  console.error(
    "\nThat secret was rejected. It is the ?k= value on the endpoint URL you\n" +
      "pasted into Every.org's developer dashboard — not the webhook_token, and\n" +
      "not the anon key.",
  );
  process.exit(1);
}

if (res.ok) {
  console.log(
    `\nCheck Telegram — you should have "$0.01 to Malaria Nets".\n\n` +
      `Then delete the row, so a fake gift doesn't sit in the verified totals:\n` +
      `  https://supabase.com/dashboard/project/${PROJECT}/editor\n` +
      `  Table donation_events -> charge_id = ${chargeId} -> delete\n\n` +
      `If nothing arrives in Telegram, the row was still stored — the alert is\n` +
      `deliberately fire-and-forget, so a dead notifier can never cost you the\n` +
      `donation record. Check the function logs:\n` +
      `  https://supabase.com/dashboard/project/${PROJECT}/functions`,
  );
}
