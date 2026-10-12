import { isAllowedDevice, touchAdmsDevice } from "~/server/utils/zktecoAdms";

export default defineEventHandler(async (event) => {
  setResponseHeader(event, "Content-Type", "text/plain; charset=utf-8");

  setResponseHeader(event, "Cache-Control", "no-cache, no-store");

  const params = getQuery(event);

  const sn = String(params.SN ?? params.sn ?? "").trim();

  if (!sn) {
    return "OK";
  }

  if (!isAllowedDevice(sn)) {
    setResponseStatus(event, 403);

    return "Unauthorized";
  }

  await touchAdmsDevice(sn, getHeader(event, "user-agent") ?? "");

  /*
   * This MB460 firmware does not support
   * our server-side ATTLOG commands.
   *
   * Keep ADMS only as device heartbeat.
   */
  return "OK";
});
