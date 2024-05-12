import { resolve } from "path";
import { defineConfig } from "vite";
import UnpluginInjectPreload from 'unplugin-inject-preload/vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        renderingPlayground: resolve(__dirname, "rendering-playground.html"),
      },
    },
  },
  plugins: [
    UnpluginInjectPreload({
      files: [
        {outputMatch: /computer.*\.wasm.*$/, attributes: { as: 'fetch'}},
        {outputMatch: /\.glsl.*$/, attributes: { as: 'fetch'}},
        {outputMatch: /\.wgsl.*$/, attributes: { as: 'fetch'}},
      ]
    })
  ]
});
