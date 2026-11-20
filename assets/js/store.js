// Safe Browser Storage
(function () {
  const wrap = name => {
    const area = () => window[name];
    return {
      get(key, fallback) {
        try {
          const saved = area().getItem(key);
          return saved === null ? fallback : JSON.parse(saved);
        } catch (e) { return fallback; }
      },
      set(key, value) { try { area().setItem(key, JSON.stringify(value)); } catch (e) {} },
      remove(key) { try { area().removeItem(key); } catch (e) {} },
      keys() { try { return Object.keys(area()); } catch (e) { return []; } }
    };
  };

  window.SiteStore = { local: wrap('localStorage'), session: wrap('sessionStorage') };
})();
