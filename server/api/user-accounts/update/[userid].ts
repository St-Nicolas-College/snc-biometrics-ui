import axios from 'axios'
const BASE_URL = process.env.BASE_URL
export default defineEventHandler(async (event) => {
  const userid = getRouterParam(event, 'userid')
  try {
    const body = await readBody(event);
    const myPayload = {
      name: body.name,
      department: body.department,
      department_docid: body.department_docid,
      department_id: body.department_id
    }
    
    const result = await axios.put(`${BASE_URL}/api/user-account/update/${userid}`, myPayload);
    if (result) {
      return result.data;
    }
  } catch (err) {
    console.log("Error: ", err);
  }
})
