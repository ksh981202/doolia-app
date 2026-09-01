import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { r2MediaPlugin } from './vite-plugin-r2-media.ts'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, '')
  return {
    plugins: [react(), tailwindcss(), r2MediaPlugin(env)],
    resolve: {
      alias: {
        '@': path.resolve(rootDir, 'src'),
      },
    },
    optimizeDeps: {
      include: ['tinymce', '@tinymce/tinymce-react'],
    },
    server: {
      port: 9999,
      strictPort: true,
    },
  }
})
