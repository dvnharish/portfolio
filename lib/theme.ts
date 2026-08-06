export type Theme = 'light' | 'dark'

export const DEFAULT_THEME: Theme = 'light'

export const THEME_STORAGE_KEY = 'hd-theme'

/**
 * Inlined in <head> before first paint so the stored theme is applied before
 * the browser renders anything. Without this a dark-theme visitor gets a white
 * flash on every navigation.
 *
 * Kept as a string (not an imported function) because it must run standalone,
 * before React or any bundle has loaded.
 */
export const THEME_INIT_SCRIPT = `
(function(){
  try {
    var stored = localStorage.getItem('${THEME_STORAGE_KEY}');
    var theme = stored === 'dark' || stored === 'light' ? stored : '${DEFAULT_THEME}';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', '${DEFAULT_THEME}');
  }
})();
`.trim()
