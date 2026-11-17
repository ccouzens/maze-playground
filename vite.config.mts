import { dirname, resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  base: "",
  build: {
    sourcemap: true,
    assetsInlineLimit: 0,
    rolldownOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        nested: resolve(import.meta.dirname, "rendering-playground.html"),
      },
    },
  },
});
