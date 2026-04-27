import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "gyeongjo-book",
  brand: {
    displayName: "경조사 가계부",
    primaryColor: "#059669",
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
