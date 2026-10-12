import {
  createEventStream
} from 'h3'

/*
|--------------------------------------------------------------------------
| Use H3's actual EventStream type
|--------------------------------------------------------------------------
*/

export type AttendanceStreamClient =
  ReturnType<typeof createEventStream>

/*
|--------------------------------------------------------------------------
| Global SSE client storage
|--------------------------------------------------------------------------
*/

declare global {
  var attendanceSseClients:
    Set<AttendanceStreamClient> |
    undefined
}

const clients =
  globalThis.attendanceSseClients ??
  new Set<AttendanceStreamClient>()

globalThis.attendanceSseClients =
  clients

/*
|--------------------------------------------------------------------------
| Register Client
|--------------------------------------------------------------------------
*/

export function registerAttendanceClient(
  client: AttendanceStreamClient
) {
  clients.add(client)

  console.log(
    `Attendance SSE connected. Clients: ${clients.size}`
  )

  return () => {
    clients.delete(client)

    console.log(
      `Attendance SSE disconnected. Clients: ${clients.size}`
    )
  }
}

/*
|--------------------------------------------------------------------------
| Broadcast New Attendance
|--------------------------------------------------------------------------
*/

export async function broadcastNewLog(
  log: any
) {
  if (
    clients.size === 0
  ) {
    console.log(
      'Attendance received but no SSE browser client is connected.'
    )

    return
  }

  const deadClients:
    AttendanceStreamClient[] = []

  for (
    const client of clients
  ) {
    try {
      await client.push({
        event: 'attendance',

        data:
          JSON.stringify(
            log
          )
      })

    } catch (error) {
      console.warn(
        'Failed to send attendance SSE event:',
        error
      )

      deadClients.push(
        client
      )
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Remove disconnected clients
  |--------------------------------------------------------------------------
  */

  for (
    const client of deadClients
  ) {
    clients.delete(
      client
    )

    try {
      await client.close()
    } catch {
      // Ignore cleanup error
    }
  }

  console.log(
    `Attendance broadcast sent to ${clients.size} client(s).`
  )
}