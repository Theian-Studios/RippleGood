/**
 * Giving reminders, scheduled on the phone.
 *
 * Local notifications, not push: no server, no device token, nothing about the
 * reader leaves the phone — the same line history.js holds. The cost is that a
 * one-off date can only be scheduled ahead of time, so both kinds are laid out
 * a long way in advance and topped up whenever the app opens.
 *
 * Two kinds, both off until the reader turns them on:
 *
 *   monthly  a day of the month they pick, repeating
 *   season   Giving Tuesday, and a last call before the tax year closes
 *
 * ── Why monthly is a series and not a repeating schedule ────────────────────
 * The plugin can build a genuinely repeating monthly trigger from
 * `schedule: { on: { day, hour } }`, and that is what this used to do. The
 * trouble is that a calendar trigger fires at its next match and there is no
 * way to tell it to skip the first one: a donor who gave at 9am on the 14th
 * and asked to be reminded "next month" got a reminder at 10am that morning.
 *
 * Laying out twelve one-off dates instead makes the first one an argument
 * (`notBefore`) rather than something the trigger decides, and it costs
 * nothing we weren't already paying — the season reminders work this way, and
 * refreshReminders() was already the thing keeping them stocked. Eighteen
 * pending notifications sits comfortably inside the 64 iOS allows.
 */
import { LocalNotifications } from "@capacitor/local-notifications";
import { Preferences } from "@capacitor/preferences";
import { isNative } from "./native.js";

const KEY = "ripple.reminders.v1";

// Fixed ids, so turning a reminder off cancels exactly what turning it on
// scheduled. Each block reserves room for its whole series.
const MONTHLY_BASE = 100;
const MONTHS_AHEAD = 12;
const TUESDAY_BASE = 200;
const YEAR_END_BASE = 300;
const YEARS_AHEAD = 3;

// Mid-morning: past the commute, before the day fills up.
const HOUR = 10;

const DEFAULTS = { monthlyDay: null, season: false };

export async function readReminders() {
  if (!isNative()) return DEFAULTS;
  try {
    const { value } = await Preferences.get({ key: KEY });
    return { ...DEFAULTS, ...JSON.parse(value || "{}") };
  } catch {
    return DEFAULTS;
  }
}

async function save(settings) {
  await Preferences.set({ key: KEY, value: JSON.stringify(settings) });
}

/**
 * Asks once, the first time a reminder is switched on — never at launch, where
 * a permission prompt with no context is the one most people refuse.
 */
async function ensurePermission() {
  let { display } = await LocalNotifications.checkPermissions();
  if (display === "prompt" || display === "prompt-with-rationale") {
    ({ display } = await LocalNotifications.requestPermissions());
  }
  return display === "granted";
}

/**
 * Giving Tuesday: the Tuesday after US Thanksgiving, which is the fourth
 * Thursday of November. Returned at the reminder hour, local time. November
 * overflows into December on its own, which is where this usually lands.
 */
export function givingTuesday(year) {
  const nov1 = new Date(year, 10, 1);
  const firstThursday = 1 + ((4 - nov1.getDay() + 7) % 7);
  return new Date(year, 10, firstThursday + 21 + 5, HOUR);
}

function nextYears(dateFor, now = new Date()) {
  const dates = [];
  for (let year = now.getFullYear(); dates.length < YEARS_AHEAD; year++) {
    const d = dateFor(year);
    if (d > now) dates.push(d);
  }
  return dates;
}

/**
 * The next `count` occurrences of `day` at the reminder hour, starting with the
 * first one strictly after `after`.
 *
 * Nothing in the past is ever returned, and that is load-bearing: the plugin
 * reads a past `at` as "deliver now", so a stale date here would not be a
 * missed reminder, it would be an immediate one.
 *
 * A day past the end of a short month rolls forward in JS, which is why the
 * picker stops at 28 — "the 31st" would arrive on March 3rd.
 */
function monthlyDates(day, { after, count }) {
  const dates = [];
  for (let i = 0; dates.length < count; i++) {
    const at = new Date(after.getFullYear(), after.getMonth() + i, day, HOUR);
    if (at > after) dates.push(at);
  }
  return dates;
}

