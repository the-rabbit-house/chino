import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import preprocess from "svelte-preprocess";
import sass from "sass";

import path from "path";

const rootDir = path.resolve(__dirname);

export default defineConfig({
  plugins: [
    svelte({
      preprocess: preprocess({
        defaults: { style: "scss" },
        postcss: true,
        sass,
      }),
      onwarn: (warning, handler) => {
        const { code, frame } = warning;
        if (code === "module-script-reactive-declaration")
          return;

        handler(warning);
      },
    }),
  ],
  optimizeDeps: {
    exclude: ["svelte-tags-input"],
  },
  resolve: {
    alias: {
      "@Assets": rootDir + "/src/assets",
      "@Stores": rootDir + "/src/stores",
      "@Components": rootDir + "/src/components",
      "@Views": rootDir + "/src/views",
      "@Events": rootDir + "/src/events",
      "@Utils": rootDir + "/src/utils",
    },
  },
  build: {
    outDir: "docs",
  },
});
