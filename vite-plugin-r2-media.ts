import type { Plugin } from 'vite'
import { handleR2MediaRequest } from './server/r2Media.ts'

const ROUTE = '/api/admin/r2-media'

export function r2MediaPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'doolia-r2-media',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = req.url?.split('?')[0]
        if (path !== ROUTE) {
          next()
          return
        }
        void handleR2MediaRequest(req, res, env).catch(() => {
          if (!res.headersSent) {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(
              JSON.stringify({
                connected: false,
                mode: 'local',
                items: [],
                message: 'R2 미디어 API를 처리하지 못했습니다.',
              }),
            )
          }
        })
      })
    },
  }
}
