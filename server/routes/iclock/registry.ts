import {
  isAllowedDevice,
  touchAdmsDevice
} from '~/server/utils/zktecoAdms'

export default defineEventHandler(
  async (event) => {

    setResponseHeader(
      event,
      'Content-Type',
      'text/plain; charset=utf-8'
    )

    const query =
      getQuery(event)

    const sn =
      String(
        query.SN ??
        query.sn ??
        ''
      ).trim()

    const body =
      event.method === 'POST'
        ? await readRawBody(event, 'utf8')
        : ''

    console.log('')
    console.log('[ADMS] REGISTRY')
    console.log('SN:', sn)
    console.log('Query:', query)

    if (body) {
      console.log(
        'Body:',
        body
      )
    }

    if (
      sn &&
      !isAllowedDevice(sn)
    ) {
      setResponseStatus(
        event,
        403
      )

      return 'Unauthorized'
    }

    if (sn) {
      await touchAdmsDevice(
        sn,
        getHeader(
          event,
          'user-agent'
        ) ?? ''
      )
    }

    return 'OK'
  }
)