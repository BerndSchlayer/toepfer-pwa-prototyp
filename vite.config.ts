import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/toepfer-pwa-prototyp/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "*.pdf"],
      manifest: {
        name: "Toepfer PWA Prototyp",
        short_name: "ToepferPWA",
        description: "Prototyp einer PWA für einen Kunden",
        theme_color: "#ffffff",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-256x256.png",
            sizes: "256x256",
            type: "image/png",
          },
          {
            src: "pwa-384x384.png",
            sizes: "384x384",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "pwa-180x180.png",
            sizes: "180x180",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
