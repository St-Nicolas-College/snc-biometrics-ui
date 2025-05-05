import axios from 'axios'
const BASE_URL = process.env.BASE_URL
export default defineEventHandler(async (event) => {
  const userid = getRouterParam(event, 'userid')
  const cookies = parseCookies(event);
  const token = cookies?.token
  try {
    const result = await axios.get(`${BASE_URL}/api/shift-type/list/${userid}`)
    if(result) {
      return result.data;
    }
  } catch (err) { 
    console.log(err);
  }
})
