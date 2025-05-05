import axios from 'axios'
//@ts-ignore
const BASE_URL = process.env.BASE_URL
export default defineEventHandler(async (event) => {
  const cookies = parseCookies(event);
  const token = cookies?.token
  try {
    const result = await axios.get(`${BASE_URL}/api/user-account/list`)
    if (result) {
      return result.data;
    }
  } catch (err) {
    console.log(err);
  }
})