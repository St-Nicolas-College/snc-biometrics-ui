// @ts-ignore
import ZKLib from "node-zklib";

export default defineEventHandler(async (event) => {
  const zk = new ZKLib('192.168.100.201', 4370, 10000); // IP, Port, Timeout

  try {
    await zk.createSocket();

    const attendance = await zk.getAttendances();

    await zk.disconnect();
    return attendance;
  } catch (err) {   
    console.error(err);
    return { error: 'Unable to connect to device'};
  }
})
