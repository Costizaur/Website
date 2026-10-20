// Phone helpers for the game controllers.
//  1. No zooming. iOS ignores user-scalable=no, so pinch and double-tap are blocked here.
//  2. iPhone "fullscreen". Safari can't hide its bars on request, but in landscape it shrinks them when
//     the page scrolls, so we give the page room to scroll and ask for one swipe up (same script as Muster).
//     If the bars don't shrink after two tries, we suggest Add to Home Screen, which opens with no bars at all.
// Pages keep their UI inside a fixed .app container, so the extra scroll room is never visible.
(function () {
    // ---------- 1. No zoom ----------
    const stop = (e) => e.preventDefault();
    document.addEventListener('gesturestart', stop, { passive: false });
    document.addEventListener('gesturechange', stop, { passive: false });
    document.addEventListener('touchmove', (e) => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
        const now = Date.now();
        const typing = e.target.closest && e.target.closest('input, textarea');
        if (!typing && now - lastTouchEnd < 300) e.preventDefault(); // second tap of a double-tap
        lastTouchEnd = now;
    }, { passive: false });

    // ---------- 2. iPhone swipe-up fullscreen ----------
    if (!/iPhone|iPod/.test(navigator.userAgent) || navigator.standalone) return;

    // The controllers set touch-action: none and overscroll-behavior: none on body. touch-action carries down to
    // every child, so the swipe could never scroll the page and Safari never shrank its bars. The game UI sits in
    // .app, which keeps its own touch-action: none, so only the overlay and the room below it can scroll.
    const css = `
        html.ios-swipe, html.ios-swipe body { overflow: visible !important; height: auto !important;
            touch-action: auto !important; overscroll-behavior: auto !important; }
        html.ios-swipe body { min-height: calc(100vh + 400px) !important; }
        #swipe-up { position: fixed; inset: 0; z-index: 1000; display: none; flex-direction: column; align-items: center;
            justify-content: center; gap: 14px; padding: 24px; text-align: center; touch-action: auto;
            background: rgba(0, 0, 0, 0.97); color: #fff; font-family: inherit; }
        #swipe-up .hand { font-size: 46px; animation: swipeHand 1.4s ease-in-out infinite; }
        #swipe-up .title { font-size: 20px; font-weight: 800; color: var(--pc, #ffc53d); line-height: 1.3; }
        #swipe-up .sub { font-size: 13px; opacity: 0.75; line-height: 1.5; max-width: 280px; }
        #swipe-up button { margin-top: 8px; padding: 10px 16px; border-radius: 12px; border: 2px solid rgba(255,255,255,0.3);
            background: transparent; color: #fff; font: inherit; font-size: 13px; }
        #ios-tip { position: fixed; left: 12px; right: 12px; bottom: calc(12px + env(safe-area-inset-bottom)); z-index: 1001;
            display: none; gap: 10px; align-items: center; padding: 12px 14px; border-radius: 14px;
            background: rgba(20, 20, 20, 0.95); color: #fff; font-size: 12px; line-height: 1.5; }
        #ios-tip b { color: var(--pc, #ffc53d); }
        #ios-tip button { border: 0; background: none; color: #aaa; font-size: 18px; }
        @keyframes swipeHand { 0% { transform: translateY(26px); opacity: 0; } 30% { opacity: 1; }
            70% { transform: translateY(-26px); opacity: 1; } 100% { transform: translateY(-26px); opacity: 0; } }`;

    const start = () => {
        if (document.body.hasAttribute('data-no-swipe')) return; // e.g. pages with a text field
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);

        const overlay = document.createElement('div');
        overlay.id = 'swipe-up';
        overlay.innerHTML = '<div class="hand">☝️</div><div class="title">Swipe up to go fullscreen</div>' +
            '<div class="sub">Safari hides its address bar and tabs when you swipe up on this screen.</div>' +
            '<button type="button">Continue without fullscreen</button>';
        const tip = document.createElement('div');
        tip.id = 'ios-tip';
        tip.innerHTML = '<span>For true fullscreen: tap <b>Share</b> → <b>Add to Home Screen</b>, then open it from your home screen.</span><button type="button" aria-label="Close">✕</button>';
        document.body.appendChild(overlay);
        document.body.appendChild(tip);
        document.documentElement.classList.add('ios-swipe');

        let dismissed = false;
        let failedTries = 0;
        let check = null;
        let barsHeight = null; // the smallest landscape height seen, i.e. with Safari's bars showing

        const landscape = () => innerWidth > innerHeight;
        const barsHidden = () => barsHeight !== null && innerHeight > barsHeight + 30;

        const update = () => {
            if (!landscape()) { overlay.style.display = 'none'; return; }
            if (barsHeight === null || innerHeight < barsHeight) barsHeight = innerHeight;
            overlay.style.display = dismissed || barsHidden() ? 'none' : 'flex';
        };

        const showTip = () => {
            tip.style.display = 'flex';
            setTimeout(() => { tip.style.display = 'none'; }, 12000);
        };

        overlay.querySelector('button').addEventListener('click', () => { dismissed = true; update(); });
        tip.querySelector('button').addEventListener('click', () => { tip.style.display = 'none'; });

        // After a swipe, give Safari a moment to animate its bars away, then see whether it worked
        addEventListener('touchend', () => {
            if (dismissed || overlay.style.display === 'none') return;
            clearTimeout(check);
            check = setTimeout(() => {
                update();
                if (barsHidden() || !landscape()) return;
                if (++failedTries >= 2) { dismissed = true; update(); showTip(); }
            }, 900);
        }, { passive: true });

        addEventListener('resize', update);
        addEventListener('scroll', update, { passive: true });
        update();
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
})();
