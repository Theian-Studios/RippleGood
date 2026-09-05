import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import About from "./pages/About.jsx";
import Cause from "./pages/Cause.jsx";
import Home from "./pages/Home.jsx";
import Inside from "./pages/Inside.jsx";
import Methodology from "./pages/Methodology.jsx";
import NotFound from "./pages/NotFound.jsx";
import Split from "./pages/Split.jsx";
import Thanks from "./pages/Thanks.jsx";

/**
 * The route table, with no router around it, so the same tree can be mounted
 * under a BrowserRouter in the browser and a StaticRouter during prerender.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="cause/:causeId" element={<Cause />} />
        <Route path="plan" element={<Split />} />
        <Route path="thanks" element={<Thanks />} />
        <Route path="methodology" element={<Methodology />} />
        <Route path="about" element={<About />} />
        {/* Not linked from anywhere, not prerendered, not in any sitemap.
            See pages/Inside.jsx for what the passcode on it is worth. */}
        <Route path="inside" element={<Inside />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

/**
 * Real paths, not a hash.
 *
 * This was a HashRouter, because GitHub Pages has no rewrite rule and a hard
 * refresh on /cause/climate would 404. The cost was that the server never saw
 * the route at all: every URL returned the same empty shell with the same
 * default meta tags, so a link scraper building a preview card for a cause page
 * got the generic one, and per-page titles set in JavaScript were invisible to
 * anything that doesn't run it.
 *
 * The build now writes a real index.html for every route (scripts/prerender.mjs),
 * which is what makes BrowserRouter safe here: GitHub Pages serves those files
 * directly, and 404.html only ever handles genuinely unknown paths.
 */
export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ScrollToTop />
      <AppRoutes />
    </BrowserRouter>
  );
}
