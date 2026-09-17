import UIKit

/// The three top-level destinations, each one a route the web app already
/// serves. Methodology is deliberately absent: it hangs off the About page and
/// the footer, and a fourth tab for it would crowd the bar for a page most
/// readers visit once.
enum RippleTab: Int, CaseIterable {
    case causes
    case plan
    case about

    var path: String {
        switch self {
        case .causes: return "/"
        case .plan: return "/plan"
        case .about: return "/about"
        }
    }

    var title: String {
        switch self {
        case .causes: return "Causes"
        case .plan: return "Plan"
        case .about: return "About"
        }
    }

    var symbolName: String {
        switch self {
        case .causes: return "heart"
        case .plan: return "chart.pie"
        case .about: return "info.circle"
        }
    }

    var selectedSymbolName: String {
        symbolName + ".fill"
    }

    /// Which tab owns a given path. A cause page belongs to Causes, the
    /// thank-you page to Plan, and Methodology to About — so walking into any
    /// of them leaves the bar pointing at where the reader came from rather
    /// than clearing the selection. An unrecognised path returns nil, which
    /// leaves the current tab alone.
    static func owning(path: String) -> RippleTab? {
        if path == "/" || path.hasPrefix("/cause") { return .causes }
        if path.hasPrefix("/plan") || path.hasPrefix("/thanks") { return .plan }
        if path.hasPrefix("/about") || path.hasPrefix("/methodology") { return .about }
        return nil
    }
}

/// A Liquid Glass tab bar over a single WebView.
///
/// Capacitor runs one bridge, and so one WebView, per app — the three tabs are
/// therefore not three view controllers with three copies of the site inside
/// them. They are empty placeholders that exist to give the bar its items, and
/// the WebView spans the whole screen above them. Selecting a tab routes the
/// web app rather than swapping the content view.
///
/// The bar itself is stock `UITabBarController`, which is the point: built
/// against the iOS 26 SDK it picks up Liquid Glass, the scroll edge effect and
/// the minimize behaviour from the system, none of which a WebView can imitate
/// from the inside. On anything older it falls back to an ordinary tab bar.
final class RippleTabBarController: UITabBarController {

    private let bridgeViewController = TabbedBridgeViewController()

    /// The last path the web app reported, used to tell a tab switch apart
    /// from a second tap on the tab already showing.
    private var currentPath = RippleTab.causes.path

    /// The tallest the tab bar has been. It shrinks as it minimizes on scroll,
    /// and insetting the WebView by a moving number would shift the page under
    /// the reader's thumb, so the clearance is pinned to the expanded height.
    private var tabBarClearance: CGFloat = 0

    override func viewDidLoad() {
        super.viewDidLoad()

        delegate = self
        viewControllers = RippleTab.allCases.map(makePlaceholder)

        // Shows in the status bar strip above the WebView, so it matches the
        // site header that sits directly under it (--gray-50, #f8fafc) rather
        // than flashing a system colour between the two.
        view.backgroundColor = UIColor(red: 0.973, green: 0.980, blue: 0.988, alpha: 1)

        if #available(iOS 26.0, *) {
            // The bar gets out of the way on the long scroll down a cause page
            // and comes back the moment the reader heads back up.
            tabBarMinimizeBehavior = .onScrollDown
        }

        installBridge()
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()

        raiseTabBar()

        // The bar's height already covers the home indicator, and so does the
        // WebView's own safe area — only the difference is new occlusion.
        let homeIndicator = view.window?.safeAreaInsets.bottom ?? 0
        let clearance = max(0, tabBar.frame.height - homeIndicator)

        guard clearance > tabBarClearance else { return }
        tabBarClearance = clearance
        bridgeViewController.additionalSafeAreaInsets.bottom = clearance
    }

    /// Keeps the glass on top of the page.
    ///
    /// Inserting the WebView below the bar once, in `viewDidLoad`, is not
    /// enough: the floating bar is rebuilt and re-added during layout, which
    /// drops it behind a subview that was added after it. The bar also sits
    /// inside a container of its own rather than directly in this view, so
    /// what gets raised is whichever ancestor of it we own.
    private func raiseTabBar() {
        var topmost: UIView = tabBar
        while let parent = topmost.superview, parent !== view {
            topmost = parent
        }

        guard topmost.superview === view else { return }
        view.bringSubviewToFront(topmost)
    }

    // The WebView is the only thing on screen with an opinion about either.
    override var childForStatusBarStyle: UIViewController? { bridgeViewController }
    override var childForStatusBarHidden: UIViewController? { bridgeViewController }

    /// A tab needs a view controller to hang its item off. This one never
    /// shows anything, because the WebView covers it.
    private func makePlaceholder(for tab: RippleTab) -> UIViewController {
        let placeholder = UIViewController()
        placeholder.view.backgroundColor = .clear
        placeholder.tabBarItem = UITabBarItem(
            title: tab.title,
            image: UIImage(systemName: tab.symbolName),
            selectedImage: UIImage(systemName: tab.selectedSymbolName)
        )
        return placeholder
    }

    private func installBridge() {
        addChild(bridgeViewController)

        let webHost = bridgeViewController.view!
        webHost.translatesAutoresizingMaskIntoConstraints = false
        // Above the placeholders, so it takes the touches they would otherwise
        // swallow, and below the bar, so the glass has something to refract.
        view.insertSubview(webHost, belowSubview: tabBar)
        NSLayoutConstraint.activate([
            // The page stops at the safe area rather than running under the
            // status bar. Edge to edge is the better look and it is the web
            // app's call to make: its header is `position: sticky; top: 0`,
            // which pins to the viewport and would sit under the Dynamic
            // Island however the WebView is inset. That wants `viewport-fit=
            // cover` and an `env(safe-area-inset-top)` pad in the site's CSS.
            webHost.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            // The bottom stays full bleed, so the page scrolls under the glass.
            webHost.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            webHost.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webHost.trailingAnchor.constraint(equalTo: view.trailingAnchor)
        ])

        bridgeViewController.didMove(toParent: self)
        bridgeViewController.onRouteChange = { [weak self] path in
            self?.syncSelection(to: path)
        }

        // The glass reacts to the content passing behind it, and the minimize
        // behaviour needs something to watch. Neither can find the WebView's
        // scroll view on its own, because it belongs to a child that is never
        // the selected tab, so each placeholder is pointed at it explicitly.
        if let scrollView = bridgeViewController.webView?.scrollView {
            viewControllers?.forEach { $0.setContentScrollView(scrollView, for: .all) }
        }
    }

    /// Keeps the bar pointing at whatever the web app is actually showing,
    /// including the routes it reaches on its own: a cause card, the thank-you
    /// page after a gift, the Methodology link at the foot of About.
    private func syncSelection(to path: String) {
        currentPath = path

        guard let tab = RippleTab.owning(path: path),
              selectedIndex != tab.rawValue
        else { return }

        // Setting this directly doesn't call the delegate below, so the tab
        // bar follows the web app without steering it back.
        selectedIndex = tab.rawValue
    }
}

extension RippleTabBarController: UITabBarControllerDelegate {

    func tabBarController(
        _ tabBarController: UITabBarController,
        didSelect viewController: UIViewController
    ) {
        guard let tab = RippleTab(rawValue: selectedIndex) else { return }

        // Tapping the tab you are already on goes back to the top of it, and
        // from a cause page back out to the grid — the pop-to-root every other
        // tab bar on the phone does.
        if currentPath == tab.path {
            bridgeViewController.scrollToTop()
        } else {
            bridgeViewController.navigate(to: tab.path)
        }
    }
}
