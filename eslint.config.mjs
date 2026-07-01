import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // This app is a client-side SPA over localStorage: many components read
    // browser-only state (library, preferences, theme, sessions) in a mount
    // effect gated by a `mounted` flag — the standard hydration-safe Next.js
    // pattern — and drive countdown timers with setState. React Compiler's
    // `set-state-in-effect` rule flags all of these as false positives (the
    // pattern is correct and, for editable fields, useSyncExternalStore doesn't
    // apply). Disabled intentionally; prefer useSyncExternalStore for any NEW
    // read-only external store reads. The `purity` rule stays on — it catches
    // real hydration bugs.
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
