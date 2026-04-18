import { defineConfig } from 'vite'

import preact from '@preact/preset-vite'
import viteCompression from 'vite-plugin-compression'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    preact(),
    tsconfigPaths(),
    viteCompression()
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:6135',
        changeOrigin: true,
      },
    },
  },
})
