import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // 🔓 разрешаем ngrok
    allowedHosts: [
      "dedicated-nonoxidizable-joanna.ngrok-free.dev",
    ],

    // 🔁 proxy к backend
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('🚨 Proxy error:', err.message);
          });
          proxy.on('proxyReq', (_, req) => {
            console.log('📤 →', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('📥 ←', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
});
