import {
  startZktecoSync,
  stopZktecoSync,
} from "../utils/zktecoSync";

declare global {
  var zktecoSyncStarted: boolean | undefined;
}

export default defineNitroPlugin((nitroApp) => {
  /*
  |--------------------------------------------------------------------------
  | Prevent duplicate ZKTeco initialization
  |--------------------------------------------------------------------------
  */

  if (globalThis.zktecoSyncStarted) {
    console.log(
      "ZKTeco synchronization already initialized. Skipping duplicate start."
    );

    return;
  }

  globalThis.zktecoSyncStarted = true;

  console.log(
    "Initializing ZKTeco synchronization..."
  );

  startZktecoSync();

  /*
  |--------------------------------------------------------------------------
  | DEVELOPMENT MODE
  |--------------------------------------------------------------------------
  |
  | DO NOT stop the ZKTeco service when Nitro hot-reloads.
  |
  | During `npm run dev`, Nitro may close/recreate its runtime whenever
  | server code is rebuilt.
  |
  | If we disconnect/reconnect the MB460 during every HMR cycle,
  | the device may still have the old TCP session open and the next
  | CONNECT command times out.
  |
  */

  if (import.meta.dev) {
    console.log(
      "ZKTeco development mode: sync will survive Nitro hot reload."
    );

    return;
  }

  /*
  |--------------------------------------------------------------------------
  | PRODUCTION SHUTDOWN
  |--------------------------------------------------------------------------
  |
  | In production there is no development HMR, so we can safely stop
  | the ZKTeco service when Nitro itself shuts down.
  |
  */

  nitroApp.hooks.hook(
    "close",
    async () => {
      console.log(
        "Nitro shutting down. Stopping ZKTeco synchronization..."
      );

      await stopZktecoSync();

      globalThis.zktecoSyncStarted = false;
    }
  );
});