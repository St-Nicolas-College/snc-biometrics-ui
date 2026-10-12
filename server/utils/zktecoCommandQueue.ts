interface PendingCommand {
  id: number;
  command: string;
  sentAt: number;
}

interface DeviceState {
  nextId: number;
  inFlight: PendingCommand | null;
  lastLogRequestAt: number;
}

declare global {
  var zktecoAdmsCommandStates: Map<string, DeviceState> | undefined;
}

const states =
  globalThis.zktecoAdmsCommandStates ?? new Map<string, DeviceState>();

globalThis.zktecoAdmsCommandStates = states;

/*
|--------------------------------------------------------------------------
| Settings
|--------------------------------------------------------------------------
*/

// Ask device for logs every 5 seconds.
const LOG_INTERVAL = 5 * 1000;

// If device never acknowledges,
// retry after 15 seconds.
const COMMAND_TIMEOUT = 15 * 1000;

/*
|--------------------------------------------------------------------------
| Device State
|--------------------------------------------------------------------------
*/

function getState(sn: string): DeviceState {
  let state = states.get(sn);

  if (!state) {
    state = {
      nextId: 1,
      inFlight: null,
      lastLogRequestAt: 0,
    };

    states.set(sn, state);
  }

  return state;
}

/*
|--------------------------------------------------------------------------
| Get Next LOG Command
|--------------------------------------------------------------------------
*/

export function getNextAttendanceCommand(sn: string): PendingCommand | null {
  const state = getState(sn);

  const now = Date.now();

  /*
   * Previous command still waiting.
   */
  if (state.inFlight) {
    const age = now - state.inFlight.sentAt;

    if (age < COMMAND_TIMEOUT) {
      return null;
    }

    console.warn(`[ADMS] Command ${state.inFlight.id} timed out.`);

    state.inFlight = null;
  }

  /*
   * Wait until next interval.
   */
  if (now - state.lastLogRequestAt < LOG_INTERVAL) {
    return null;
  }

  const command: PendingCommand = {
    id: state.nextId++,

    command: "LOG",

    sentAt: now,
  };

  state.inFlight = command;

  state.lastLogRequestAt = now;

  return command;
}

/*
|--------------------------------------------------------------------------
| Command Completed
|--------------------------------------------------------------------------
*/

export function completeCommand(
  sn: string,
  id: number,
  returnCode: number,
  commandName?: string,
) {
  const state = getState(sn);

  console.log(
    `[ADMS] Command response ID=${id} CMD=${commandName ?? ""} Return=${returnCode}`,
  );

  if (state.inFlight?.id === id) {
    state.inFlight = null;
  }

  if (returnCode === 0) {
    console.log("[ADMS] LOG command accepted.");

    return;
  }

  if (returnCode === -1) {
    console.warn(
      "[ADMS] LOG command returned -1. Device may have no pending log data.",
    );

    return;
  }

  if (returnCode === -1002) {
    console.error(
      "[ADMS] LOG command syntax is not supported by this MB460 firmware.",
    );

    return;
  }

  console.warn(`[ADMS] LOG command returned ${returnCode}.`);
}

/*
|--------------------------------------------------------------------------
| Reset State
|--------------------------------------------------------------------------
*/

export function resetDeviceCommandState(sn: string) {
  states.delete(sn);
}
