import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { captureReferral, reportReferralVisit } from "../lib/referral.js";
import { Lock } from "lucide-react";
import Logo from "./Logo.jsx";

/**
 * True once the page's navy hero has scrolled up under the header. Pages
 * without a hero never flip. Re-checked per route, since the header mounts
 * once and the hero comes and goes with the home page.
 */
function usePastHero(headerRef, pathname) {
  const [past, setPast] = useState(false);

  useEffect(() => {
    const hero = document.querySelector(".hero");
    const header = headerRef.current;
    if (!hero || !header || !("IntersectionObserver" in window)) {
      setPast(false);
      return undefined;
    }

    // The root's top edge is pulled down to the header's bottom, so the hero
    // stops "intersecting" exactly as its last pixel passes under the header.
    const io = new IntersectionObserver(
      ([entry]) => setPast(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { rootMargin: `-${header.offsetHeight}px 0px 0px 0px` },
    );
    io.observe(hero);
    return () => io.disconnect();
  }, [headerRef, pathname]);

  return past;
}

function Header() {
  const ref = useRef(null);
  const { pathname } = useLocation();
  const pastHero = usePastHero(ref, pathname);

  return (
    <header ref={ref} className={`siteHeader${pastHero ? " is-pastHero" : ""}`}>
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
  // `pathname` keys the page entrance below; `search` is read for the referral
  // tag. One call, because two useLocation() destructurings in one component
  // is one redeclared name away from a build error.
  const { pathname, search } = useLocation();

  // Reads ?ref= on arrival and on every route after it, so a tag set on the
  // home page survives the walk to a cause page. Storing it is all this does;
  // nothing leaves the browser until a donation link is built.
  useEffect(() => {
    captureReferral(search);
    reportReferralVisit();
  }, [search, pathname]);

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
