import { isAllowedDevice, touchAdmsDevice } from "~/server/utils/zktecoAdms";

import { completeCommand } from "~/server/utils/zktecoCommandQueue";

export default defineEventHandler(async (event) => {
  setResponseHeader(event, "Content-Type", "text/plain; charset=utf-8");

  const query = getQuery(event);

  const sn = String(query.SN ?? query.sn ?? "").trim();

  if (sn && !isAllowedDevice(sn)) {
    setResponseStatus(event, 403);

    return "Unauthorized";
  }

  if (sn) {
    await touchAdmsDevice(sn, getHeader(event, "user-agent") ?? "");
  }

  const body =
    event.method === "POST" ? ((await readRawBody(event, "utf8")) ?? "") : "";

  console.log("");
  console.log("========= ADMS DEVICECMD =========");

  console.log("Device:", sn);

  console.log("Body:", body || "(empty)");

  console.log("==================================");

  /*
    |--------------------------------------------------------------------------
    | Parse query-string response
    |--------------------------------------------------------------------------
    */

  const queryId = Number(query.ID ?? query.CmdID ?? 0);

  const queryReturn = Number(query.Return ?? 0);

  if (queryId > 0) {
    completeCommand(sn, queryId, queryReturn);

    return "OK";
  }

  /*
    |--------------------------------------------------------------------------
    | Parse POST response
    |--------------------------------------------------------------------------
    */

  if (body) {
    const lines = body
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    for (const line of lines) {
      const params = new URLSearchParams(line);

      const id = Number(params.get("ID") ?? 0);

      const returnCode = Number(params.get("Return") ?? 0);

      const cmd = params.get("CMD");

      console.log(`[ADMS] Result ID=${id} CMD=${cmd} Return=${returnCode}`);

      if (id > 0) {
        completeCommand(sn, id, returnCode, cmd ?? undefined);
      }
    }
  }

  return "OK";
});
