import axios from "axios";
const BASE_URL = process.env.BASE_URL;
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const payload = {
      user_id: body.user_id,
      shift_name: body.shift_name,
      shift_start: body.shift_start,
      shift_end: body.shift_end,
      grace_period: body.grace_period,
      weekday: body.weekday,
      is_active: body.is_active,
    };

    const result = await axios.post(`${BASE_URL}/api/shift-type/create`, payload);
    if (result) {
      return result.data;
    }
  } catch (err) {
    console.log(err);
  }
});
