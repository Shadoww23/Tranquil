// Minimal ambient typing for the small slice of the Chrome/Edge extension API
// we use (promise-style storage). Avoids depending on the full @types/chrome
// package just for two calls. Extend here if the extension starts using more.
declare namespace chrome.storage {
  interface StorageArea {
    get(keys: string | string[]): Promise<Record<string, unknown>>;
    set(items: Record<string, unknown>): Promise<void>;
  }
  const local: StorageArea;
}
