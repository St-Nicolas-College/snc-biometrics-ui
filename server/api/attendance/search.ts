import axios from "axios";
const BASE_URL = process.env.BASE_URL;
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const cookies = parseCookies(event);
  const token = cookies?.token;
  try {
    const result = await axios.get(
      `${BASE_URL}/api/attendance-log/all/date-filter?date_start=${query.date_start}&date_end=${query.date_end}`
    );
    if (result) {
      return result.data;
    }
  } catch (err) {
    console.log(err);
  }
});
