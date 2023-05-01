import { defineConfig } from 'vite'
import fs from 'fs';
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 8080,
    https: {
      key: fs.readFileSync('SLLKey/agent-2-key.pem'),
      cert: fs.readFileSync('SLLKey/agent-2.pem')
    },
    proxy: {
      "/api": {
        target: "http://10.214.46.125",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "")
      }
    }
  }
})
