import {
  buildAdmsOptions,
  getAttendanceStamp,
  isAllowedDevice,
  processAttendanceUpload,
  touchAdmsDevice,
} from "~/server/utils/zktecoAdms";

export default defineEventHandler(async (event) => {
  setResponseHeader(event, "Content-Type", "text/plain; charset=utf-8");

  setResponseHeader(event, "Cache-Control", "no-cache, no-store");

  const params = getQuery(event);

  const sn = String(params.SN ?? params.sn ?? "").trim();

  if (!sn) {
    setResponseStatus(event, 400);

    return "Missing SN";
  }

  if (!isAllowedDevice(sn)) {
    console.warn(`[ADMS] Rejected unknown device: ${sn}`);

    setResponseStatus(event, 403);

    return "Unauthorized device";
  }

  const userAgent = getHeader(event, "user-agent") ?? "";

  await touchAdmsDevice(sn, userAgent);

  /*
    |--------------------------------------------------------------------------
    | Device handshake
    |--------------------------------------------------------------------------
    */

  if (event.method === "GET") {
    const stamp = await getAttendanceStamp(sn);

    console.log(`[ADMS] Device connected: ${sn}`);

    console.log(`[ADMS] User-Agent: ${userAgent}`);

    return buildAdmsOptions(sn, stamp);
  }

  /*
    |--------------------------------------------------------------------------
    | Device upload
    |--------------------------------------------------------------------------
    */

  if (event.method === "POST") {
    const table = String(params.table ?? "")
      .toUpperCase()
      .trim();

    const stamp = params.Stamp ? String(params.Stamp) : undefined;

    const body = (await readRawBody(event, "utf8")) ?? "";

    console.log(`[ADMS] POST SN=${sn} table=${table} bytes=${body.length}`);

    /*
      |--------------------------------------------------------------------------
      | Attendance
      |--------------------------------------------------------------------------
      */

    if (table === "ATTLOG") {
      const result = await processAttendanceUpload(sn, body, stamp);

      console.log(
        `[ADMS] ATTLOG received=${result.received} inserted=${result.inserted} duplicates=${result.duplicates}`,
      );

      /*
       * PUSH protocol supports:
       *
       * OK: <processed count>
       */

      return `OK: ${result.received}`;
    }

    /*
     * USERINFO / OPERLOG etc.
     *
     * We'll add those later.
     */

    console.log(`[ADMS] Ignoring supported-but-unhandled table: ${table}`);

    return "OK";
  }

  return "OK";
});
