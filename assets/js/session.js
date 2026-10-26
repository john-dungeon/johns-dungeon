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

  const minutes = Number(CONFIG.timeout);
  if (!(minutes > 0)) {
    console.warn('session.js: "timeout" in _data/session.yml is missing or not a positive number, so visits never expire.');
  }

  const lastSeen = Number(read(LAST_SEEN));
  const expired = !lastSeen || (minutes > 0 && Date.now() - lastSeen > minutes * 60000);
  if (expired) {
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
