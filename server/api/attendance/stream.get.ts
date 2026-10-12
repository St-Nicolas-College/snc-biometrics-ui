import {
  createEventStream
} from 'h3'

import {
  registerAttendanceClient
} from '~/server/utils/attendanceStream'

export default defineEventHandler(
  (event) => {

    /*
    |--------------------------------------------------------------------------
    | Create SSE Stream
    |--------------------------------------------------------------------------
    */

    const eventStream =
      createEventStream(
        event
      )

    /*
    |--------------------------------------------------------------------------
    | Register browser connection
    |--------------------------------------------------------------------------
    */

    const unregister =
      registerAttendanceClient(
        eventStream
      )

    /*
    |--------------------------------------------------------------------------
    | Send Connected Event
    |--------------------------------------------------------------------------
    */

    void eventStream.push({
      event: 'connected',

      data:
        JSON.stringify({
          connected: true,

          timestamp:
            new Date()
              .toISOString()
        })
    })

    /*
    |--------------------------------------------------------------------------
    | Keep Alive
    |--------------------------------------------------------------------------
    */

    const heartbeat =
      setInterval(
        () => {

          void eventStream.push({
            event: 'heartbeat',

            data:
              JSON.stringify({
                timestamp:
                  new Date()
                    .toISOString()
              })
          })

        },
        30000
      )

    /*
    |--------------------------------------------------------------------------
    | Client Closed
    |--------------------------------------------------------------------------
    */

    eventStream.onClosed(
      async () => {

        clearInterval(
          heartbeat
        )

        unregister()

        try {
          await eventStream.close()
        } catch {
          // Already closed
        }
      }
    )

    /*
    |--------------------------------------------------------------------------
    | Keep Response Open
    |--------------------------------------------------------------------------
    */

    return eventStream.send()
  }
)