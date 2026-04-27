import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "coin-saver",
  brand: {
    displayName: "오늘의 환승 동전",
    primaryColor: "#F59E0B",
    icon: "",
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite dev",
      build: "vite build",
    },
  },
  permissions: [],
  outdir: "dist",
});
