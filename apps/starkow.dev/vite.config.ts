import { defineConfig } from 'vite'

import preact from '@preact/preset-vite'
import viteCompression from 'vite-plugin-compression'
import tsconfigPaths from 'vite-tsconfig-paths'

const BUILD_DATE = new Date().toISOString()

export default defineConfig({
  plugins: [
    preact(),
    tsconfigPaths(),
    viteCompression()
  ],
  define: {
    __BUILD_DATE__: JSON.stringify(BUILD_DATE)
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:6135',
        changeOrigin: true,
      },
    },
  },
})
