import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'

import { defineConfig, type Plugin } from 'vite'

import preact from '@preact/preset-vite'
import viteCompression from 'vite-plugin-compression'
import tsconfigPaths from 'vite-tsconfig-paths'

const BUILD_DATE = new Date().toISOString()

const offline = (): Plugin => {
  let publicDir = ''

  return {
    name: 'starkow-offline',
    apply: 'build',
    configResolved (config) {
      publicDir = config.publicDir
    },
    generateBundle (_, bundle) {
      const built = Object.keys(bundle).filter(file => /\.(js|css)$/.test(file)).map(file => `/${file}`)
      const fonts = readdirSync(publicDir).filter(file => file.endsWith('.woff2')).map(file => `/${file}`)
      const precache = ['/index.html', ...built, ...fonts]
      const version = createHash('sha256').update(precache.join('\n')).digest('hex').slice(0, 12)
      const worker = readFileSync(new URL('./service-worker.js', import.meta.url), 'utf8')

      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: `const VERSION = '${version}'\nconst PRECACHE = ${JSON.stringify(precache)}\n\n${worker}`
      })
    }
  }
}

export default defineConfig({
  plugins: [
    preact(),
    tsconfigPaths(),
    offline(),
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
