import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Lock } from "lucide-react";
import Logo from "./Logo.jsx";
import Wallpaper from "./Wallpaper.jsx";

function Header() {
  return (
    <header className="siteHeader">
      <div className="wrap siteHeader__inner">
        <Link to="/" aria-label="Ripple Good — home">
          {/* The header mounts once per page load, so the heart eases in on
              arrival and then stays put — not on every route change. */}
          <Logo size="sm" animate />
        </Link>

        <nav className="siteNav" aria-label="Main">
          <NavLink
            to="/methodology"
            className={({ isActive }) =>
              `siteNav__link${isActive ? " is-active" : ""}`
            }
          >
            Methodology
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `siteNav__link${isActive ? " is-active" : ""}`
            }
          >
            About
          </NavLink>
          {/* Not "see your impact" — that phrase belongs to /my-impact, which
              is a different thing entirely. */}
          <Link to="/#causes" className="btn btn--navy siteNav__cta">
            Pick your cause
          </Link>
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
              We never handle your money. You give on the charity's own site, or
              through Every.org — a nonprofit that passes donations on. We take no
              cut and never see the transaction.
            </span>
          </p>
        </div>

        <nav className="footerNav" aria-label="Footer">
          <h4>The site</h4>
          <Link to="/#causes">Pick your cause</Link>
          <Link to="/quiz">Find your cause</Link>
          <Link to="/honor">Give in someone's name</Link>
          <Link to="/my-impact">Your impact</Link>
          <Link to="/methodology">Methodology</Link>
          <Link to="/about">About Ripple</Link>
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
            href="https://www.givinggreen.earth/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Giving Green
          </a>
        </nav>
      </div>

      <div className="wrap siteFooter__legal">
        <span>© {new Date().getFullYear()} Ripple Good</span>
        <span className="xsep" aria-hidden="true" />
        <span>We aggregate published research — we don't originate it.</span>
        <span className="xsep" aria-hidden="true" />
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
      <Wallpaper />
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
