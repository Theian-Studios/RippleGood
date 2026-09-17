/**
 * "Your ripple": the gifts this phone has made, kept on this phone.
 *
 * Nothing here leaves the device. The site's whole position is that it knows a
 * gift happened and nothing about who gave it, and a history synced to a
 * server would quietly end that. So it lives in the app's own preferences
 * (UserDefaults), which survives app updates and is cleared when the app is
 * deleted — not in the WebView's localStorage, which iOS may purge on its own
 * when the phone runs low on space.
 *
 * A gift is recorded only on the return trip from a checkout this app opened
 * (Thanks.jsx, matching the pending record by id), so it is as honest as the
 * thank-you page itself: it means "Every.org said the gift went through", not a
 * figure anyone verified.
 */
import { Preferences } from "@capacitor/preferences";
import { isNative } from "./native.js";

const KEY = "ripple.history.v1";

/** Every gift, newest first. */
export async function readGifts() {
  if (!isNative()) return [];
  try {
    const { value } = await Preferences.get({ key: KEY });
    const list = JSON.parse(value || "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

async function writeGifts(list) {
  await Preferences.set({ key: KEY, value: JSON.stringify(list) });
}

/**
 * Adds a gift. The id is the donation ref, so a thank-you page reloaded or
 * reopened from the app switcher can't count the same gift twice.
 */
export async function recordGift({ id, causeId, amount, monthly }) {
  if (!isNative() || !id) return false;
  const list = await readGifts();
  if (list.some((g) => g.id === id)) return false;
  list.unshift({ id, causeId, amount, monthly: Boolean(monthly), at: Date.now() });
  await writeGifts(list);
  return true;
}

/** For a gift that didn't happen, or a monthly one since cancelled. */
export async function removeGift(id) {
  const list = await readGifts();
  await writeGifts(list.filter((g) => g.id !== id));
}
