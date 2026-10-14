export default defineEventHandler(async (event) => {
  deleteCookie(event, "snc_auth_token", {
    path: "/",
  });

  return {
    success: true,
    message: "Logged out successfully.",
  };
});
