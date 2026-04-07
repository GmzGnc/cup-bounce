package com.cupbounce.game;

import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    /**
     * Ensures the WebView's JS engine and timers resume fully when the app
     * returns to the foreground.  Some OEM builds throttle the WebView before
     * the JS visibilitychange event fires, so calling these methods explicitly
     * guarantees the Phaser RAF loop and AudioContext start on time.
     */
    @Override
    public void onResume() {
        super.onResume();
        WebView wv = getBridge().getWebView();
        if (wv != null) {
            wv.onResume();
            wv.resumeTimers();   // restores JS timers (setInterval / setTimeout)
            // Dispatch a focus event so JS listeners (AppLifecycleManager) fire
            // even on OEM builds where visibilitychange is delayed.
            wv.evaluateJavascript("javascript:window.dispatchEvent(new Event('focus'))", null);
        }
    }

    /**
     * Allows Android to throttle/stop the WebView while in background.
     * We do NOT call wv.pauseTimers() here because it freezes ALL WebView
     * timers globally (including localStorage saves), which can corrupt state.
     * Phaser's game.pause() + AudioContext.suspend() are handled in JS instead.
     */
    @Override
    public void onPause() {
        super.onPause();
        WebView wv = getBridge().getWebView();
        if (wv != null) {
            wv.onPause();
        }
    }
}
