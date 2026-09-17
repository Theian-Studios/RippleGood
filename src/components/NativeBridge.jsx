import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { App as CapApp } from "@capacitor/app";
import { LocalNotifications } from "@capacitor/local-notifications";
import { APP_SCHEME, closeCheckout, isNative } from "../lib/native.js";
import { refreshReminders } from "../lib/reminders.js";

/**
 * A link from outside, as a route inside the app.
 *
 *   https://ripple-good.org/cause/climate?ref=x   → /cause/climate?ref=x
 *   https://ripple-good.org/share/climate         → /cause/climate
 *   ripplegood://thanks?cause=climate&amount=30   → /thanks?cause=climate&amount=30
 *
 * A custom-scheme URL parses with the first segment as its host, so that goes
 * back on the front of the path. /share/<id> exists only so link scrapers get a
 * per-cause preview card; on the site it redirects to the cause page, and here
 * it goes there directly.
 */
export function routeFor(href) {
  let url;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  const path =
    url.protocol === `${APP_SCHEME}:`
      ? `/${url.host}${url.pathname === "/" ? "" : url.pathname}`
      : url.pathname;
  const share = path.match(/^\/share\/([^/]+)\/?$/);
  const route = share ? `/cause/${share[1]}` : path;
  url.searchParams.delete("app");
  const query = url.searchParams.toString();
  return `${route}${query ? `?${query}` : ""}`;
}

/**
 * Inside the app: turns Universal Links, the ripplegood:// return from
 * checkout, and taps on a reminder into navigation. Mounted once, inside the
 * router.
 */
function InApp() {
  // React Router hands out a new navigate() on every route change. Depending on
  // it here re-ran this effect each time: listeners torn down and re-added
  // across an async gap a link could fall into, and the reminders re-laid on
  // every page — racing a reader switching them off. A ref keeps it to once.
  const navigateRef = useRef(null);
  navigateRef.current = useNavigate();

  useEffect(() => {
    const navigate = (to) => navigateRef.current(to);
    refreshReminders();

    const subs = [
      // Capacitor holds a launch URL until the first listener attaches, so
      // this also catches the link that cold-started the app.
      CapApp.addListener("appUrlOpen", ({ url }) => {
        const route = routeFor(url);
        if (!route) return;
        closeCheckout();
        navigate(route);
      }),
      LocalNotifications.addListener("localNotificationActionPerformed", ({ notification }) => {
        const path = notification?.extra?.path;
        if (typeof path === "string" && path.startsWith("/")) navigate(path);
      }),
    ];
    return () => subs.forEach((p) => p.then((s) => s.remove()).catch(() => {}));
  }, []);

  return null;
}

/**
 * On the website: a page reached with ?app=1 is Every.org sending back a donor
 * who started in the app. Opening ripplegood:// hands them back to it — in the
 * checkout sheet iOS asks "Open in Ripple Good?" first — and the button is
 * there for anyone who dismissed that, or whose app has since been deleted and
 * who can just carry on reading the site.
 */
function Handoff() {
  const location = useLocation();
  const [target, setTarget] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("app") !== "1") return setTarget(null);
    params.delete("app");
    const query = params.toString();
    const href = `${APP_SCHEME}:/${location.pathname}${query ? `?${query}` : ""}`;
    setTarget(href);
    window.location.href = href;
  }, [location.pathname, location.search]);

  if (!target) return null;
  return (
    <div className="appHandoff" role="status">
      <span>Finish up in the Ripple Good app.</span>
      <a className="btn btn--primary appHandoff__btn" href={target}>
        Open the app
      </a>
    </div>
  );
}

export default function NativeBridge() {
  // Decided once: the platform can't change under a mounted page.
  const [native] = useState(isNative);
  return native ? <InApp /> : <Handoff />;
}
