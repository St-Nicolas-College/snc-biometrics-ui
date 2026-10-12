import {
  isAllowedDevice,
  touchAdmsDevice
} from '~/server/utils/zktecoAdms'

export default defineEventHandler(
  async (
    event
  ) => {
    setResponseHeader(
      event,
      'Content-Type',
      'text/plain; charset=utf-8'
    )

    const params =
      getQuery(
        event
      )

    const sn =
      String(
        params.SN ??
        params.sn ??
        ''
      ).trim()

    if (
      sn &&
      isAllowedDevice(
        sn
      )
    ) {
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