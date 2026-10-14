interface LoginBody {
  identifier?: string;
  password?: string;
  remember?: boolean;
}

interface StrapiLoginResponse {
  jwt: string;

  user: {
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
  };
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  const body = await readBody<LoginBody>(event);

  const identifier = String(body?.identifier ?? "").trim();

  const password = String(body?.password ?? "");

  const remember = Boolean(body?.remember);

  /*
    |--------------------------------------------------------------------------
    | Validate Input
    |--------------------------------------------------------------------------
    */

  if (!identifier) {
    throw createError({
      statusCode: 400,
      statusMessage: "Username is required.",
    });
  }

  if (!password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Password is required.",
    });
  }

  try {
    /*
      |--------------------------------------------------------------------------
      | Authenticate With Strapi
      |--------------------------------------------------------------------------
      */

    const response = await $fetch<StrapiLoginResponse>(
      `${config.strapiUrl}/api/auth/local`,
      {
        method: "POST",

        body: {
          identifier,
          password,
        },
      },
    );

    /*
      |--------------------------------------------------------------------------
      | Validate Strapi Response
      |--------------------------------------------------------------------------
      */

    if (!response?.jwt) {
      throw createError({
        statusCode: 401,
        statusMessage: "Invalid username or password.",
      });
    }

    /*
      |--------------------------------------------------------------------------
      | Check Blocked User
      |--------------------------------------------------------------------------
      */

    if (response.user?.blocked) {
      throw createError({
        statusCode: 403,
        statusMessage: "This account has been blocked.",
      });
    }

    /*
      |--------------------------------------------------------------------------
      | Cookie Options
      |--------------------------------------------------------------------------
      */

    const cookieOptions: {
      httpOnly: boolean;
      secure: boolean;
      sameSite: "lax";
      path: string;
      maxAge?: number;
    } = {
      httpOnly: true,

      /*
       * If your production system still
       * uses HTTP over LAN, change this
       * to false until HTTPS is configured.
       */
      secure: process.env.NODE_ENV === "production",

      sameSite: "lax",

      path: "/",
    };

    /*
      |--------------------------------------------------------------------------
      | Remember Me
      |--------------------------------------------------------------------------
      |
      | Remember = 30 days
      | Otherwise = browser session
      |
      */

    if (remember) {
      cookieOptions.maxAge = 60 * 60 * 24 * 30;
    }

    /*
      |--------------------------------------------------------------------------
      | Store JWT
      |--------------------------------------------------------------------------
      */

    setCookie(event, "snc_auth_token", response.jwt, cookieOptions);

    /*
      |--------------------------------------------------------------------------
      | Return Logged In User
      |--------------------------------------------------------------------------
      */

    return {
      success: true,

      user: {
        id: response.user.id,

        documentId: response.user.documentId,

        username: response.user.username,

        email: response.user.email,

        confirmed: response.user.confirmed,

        blocked: response.user.blocked,

        role: response.user.role,
      },
    };
  } catch (error: any) {
    /*
      |--------------------------------------------------------------------------
      | Read Error Status
      |--------------------------------------------------------------------------
      */

    const statusCode =
      error?.statusCode ??
      error?.status ??
      error?.response?.status ??
      error?.data?.error?.status ??
      500;

    /*
      |--------------------------------------------------------------------------
      | Debug Server Only
      |--------------------------------------------------------------------------
      |
      | Do not send Strapi's raw authentication
      | error back to the browser.
      |
      */

    console.error("Strapi authentication failed:", {
      statusCode,

      message:
        error?.data?.error?.message ?? error?.statusMessage ?? error?.message,
    });

    /*
      |--------------------------------------------------------------------------
      | Blocked Account
      |--------------------------------------------------------------------------
      */

    if (statusCode === 403) {
      throw createError({
        statusCode: 403,
        statusMessage: "This account has been blocked.",
      });
    }

    /*
      |--------------------------------------------------------------------------
      | Invalid Credentials
      |--------------------------------------------------------------------------
      |
      | Strapi commonly returns 400 when the
      | identifier/password combination is wrong.
      |
      */

    if (statusCode === 400 || statusCode === 401) {
      throw createError({
        statusCode: 401,
        statusMessage: "Invalid username or password.",
      });
    }

    /*
      |--------------------------------------------------------------------------
      | Strapi Unavailable / Server Problem
      |--------------------------------------------------------------------------
      */

    throw createError({
      statusCode: 500,
      statusMessage:
        "Unable to connect to the authentication service. Please try again.",
    });
  }
});
