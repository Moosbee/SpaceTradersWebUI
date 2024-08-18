import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
  return {
    plugins: [react()],
    base: command === "serve" ? "/" : "/SpaceTradersWebUI/",
    server: {
      open: true,
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
