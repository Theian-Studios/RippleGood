/**
 * What the iOS app can do that the website can't, behind one import.
 *
 * The same `dist/` ships to the public site and into the app, so everything
 * here has to be a no-op in a browser and during prerender. `isNative()` is the
 * one test, and every export checks it before touching a plugin: Capacitor's
 * plugins do have web fallbacks, but "open checkout in a sheet" or "buzz the
 * phone" silently doing something else on the website is worse than nothing.
 */
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

/** Registered in ios/App/App/Info.plist (CFBundleURLTypes). */
export const APP_SCHEME = "ripplegood";

/**
 * Checkout in a Safari sheet over the app (true), or out to Safari itself
 * (false).
 *
 * App Review guideline 3.2.2(iv) lets an app that isn't the nonprofit collect
 * donations only through "a website that launches Safari". The sheet is Safari
 * (SFSafariViewController: Safari's engine, cookies and autofill, and the app
 * can't see into it), and apps ship donation flows this way, but a reviewer
 * could read the rule literally. If one does, flip this: the return trip to the
 * app works the same either way, because it rides on the ripplegood:// link
 * rather than on the sheet.
 */
export const IN_APP_CHECKOUT = true;

export function isNative() {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/** Opens a donation page. Only call inside the app. */
export async function openCheckout(url) {
  if (IN_APP_CHECKOUT) {
    await Browser.open({ url, presentationStyle: "popover" });
  } else {
    // Capacitor hands any navigation off its own origin to Safari.
    window.location.href = url;
  }
}

/** Dismisses the checkout sheet, if one is up. */
export async function closeCheckout() {
  if (!IN_APP_CHECKOUT) return;
  try {
    await Browser.close();
  } catch {
    /* Nothing open. */
  }
}

// Haptics never matter enough to surface a failure.
const quietly = (fn) => {
  if (!isNative()) return;
  fn().catch(() => {});
};

/** A choice changed: a tier, the monthly box. */
export const tapSelection = () => quietly(() => Haptics.selectionChanged());

/** A committed action: the Give button. */
export const tapImpact = () => quietly(() => Haptics.impact({ style: ImpactStyle.Medium }));

/** Something worked: a gift recorded. */
export const tapSuccess = () =>
  quietly(() => Haptics.notification({ type: NotificationType.Success }));
