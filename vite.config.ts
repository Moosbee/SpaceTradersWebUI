import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
  return {
    plugins: [react()],
    base: command === "serve" ? "/" : "/SpaceTradersWebUI/",
    server: {
      open: false,
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "src/setupTests",
      mockReset: true,
    },
    build: {
      target: "esnext",
    },
  };
});
