import { defineConfig } from "vite";
export default defineConfig({
  base: "./",
  optimizeDeps: {
    esbuildOptions: {
      resolveExtensions: [".web.js", ".js", ".ts", ".tsx", ".json"],
    },
  },
  resolve: {
    alias: { "react-native": "react-native-web" },
    extensions: [
      ".web.tsx",
      ".web.ts",
      ".web.js",
      ".web.jsx",
      ".tsx",
      ".ts",
      ".jsx",
      ".js",
      ".json",
    ],
  },
  build: {
    target: "es2022",
    cssCodeSplit: false,
    rollupOptions: {
      onwarn(warning, warn) {
        if (
          warning.code === "MODULE_LEVEL_DIRECTIVE" &&
          warning.id?.includes("react-native-web") &&
          warning.message.includes("use client")
        )
          return;
        warn(warning);
      },
    },
  },
});
