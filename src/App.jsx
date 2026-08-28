import { HashRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import About from "./pages/About.jsx";
import Cause from "./pages/Cause.jsx";
import Home from "./pages/Home.jsx";
import Methodology from "./pages/Methodology.jsx";
import NotFound from "./pages/NotFound.jsx";
import Split from "./pages/Split.jsx";
import Thanks from "./pages/Thanks.jsx";

/**
 * HashRouter, not BrowserRouter: GitHub Pages serves static files and has no
 * rewrite rule, so a hard refresh on /cause/climate would 404. The hash keeps
 * every route on index.html.
 */
export default function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="cause/:causeId" element={<Cause />} />
          <Route path="plan" element={<Split />} />
          <Route path="thanks" element={<Thanks />} />
          <Route path="methodology" element={<Methodology />} />
          <Route path="about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
