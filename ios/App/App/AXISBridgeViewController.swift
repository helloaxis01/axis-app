import UIKit
import Capacitor

/// Disables WKWebView rubber-banding so fixed headers (dashboard + session chrome) do not stretch on pull-down.
class AXISBridgeViewController: CAPBridgeViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        axisDisableWebViewBounce()
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        axisDisableWebViewBounce()
        axisEnsureWebShellVisible()
    }

    /// If JS boot stalls, hide the native splash and surface load errors instead of a blank screen.
    private func axisEnsureWebShellVisible() {
        let hideSplash = """
        (function () {
          try {
            if (window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.SplashScreen) {
              Capacitor.Plugins.SplashScreen.hide();
            }
          } catch (e) {}
        })();
        """
        let bootWatchdog = """
        (function () {
          try {
            var root = document.getElementById('root');
            if (root && root.children.length > 0) return;
            if (typeof showLoadErr === 'function') {
              showLoadErr('AXIS did not start within 6s. Attach Safari Web Inspector (Develop → your iPhone) and check the console.');
            }
            if (window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.SplashScreen) {
              Capacitor.Plugins.SplashScreen.hide();
            }
          } catch (e) {}
        })();
        """
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) { [weak self] in
            self?.bridge?.webView?.evaluateJavaScript(hideSplash, completionHandler: nil)
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 6.0) { [weak self] in
            self?.bridge?.webView?.evaluateJavaScript(bootWatchdog, completionHandler: nil)
        }
    }

    private func axisDisableWebViewBounce() {
        guard let scrollView = webView?.scrollView else { return }
        scrollView.bounces = false
        scrollView.alwaysBounceVertical = false
        scrollView.alwaysBounceHorizontal = false
    }
}
