export default defineNuxtRouteMiddleware(async (to) => {
  /*
    |--------------------------------------------------------------------------
    | Public Routes
    |--------------------------------------------------------------------------
    */

  const publicRoutes = ["/login"];
  const isPublic = publicRoutes.some((route) => to.path === route);

  /*
    |--------------------------------------------------------------------------
    | Check Session
    |--------------------------------------------------------------------------
    */

  try {
    const headers = import.meta.server
      ? useRequestHeaders(["cookie"])
      : undefined;
    await $fetch("/api/auth/me", {
      headers,
    });

    /*
     * User is authenticated.
     *
     * Do not allow authenticated users
     * to remain on the login page.
     */
    if (to.path === "/login") {
      return navigateTo("/");
    }
  } catch {
    /*
     * User is NOT authenticated.
     */
    if (!isPublic) {
      return navigateTo("/login");
    }
  }
});
