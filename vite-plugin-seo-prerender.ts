import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin, PreviewServer, ViteDevServer } from 'vite'

function prerenderFile(rootDir: string, slug: string) {
  const publicFile = path.join(rootDir, 'public', 'printable', slug, 'index.html')
  const distFile = path.join(rootDir, 'dist', 'printable', slug, 'index.html')
  if (existsSync(publicFile)) return publicFile
  if (existsSync(distFile)) return distFile
  return null
}

function slugFromUrl(url = '') {
  const pathOnly = url.split('?')[0] ?? ''
  const match = pathOnly.match(/^\/printable\/([^/]+)\/?$/)
  return match?.[1] ?? null
}

function attach(server: ViteDevServer | PreviewServer, rootDir: string) {
  server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: (error?: unknown) => void) => {
    const slug = slugFromUrl(req.url ?? '')
    if (!slug || slug === 'index.html') return next()
    const file = prerenderFile(rootDir, slug)
    if (!file) return next()
    const html = readFileSync(file, 'utf-8')
    // Dev server must inject the Vite client + React refresh preamble, or the page renders blank.
    const ready = 'transformIndexHtml' in server ? server.transformIndexHtml(req.url ?? '/', html) : Promise.resolve(html)
    ready
      .then((output) => {
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.end(output)
      })
      .catch(next)
  })
}

export function seoPrerenderPlugin(rootDir: string): Plugin {
  return {
    name: 'doolia-seo-prerender',
    configureServer(server) {
      attach(server, rootDir)
    },
    configurePreviewServer(server) {
      attach(server, rootDir)
    },
  }
}
