import { StaticRouter } from "react-router-dom/server";
import { renderToString } from "react-dom/server";
import { AppRoutes } from "./App.jsx";
import { charities } from "./data/charities.js";

/**
 * Prerender entry. Runs in Node at build time, once per route.
 *
 * Nothing here hydrates: the client mounts with createRoot and replaces this
 * markup wholesale. That is deliberate. The prerendered HTML exists for
 * crawlers, link scrapers and the first paint — not as a hydration target — so
 * it can never produce a hydration mismatch, and components stay free to read
 * the browser in effects without a server-safe twin.
 */
export function render(url) {
  return renderToString(
    <StaticRouter location={url}>
      <AppRoutes />
    </StaticRouter>,
  );
}

export { charities };
