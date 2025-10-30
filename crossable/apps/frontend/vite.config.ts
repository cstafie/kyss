import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    // Vite only exposes vars prefixed with VITE_
    define: {
      "import.meta.env.VITE_SERVER_URL": JSON.stringify(env.VITE_SERVER_URL),
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    optimizeDeps: {
      include: ["shared"],
    },
    build: {
      // minify: false,
      // sourcemap: true,
      commonjsOptions: {
        include: [/shared/, /node_modules/],
      },
    },
  };
});
