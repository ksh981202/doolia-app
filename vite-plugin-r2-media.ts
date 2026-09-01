import type { Plugin } from 'vite'
import { handleR2MediaRequest, handleR2PrintableRequest } from './server/r2Media.ts'

const MEDIA_ROUTE = '/api/admin/r2-media'
const PRINTABLE_ROUTE = '/api/admin/r2-printables'

export function r2MediaPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'doolia-r2-media',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = req.url?.split('?')[0]
        if (path === MEDIA_ROUTE) {
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
          return
        }
        if (path === PRINTABLE_ROUTE) {
          void handleR2PrintableRequest(req, res, env).catch(() => {
            if (!res.headersSent) {
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.end(
                JSON.stringify({
                  connected: false,
                  mode: 'local',
                  error: 'R2 도안 업로드 API를 처리하지 못했습니다.',
                }),
              )
            }
          })
          return
        }
        next()
      })
    },
  }
}
