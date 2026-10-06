import type { IncomingMessage, ServerResponse } from 'node:http'
import { handleAdminDataRequest } from '../../server/adminData.ts'

export const config = { api: { bodyParser: false } }

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await handleAdminDataRequest(req, res, process.env)
}
