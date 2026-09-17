import Capacitor
import UIKit
import WebKit

/// The Capacitor bridge view controller, taught to talk to a native tab bar.
///
/// The web app is not modified for any of this. Everything the tab bar needs
/// to know — and every instruction it sends back — is injected into the
/// WebView from here, so the same `dist/` that deploys to the public site runs
/// unchanged inside the app.
final class TabbedBridgeViewController: CAPBridgeViewController {

    /// Fires with a path ("/plan") whenever the web app's URL changes, however
    /// it changed: a tap on a cause card, a back swipe, or `navigate(to:)`.
    var onRouteChange: ((String) -> Void)?

    private static let routeMessageName = "rippleRoute"

    /// The hook is `webView(with:configuration:)` rather than the more obvious
    /// `webViewConfiguration(for:)`, because Capacitor fits its own bridge
    /// between the two and the content controller that comes out the far end
    /// is not the one that went in. This is the configuration the WKWebView is
    /// actually built from.
    override func webView(
        with frame: CGRect,
        configuration: WKWebViewConfiguration
    ) -> WKWebView {
        configuration.userContentController.addUserScript(
            WKUserScript(
                source: Self.routeObserverSource,
                injectionTime: .atDocumentStart,
                forMainFrameOnly: true
            )
        )
        configuration.userContentController.add(
            RouteMessageProxy(owner: self),
            name: Self.routeMessageName
        )

        return super.webView(with: frame, configuration: configuration)
    }

    /// Moves the web app to `path` the way the browser's forward button would.
    /// Reloading the URL would work too, and would throw away every bit of
    /// state the app is holding and flash the page white, so this pushes a
    /// history entry instead and lets the router pick it up.
    func navigate(to path: String) {
        guard let webView, let literal = Self.jsStringLiteral(path) else { return }
        webView.evaluateJavaScript("window.__rippleNavigate(\(literal));")
    }

    /// Back to the top of the current page, for a second tap on the tab that is
    /// already showing.
    func scrollToTop() {
        guard let scrollView = webView?.scrollView else { return }
        scrollView.setContentOffset(
            CGPoint(x: 0, y: -scrollView.adjustedContentInset.top),
            animated: true
        )
    }

    /// Wraps a Swift string as a JavaScript string literal, quotes and all.
    /// Every path here is one we wrote ourselves, but building JavaScript by
    /// concatenation is the kind of thing that stays correct right up until
    /// someone adds a route with an apostrophe in it.
    private static func jsStringLiteral(_ value: String) -> String? {
        guard let data = try? JSONSerialization.data(withJSONObject: [value]),
              let encoded = String(data: data, encoding: .utf8)
        else { return nil }

        // JSONSerialization needs a container at the top level, so the value
        // comes back as `["/plan"]` and the brackets come off again.
        return String(encoded.dropFirst().dropLast())
    }

    private static let routeObserverSource = """
    (function () {
      "use strict";

      function report() {
        try {
          window.webkit.messageHandlers.\(routeMessageName)
            .postMessage(window.location.pathname);
        } catch (error) {
          /* No handler outside the app, where this script does nothing. */
        }
      }

      // React Router navigates with pushState and replaceState, and neither
      // one fires an event. Wrapping them is the only way to see a route
      // change from out here without touching the app's own code.
      ["pushState", "replaceState"].forEach(function (name) {
        var original = window.history[name];
        window.history[name] = function () {
          var result = original.apply(this, arguments);
          report();
          return result;
        };
      });

      window.addEventListener("popstate", report);

      // Drives the app from a tab tap. The pushed state mirrors the shape the
      // router writes for itself (@remix-run/router's getHistoryState): it
      // reads `idx` back out on every navigation, and a plain {} here would
      // leave it counting from null and break the back/forward delta.
      window.__rippleNavigate = function (path) {
        var current = window.history.state || {};
        var next = typeof current.idx === "number" ? current.idx + 1 : 0;

        window.history.pushState(
          {
            usr: null,
            key: Math.random().toString(36).slice(2, 10),
            idx: next
          },
          "",
          path
        );
        window.dispatchEvent(
          new PopStateEvent("popstate", { state: window.history.state })
        );
      };

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", report);
      } else {
        report();
      }
    })();
    """
}

/// `WKUserContentController` holds its message handlers strongly, and the
/// configuration that owns it belongs to the view controller — so handing it
/// `self` directly would close the loop and strand the whole WebView. This
/// sits in between and holds on weakly.
private final class RouteMessageProxy: NSObject, WKScriptMessageHandler {

    private weak var owner: TabbedBridgeViewController?

    init(owner: TabbedBridgeViewController) {
        self.owner = owner
    }

    func userContentController(
        _ userContentController: WKUserContentController,
        didReceive message: WKScriptMessage
    ) {
        guard let path = message.body as? String else { return }
        owner?.onRouteChange?(path)
    }
}
