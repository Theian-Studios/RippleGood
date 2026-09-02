/**
 * Finds the chat id for your Telegram bot, and offers to send a test message.
 *
 *   node scripts/telegram-setup.mjs
 *
 * The token is typed at a hidden prompt rather than passed as an argument or an
 * env var, so it stays out of your shell history and out of the process list.
 * Nothing is written to disk.
 *
 * A bot cannot start a conversation, so before running this you must open the
 * bot in Telegram and send it any message — that is what makes a chat id exist
 * at all. If getUpdates comes back empty, that step is almost always why.
 */
import { createInterface } from "node:readline";
import { stdin, stdout } from "node:process";

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: stdin, output: stdout, terminal: true });
    if (hidden) {
      // Swallow the echo so the token never appears on screen.
      const onData = (char) => {
        if (["\n", "\r", ""].includes(String(char))) stdin.pause();
        else stdout.write("[2K[200D" + question + "*".repeat(rl.line.length));
      };
      stdin.on("data", onData);
      rl.question(question, (answer) => {
        stdin.removeListener("data", onData);
        stdout.write("\n");
        rl.close();
        resolve(answer.trim());
      });
      return;
    }
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

const token = await ask("Telegram bot token (hidden): ", { hidden: true });
if (!token) {
  console.error("No token given.");
  process.exit(1);
}

const api = (method, params) =>
  fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(params ?? {}),
  }).then((r) => r.json());

const me = await api("getMe");
if (!me.ok) {
  console.error(`\nTelegram rejected the token: ${me.description ?? "unknown error"}`);
  process.exit(1);
}
console.log(`\nBot: @${me.result.username}`);

const updates = await api("getUpdates");
const chats = new Map();
for (const u of updates.result ?? []) {
  const chat = u.message?.chat ?? u.channel_post?.chat;
  if (chat) chats.set(chat.id, chat);
}

if (chats.size === 0) {
  console.error(
    "\nNo chats found.\n" +
      "Open the bot in Telegram and send it any message, then run this again.\n" +
      "A bot can never message you first, so until you do there is no chat id.",
  );
  process.exit(1);
}

console.log("\nChats that have messaged this bot:");
for (const chat of chats.values()) {
  const who = chat.username ? `@${chat.username}` : (chat.title ?? chat.first_name ?? "");
  console.log(`  ${String(chat.id).padEnd(16)} ${chat.type.padEnd(10)} ${who}`);
}

const [firstId] = chats.keys();
const send = await ask(`\nSend a test message to ${firstId}? [y/N] `);
if (send.toLowerCase() === "y") {
  const res = await api("sendMessage", {
    chat_id: firstId,
    text: "Ripple Good: alerts are wired up. This is what a donation ping will look like.",
  });
  console.log(res.ok ? "Sent — check Telegram." : `Failed: ${res.description}`);
}

console.log(
  `\nNow set both secrets together (neither works alone):\n\n` +
    `  npx supabase secrets set TELEGRAM_BOT_TOKEN=<your token> TELEGRAM_CHAT_ID=${firstId}\n\n` +
    `Then deploy:\n\n` +
    `  npx supabase functions deploy everyorg-webhook --no-verify-jwt\n`,
);
