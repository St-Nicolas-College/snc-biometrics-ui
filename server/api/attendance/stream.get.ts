// @ts-ignore
import { createStreamHandler } from 'h3';
import { query } from '~/server/utils/db';

let clients: any[] = [];

export default defineEventHandler(async (event) => {
  // Set headers for SSE
  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  // Push this connection to clients
  clients.push(event);

  // Remove client on close
  event.node.res.on('close', () => {
    clients = clients.filter(c => c !== event);
  });
});

// Broadcast function
export async function broadcastNewLog(log: any) {
  clients.forEach(client => {
    // @ts-ignore
    writeStreamData(client, `data: ${JSON.stringify(log)}\n\n`);
  });
}
