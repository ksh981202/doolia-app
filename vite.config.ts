import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { r2MediaPlugin } from './vite-plugin-r2-media.ts'
import { seoPrerenderPlugin } from './vite-plugin-seo-prerender.ts'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, '')
  return {
    plugins: [react(), tailwindcss(), r2MediaPlugin(env), seoPrerenderPlugin(rootDir)],
    resolve: {
      alias: {
        '@': path.resolve(rootDir, 'src'),
      },
    },
    optimizeDeps: {
      include: ['tinymce', '@tinymce/tinymce-react'],
    },
    build: {
      rolldownOptions: {
        output: {
          // Vite 8 / Rolldown: object-form manualChunks is removed.
          // Equivalent of vendor-react / vendor-query / vendor-supabase.
          codeSplitting: {
            groups: [
              {
                name: 'vendor-react',
                test: /[\\/]node_modules[\\/](?:react-dom|react-router-dom|scheduler|react)(?:[\\/]|$)/,
                priority: 30,
              },
              {
                name: 'vendor-query',
                test: /[\\/]node_modules[\\/]@tanstack[\\/]react-query(?:[\\/]|$)/,
                priority: 20,
              },
              {
                name: 'vendor-supabase',
                test: /[\\/]node_modules[\\/]@supabase[\\/]supabase-js(?:[\\/]|$)/,
                priority: 20,
              },
            ],
          },
        },
      },
    },
    server: {
      port: 9999,
      strictPort: true,
      watch: {
        ignored: ['**/.tmp-verify/**', '**/public/printable/**'],
      },
    },
  }
})
