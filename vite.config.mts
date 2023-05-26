import path from "path";

import { svelte } from "@sveltejs/vite-plugin-svelte";
import sveltePreprocess from "svelte-preprocess";
import { viteExternalsPlugin } from "vite-plugin-externals";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    viteExternalsPlugin({
      obsidian: "obsidian",
    }),
    svelte({
      hot: !process.env.VITEST,
      preprocess: [sveltePreprocess()],
    }) as any,
  ],
  resolve: {
    alias: {
      lib: path.resolve("./lib"),
    },
  },
  test: {
    deps: {
      external: ["obsidian"],
      inline: ["moment"],
    },
    environment: "jsdom",
    globals: true,
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  },
});
