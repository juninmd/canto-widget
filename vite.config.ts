import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwind()],
  clearScreen: false,
  server: { port: 1420, strictPort: true, watch: { ignored: ["**/src-tauri/**"] } },
  build: { target: "esnext" },
  // The note editor is lazy: without this, dev discovers TipTap on first open and reloads the page mid-use.
  optimizeDeps: {
    include: [
      "@tiptap/core",
      "@tiptap/react",
      "@tiptap/starter-kit",
      "@tiptap/markdown",
      "@tiptap/extension-list",
      "@tiptap/extension-link",
      "@tiptap/extension-hard-break",
      "@tiptap/extensions",
      "@tiptap/pm/state",
      "@tiptap/pm/view",
      "@tiptap/pm/model",
    ],
  },
});
