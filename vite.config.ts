import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { NIGHT } from "./pwa-theme.ts";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 'prompt' not 'autoUpdate': mid-edit text (a new item name typed but
      // not yet saved, a recipe being edited) lives only in React state. A
      // silent auto-reload could wipe it. Updates apply only when the user
      // taps the toast.
      registerType: "prompt",
      // No includeAssets: favicon.ico/icon-master.svg are already matched
      // by globPatterns below (ico/svg) — listing them again here would
      // just duplicate their precache entries. Same reason for
      // includeManifestIcons: false — the manifest.icons entries below are
      // already matched by the png glob.
      includeManifestIcons: false,
      manifest: {
        name: "Meal Log",
        short_name: "Meal Log",
        description: "Grocery list and recipes, together, offline.",
        theme_color: NIGHT,
        background_color: NIGHT,
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Fonts are self-hosted (@fontsource) specifically so they're
        // precached here — the app has no other network dependency.
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
      },
    }),
  ],
  test: {
    globals: true,
    environment: "node",
  },
});
