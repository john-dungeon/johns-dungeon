(function () {
  const CONFIG = window.SITE_SESSION || {};
  const root = document.documentElement;
  const store = SiteStore.local;
  const LAST_SEEN = 'last-seen';
  const GATE_PASSED = 'gate-passed';
  const EFFECT_TIMERS = 'effect-timers';
  const HEARTBEAT = 15000;

  try {
    localStorage.setItem('probe', '1');
    localStorage.removeItem('probe');
  } catch (e) { return; }

  const minutes = Number(CONFIG.timeout);
  if (!(minutes > 0)) {
    console.warn('session.js: "timeout" in _data/session.yml is missing or not a positive number, so visits never expire.');
  }

  const lastSeen = store.get(LAST_SEEN, 0);
  const expired = !lastSeen || (minutes > 0 && Date.now() - lastSeen > minutes * 60000);
  if (expired) {
    [...(CONFIG.reset || []), GATE_PASSED, 'music-state', EFFECT_TIMERS].forEach(key => store.remove(key));
  }

  const beat = () => store.set(LAST_SEEN, Date.now());
  beat();
  setInterval(beat, HEARTBEAT);
  addEventListener('pagehide', beat);

  if (CONFIG.gate && store.get(GATE_PASSED, false) !== true) {
    root.dataset.gate = 'pending';
    setTimeout(() => root.setAttribute('data-gate-late', ''), 5000);

    document.addEventListener('DOMContentLoaded', () => {
      if (document.getElementById('gate')) return;
      console.warn('session.js: the entrance screen is on, but this page has no #gate element. Is gate.html included in footer_custom.html?');
      delete root.dataset.gate;
    });
  }
})();
