import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";

// Get the directory name in a way that works with ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Define async plugins loading function to handle dynamic imports more safely
async function getPlugins() {
  const basePlugins = [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
  ];

  // Only load Replit-specific plugins when in the Replit environment
  if (process.env.REPL_ID) {
    try {
      const cartographer = await import("@replit/vite-plugin-cartographer");
      return [...basePlugins, cartographer.cartographer()];
    } catch (err) {
      console.warn("Failed to load @replit/vite-plugin-cartographer, skipping");
    }
  }
  
  return basePlugins;
}

export default defineConfig(async () => {
  return {
    plugins: await getPlugins(),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"),
        "@shared": path.resolve(__dirname, "shared"),
        "@assets": path.resolve(__dirname, "attached_assets"),
      },
    },
    root: path.resolve(__dirname, "client"),
    build: {
      outDir: path.resolve(__dirname, "dist/public"),
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, "client", "index.html"),
        },
      },
    },
    server: {
      port: 3000,
      host: true,
      hmr: {
        host: "localhost"
      }
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "@radix-ui/react-slot",
        "class-variance-authority",
        "clsx",
        "tailwind-merge",
        "tailwindcss-animate"
      ]
    }
  };
});
