import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages serves a project repo from https://<user>.github.io/<repo>/, so
// every asset URL needs that prefix baked in at build time.
//
//   • Deploying to a project page (github.io/ripple)? Leave BASE as "/ripple/"
//     and rename it if your repo is called something else.
//   • Deploying to a custom domain (ripplegood.org) or a <user>.github.io repo?
//     Set BASE to "/" — a subpath prefix would break every asset.
//
// In CI this is set for you: .github/workflows/deploy.yml derives it from the
// repo name (and uses "/" when public/CNAME exists), so the deployed site is
// correct wherever it lands without anyone editing this file.
// The constant below only matters for local builds.
const BASE = process.env.SITE_BASE || "/ripple/";

export default defineConfig({
  base: BASE,
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // React and lucide change only when the dependency does, so a copy edit
        // ships without pushing them out of a returning visitor's cache.
        manualChunks(id) {
          if (id.includes("/node_modules/")) return "vendor";
        },
      },
    },
  },
});
