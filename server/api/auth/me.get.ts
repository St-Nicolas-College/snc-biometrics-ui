interface StrapiUser {
  id: number;
  documentId?: string;
  username: string;
  email?: string;
  confirmed?: boolean;
  blocked?: boolean;
  role?: {
    id?: number;
    documentId?: string;
    name?: string;
    type?: string;
  };
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  /*
    |--------------------------------------------------------------------------
    | Get Authentication Token
    |--------------------------------------------------------------------------
    */

  const token = getCookie(event, "snc_auth_token");

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Not authenticated.",
    });
  }

  try {
    /*
      |--------------------------------------------------------------------------
      | Get Current Strapi User
      |--------------------------------------------------------------------------
      */

    const user = await $fetch<StrapiUser>(
      `${config.strapiUrl}/api/users/me?populate=role`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    /*
      |--------------------------------------------------------------------------
      | Check Account
      |--------------------------------------------------------------------------
      */

    if (!user || user.blocked) {
      deleteCookie(event, "snc_auth_token", {
        path: "/",
      });

      throw createError({
        statusCode: 401,
        statusMessage: "Your session is no longer valid.",
      });
    }

    return {
      authenticated: true,
      user,
    };
  } catch (error: any) {
    /*
     * Remove expired/invalid JWT.
     */

    deleteCookie(event, "snc_auth_token", {
      path: "/",
    });

    throw createError({
      statusCode: 401,
      statusMessage: "Your session has expired.",
    });
  }
});
