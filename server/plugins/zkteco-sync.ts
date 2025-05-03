import { startZktecoSync } from "../utils/zktecoSync"
import { startZktecoUserSync } from "../utils/zkTecoUserSync"

export default defineNitroPlugin((nitroApp) => {
    startZktecoSync();
    startZktecoUserSync();
})
