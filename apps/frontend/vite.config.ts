/// <reference types="vitest" />
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), {
    name: "mentora-offline-assets",
    apply: "build",
    generateBundle(_options, bundle) {
      const assets = JSON.stringify(Object.keys(bundle).filter((name) => name.startsWith("assets/")).sort().map((name) => "/" + name));
      const revision = createHash("sha256").update(assets).digest("hex").slice(0, 12);
      const worker = readFileSync(new URL("./public/sw.js", import.meta.url), "utf8");
      this.emitFile({ type: "asset", fileName: "offline-assets.json", source: assets });
      this.emitFile({ type: "asset", fileName: "sw.js", source: worker.replace("mentora-shell-v3", "mentora-shell-v3-" + revision) });
    },
  }],
  preview: {
    proxy: {
      "/api": "http://localhost:3001",
      "/health": "http://localhost:3001",
      "/metrics": "http://localhost:3001"
    }
  },
  server: {
    proxy: {
      "/api": "http://localhost:3001",
      "/health": "http://localhost:3001",
      "/metrics": "http://localhost:3001"
    }
  }
});
