import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "card-funeral",
  brand: {
    displayName: "내 카드 장례식",
    primaryColor: "#1F2937",
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
