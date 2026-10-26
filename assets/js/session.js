(function () {
  const CONFIG = window.SITE_SESSION || {};
  const root = document.documentElement;
  const LAST_SEEN = 'last-seen';
  const GATE_PASSED = 'gate-passed';
  const HEARTBEAT = 15000;

  try {
    localStorage.setItem('probe', '1');
    localStorage.removeItem('probe');
  } catch (e) { return; }

  const read = key => localStorage.getItem(key);
  const write = (key, value) => localStorage.setItem(key, value);
  const forget = key => localStorage.removeItem(key);

  const lastSeen = Number(read(LAST_SEEN));
  if (!lastSeen || Date.now() - lastSeen > CONFIG.timeout * 60000) {
    [...(CONFIG.reset || []), GATE_PASSED, 'music-state'].forEach(forget);
  }

  const beat = () => write(LAST_SEEN, Date.now());
  beat();
  setInterval(beat, HEARTBEAT);
  addEventListener('pagehide', beat);

  if (CONFIG.gate && read(GATE_PASSED) !== 'true') {
    root.dataset.gate = 'pending';
    setTimeout(() => root.setAttribute('data-gate-late', ''), 5000);
  }
})();
