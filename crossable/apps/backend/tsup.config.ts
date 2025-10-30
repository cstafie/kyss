import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/main.ts"],
  format: ["cjs"],
  external: ["shared", "socket.io"],
  target: "node16",
  outDir: "dist",
  sourcemap: true,
  shims: true,
  clean: true,
  minify: true, // minify for production
  splitting: false,
  dts: true,
  // onSuccess: "npm run copy-assets",
});
