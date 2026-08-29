import type { IncomingMessage, ServerResponse } from 'node:http'
import { handleR2MediaRequest } from '../../server/r2Media.ts'

export const config = { api: { bodyParser: false } }

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await handleR2MediaRequest(req, res, process.env)
}
