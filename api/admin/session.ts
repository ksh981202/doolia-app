import type { IncomingMessage, ServerResponse } from 'node:http'
import { handleAdminSessionRequest } from '../../server/adminAuth.ts'

export const config = { api: { bodyParser: false } }

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await handleAdminSessionRequest(req, res, process.env)
}
