import { startZktecoSync, stopZktecoSync } from "../utils/zktecoSync";

declare global {
  var zktecoWatcherStarted: boolean | undefined;
}

export default defineNitroPlugin(async (nitroApp) => {
  if (globalThis.zktecoWatcherStarted) {
    return;
  }

  globalThis.zktecoWatcherStarted = true;

  console.log("Initializing ZKTeco near-real-time watcher...");

  await startZktecoSync();

  if (!import.meta.dev) {
    nitroApp.hooks.hook("close", () => {
      stopZktecoSync();

      globalThis.zktecoWatcherStarted = false;
    });
  }
});
