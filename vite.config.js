import { defineConfig } from "vite";
import svelte from "@sveltejs/vite-plugin-svelte";
import preprocess from "svelte-preprocess";
import sass from "sass";

export default defineConfig({
  plugins: [
    svelte({
      preprocess: preprocess({
        defaults: { style: "scss" },
        postcss: true,
        sass,
      }),
    }),
  ],
});
