import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";
import path from "node:path";

// visualizer schreibt nach build eine dist/stats.html mit Treemap-Chart.
// Nur beim Build aktiv, wird fuer Dev ignoriert.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({
      filename: "dist/stats.html",
      template: "treemap",
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@resources": path.resolve(__dirname, "./resources"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      output: {
        // Split in logische Chunks — reduziert Initial-Bundle-Size durch
        // Browser-Cache-Partitioning. Wenn sich nur App-Code aendert, bleibt
        // der vendor-Chunk cached.
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "icons": ["lucide-react"],
          "genres": ["./src/lib/allGenres"],
        },
      },
    },
  },
});
