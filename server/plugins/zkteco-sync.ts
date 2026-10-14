import {
  startZktecoSync
} from '~/server/utils/zktecoSync'

export default defineNitroPlugin(
  async () => {
    console.log(
      '[ZKTeco] Initializing biometric synchronization plugin...'
    )

    /*
     * startZktecoSync now handles BOTH:
     *
     * 1. attendance logs
     * 2. biometric users
     *
     * Do NOT start a separate
     * startZktecoUserSync() process here.
     */
    await startZktecoSync()
  }
)