import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Lock } from "lucide-react";
import Logo from "./Logo.jsx";

function Header() {
  return (
    <header className="siteHeader">
      <div className="wrap siteHeader__inner">
        <Link to="/" className="siteHeader__brand" aria-label="Ripple Good, home">
          {/* The header mounts once per page load, so the heart eases in on
              arrival and then stays put — not on every route change. */}
          <Logo size="sm" animate />
        </Link>

        {/* One row at every width: the wordmark on the left, the links on
            the right, with the second one dropping out on a phone. */}
        <nav className="siteNav" aria-label="Main">
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `siteNav__link${isActive ? " is-active" : ""}`
            }
          >
            About
          </NavLink>
          {/* Hidden on a phone, where the header is the wordmark and one
              link. Methodology is in the footer, which every page ends
              with, and on the About page it links to. */}
          <NavLink
            to="/methodology"
            className={({ isActive }) =>
              `siteNav__link siteNav__link--secondary${isActive ? " is-active" : ""}`
            }
          >
            Methodology
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="siteFooter onDark">
      <div className="wrap siteFooter__main">
        <div>
          <Logo onDark />
          <p className="siteFooter__tagline">
            Don't just donate.{" "}
            <span className="mark mark--onDark">Make the biggest ripple.</span>
          </p>
          <p className="siteFooter__money">
            <Lock size={17} aria-hidden="true" />
            <span>
              We never handle your money, and take no cut of any gift. Giving
              happens on the charity's own site or through Every.org.
            </span>
          </p>
        </div>

        <nav className="footerNav" aria-label="Footer">
          <h4>The site</h4>
          <Link to="/#causes">Pick your cause</Link>
          <Link to="/methodology">Methodology</Link>
          <Link to="/about">About Ripple Good</Link>
          <a href="https://www.givewell.org/" target="_blank" rel="noopener noreferrer">
            GiveWell
          </a>
          <a
            href="https://animalcharityevaluators.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Animal Charity Evaluators
          </a>
          <a
            href="https://www.happierlivesinstitute.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Happier Lives Institute
          </a>
          <a href="https://www.founderspledge.com/" target="_blank" rel="noopener noreferrer">
            Founders Pledge
          </a>
        </nav>
      </div>

      <div className="wrap siteFooter__legal">
        <span>© {new Date().getFullYear()} Ripple Good™</span>
        <span>We aggregate published research; we don't originate it.</span>
        <span>All figures are average program costs.</span>
      </div>
    </footer>
  );
}

export default function Layout() {
  // Keyed by pathname so each page replays its entrance. Deliberately not the
  // full location: a hash-only change is a jump within the page you're already
  // reading, and re-animating it would be motion for nothing.
  const { pathname } = useLocation();

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main" className="pageEnter" key={pathname}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
