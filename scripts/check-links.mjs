/**
 * Checks every outbound URL in charities.js — donation pages, evaluator
 * reviews, and Every.org profiles — and reports anything that isn't reachable.
 *
 *   npm run check:links
 *
 * Written after givinggreen.earth/donate was found returning a hard 404 in
 * production. A dead donate link is the worst bug this site can have: the whole
 * page works, the reader decides to give, and then hits a wall. These URLs are
 * owned by other people and move without telling us, so checking them is a
 * chore that belongs to a script, not to whoever happens to notice.
 *
 * Run it alongside the quarterly figure refresh:
 *   grep -rn "VERIFY" src && npm run check:links
 *
 * Exits non-zero if anything is broken, so CI can fail on it.
 */
import { charities } from "../src/data/charities.js";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

/** Some charities put a WAF in front of their site that rejects any automated
 *  request. A 403 from those is not evidence the page is broken — but it is
 *  also not evidence it works, so we surface it as "check by hand" rather than
 *  quietly passing it. */
const NEEDS_HUMAN = new Set([403, 405, 429]);

async function check(url) {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "user-agent": UA, accept: "text/html,*/*" },
      signal: AbortSignal.timeout(20000),
    });
    return { status: res.status, finalUrl: res.url };
  } catch (err) {
    return { status: 0, error: err.name === "TimeoutError" ? "timeout" : String(err) };
  }
}

const targets = [];
for (const c of charities) {
  targets.push({ cause: c.id, kind: "donate", url: c.donateUrl });
  targets.push({ cause: c.id, kind: "evaluator", url: c.evaluatorUrl });
  if (c.everyOrg) {
    targets.push({
      cause: c.id,
      kind: "every.org",
      url: `https://www.every.org/${c.everyOrg.slug}`,
    });
  }
}

console.log(`Checking ${targets.length} outbound links…\n`);

const broken = [];
const manual = [];

for (const t of targets) {
  const { status, finalUrl, error } = await check(t.url);
  const ok = status >= 200 && status < 400;
  const flag = ok ? "ok  " : NEEDS_HUMAN.has(status) ? "?   " : "DEAD";

  if (!ok && !NEEDS_HUMAN.has(status)) broken.push({ ...t, status, error });
  if (NEEDS_HUMAN.has(status)) manual.push({ ...t, status });

  const moved = finalUrl && finalUrl !== t.url ? `  → ${finalUrl}` : "";
  console.log(
    `${flag} ${String(status || error).padEnd(7)} ${t.cause}/${t.kind.padEnd(10)} ${t.url}${moved}`,
  );
  // Be a polite guest on other people's servers.
  await new Promise((r) => setTimeout(r, 400));
}

console.log("");
if (manual.length) {
  console.log(`${manual.length} link(s) blocked automated checks — open by hand:`);
  manual.forEach((m) => console.log(`   ${m.cause}/${m.kind}: ${m.url}`));
  console.log("");
}

if (broken.length) {
  console.error(`${broken.length} BROKEN link(s):`);
  broken.forEach((b) =>
    console.error(`   ${b.cause}/${b.kind}: ${b.url} (${b.status || b.error})`),
  );
  process.exit(1);
}

console.log("No broken links.");
