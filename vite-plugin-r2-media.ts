import type { Plugin } from 'vite'
import { ADMIN_SESSION_ROUTE, handleAdminSessionRequest } from './server/adminAuth.ts'
import { ADMIN_DATA_ROUTE, handleAdminDataRequest } from './server/adminData.ts'
import { handleR2MediaRequest, handleR2PrintableRequest } from './server/r2Media.ts'

const MEDIA_ROUTE = '/api/admin/r2-media'
const PRINTABLE_ROUTE = '/api/admin/r2-printables'

function sendUnauthorized(res: { headersSent: boolean; statusCode: number; setHeader: (k: string, v: string) => void; end: (b: string) => void }) {
  if (res.headersSent) return
  res.statusCode = 401
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify({ error: 'Unauthorized' }))
}

export function r2MediaPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'doolia-r2-media',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = req.url?.split('?')[0]
        if (path === ADMIN_SESSION_ROUTE) {
          void handleAdminSessionRequest(req, res, env).catch(() => sendUnauthorized(res))
          return
        }
        if (path === ADMIN_DATA_ROUTE) {
          void handleAdminDataRequest(req, res, env).catch(() => sendUnauthorized(res))
          return
        }
        if (path === MEDIA_ROUTE) {
          void handleR2MediaRequest(req, res, env).catch(() => sendUnauthorized(res))
          return
        }
        if (path === PRINTABLE_ROUTE) {
          void handleR2PrintableRequest(req, res, env).catch(() => sendUnauthorized(res))
          return
        }
        next()
      })
    },
  }
}
