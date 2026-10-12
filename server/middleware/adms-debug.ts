import {
  getRequestIP
} from 'h3'

export default defineEventHandler((event) => {
  const path =
    event.path ||
    event.node.req.url ||
    ''

  if (!path.startsWith('/iclock')) {
    return
  }

  const remoteIP =
    getRequestIP(
      event,
      {
        xForwardedFor: true
      }
    )

  console.log('')
  console.log(
    '========== ADMS REQUEST =========='
  )

  console.log(
    'Method:',
    event.method
  )

  console.log(
    'URL:',
    event.node.req.url
  )

  console.log(
    'User-Agent:',
    getHeader(
      event,
      'user-agent'
    )
  )

  console.log(
    'Remote IP:',
    remoteIP
  )

  console.log(
    '=================================='
  )
})