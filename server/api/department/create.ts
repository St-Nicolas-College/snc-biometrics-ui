import axios from "axios";
const BASE_URL = process.env.BASE_URL;
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const payload = {
      data: {
        dept_code: body.dept_code,
        dept_name: body.dept_name,
      },
    };

    const result = await axios.post(`${BASE_URL}/api/departments`, payload);
    if (result) {
      return result.data;
    }
  } catch (err) {
    console.log(err);
  }
});
