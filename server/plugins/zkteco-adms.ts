import {
  ensureAdmsTables
} from '~/server/utils/zktecoAdms'

export default defineNitroPlugin(
  async () => {
    console.log(
      'Initializing ZKTeco ADMS PUSH server...'
    )

    await ensureAdmsTables()

    console.log(
      'ZKTeco ADMS PUSH server ready.'
    )
  }
)