function monthlyNotifications(day, { after }) {
  return monthlyDates(day, { after, count: MONTHS_AHEAD }).map((at, i) => ({
    id: MONTHLY_BASE + i,
    title: "Your monthly ripple",
    body: "The day you set aside for giving. Pick up where you left off.",
    schedule: { at, allowWhileIdle: true },
    extra: { path: "/you" },
  }));
}

function seasonNotifications() {
  const tuesdays = nextYears(givingTuesday).map((at, i) => ({
    id: TUESDAY_BASE + i,
    title: "It's Giving Tuesday",
    body: "The biggest giving day of the year. Find the cause you care about.",
    schedule: { at, allowWhileIdle: true },
    extra: { path: "/" },
  }));
  // Late enough to catch the last-minute giver, early enough that a card
  // payment still lands in the tax year.
  const yearEnds = nextYears((y) => new Date(y, 11, 28, HOUR)).map((at, i) => ({
    id: YEAR_END_BASE + i,
    title: "A few days left in the tax year",
    body: "Gifts made by December 31 count for this year's return.",
    schedule: { at, allowWhileIdle: true },
    extra: { path: "/" },
  }));
  return [...tuesdays, ...yearEnds];
}

const monthlyIds = () =>
  Array.from({ length: MONTHS_AHEAD }, (_, i) => ({ id: MONTHLY_BASE + i }));

const seasonIds = () =>
  Array.from({ length: YEARS_AHEAD }, (_, i) => [
    { id: TUESDAY_BASE + i },
    { id: YEAR_END_BASE + i },
  ]).flat();

/**
 * The monthly reminder: on for a day of the month, off for a falsy day.
 * Returns the saved settings, or null if the reader refused permission.
 *
 * `notBefore` is how the thank-you page's "Remind me next month" keeps its
 * word — it passes the end of today, so a gift made this morning cannot
 * produce a reminder this morning. The picker on Your ripple passes nothing,
 * where "the 14th" chosen on the 14th meaning today is the fair reading.
 */
export async function setMonthlyDay(day, { notBefore } = {}) {
  if (!isNative()) return null;
  const settings = await readReminders();

  if (!day) {
    await LocalNotifications.cancel({ notifications: monthlyIds() });
    const next = { ...settings, monthlyDay: null };
    await save(next);
    return next;
  }

  // Asked before anything is cancelled, so a refusal leaves whatever reminder
  // the reader already had exactly as it was.
  if (!(await ensurePermission())) return null;

  await LocalNotifications.cancel({ notifications: monthlyIds() });
  await LocalNotifications.schedule({
    notifications: monthlyNotifications(day, { after: notBefore || new Date() }),
  });

  const next = { ...settings, monthlyDay: day };
  await save(next);
  return next;
}

export async function setSeason(on) {
  if (!isNative()) return null;
  const settings = await readReminders();

  if (!on) {
    await LocalNotifications.cancel({ notifications: seasonIds() });
    const next = { ...settings, season: false };
    await save(next);
    return next;
  }

  if (!(await ensurePermission())) return null;

  await LocalNotifications.cancel({ notifications: seasonIds() });
  await LocalNotifications.schedule({ notifications: seasonNotifications() });

  const next = { ...settings, season: true };
  await save(next);
  return next;
}

/**
 * Run at launch. Re-lays both series so there are always plenty ahead however
 * long it has been since the app was last opened, and so a setting that reads
 * "on" is always backed by notifications that actually exist. Does nothing,
 * and asks nothing, for a reader who never turned them on.
 */
export async function refreshReminders() {
  if (!isNative()) return;
  try {
    const { season, monthlyDay } = await readReminders();
    if (!season && !monthlyDay) return;

    const { display } = await LocalNotifications.checkPermissions();
    if (display !== "granted") return;

    if (monthlyDay) {
      await LocalNotifications.cancel({ notifications: monthlyIds() });
      await LocalNotifications.schedule({
        notifications: monthlyNotifications(monthlyDay, { after: new Date() }),
      });
    }
    if (season) {
      await LocalNotifications.cancel({ notifications: seasonIds() });
      await LocalNotifications.schedule({ notifications: seasonNotifications() });
    }
  } catch {
    /* A missed top-up only costs a reminder at the far end of the series. */
  }
}
