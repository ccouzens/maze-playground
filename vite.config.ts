import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        renderingPlayground: resolve(__dirname, "rendering-playground.html"),
      },
    },
  },
});
