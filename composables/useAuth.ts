interface AuthRole {
  id?: number;
  documentId?: string;
  name?: string;
  type?: string;
}

interface AuthUser {
  id: number;
  documentId?: string;
  username: string;
  email?: string;
  confirmed?: boolean;
  blocked?: boolean;
  role?: AuthRole;
}

interface AuthResponse {
  authenticated: boolean;
  user: AuthUser;
}

export const useAuth = () => {
  const user = useState<AuthUser | null>("auth-user", () => null);

  const loading = useState<boolean>("auth-loading", () => false);

  /*
  |--------------------------------------------------------------------------
  | Load Current User
  |--------------------------------------------------------------------------
  */

  const fetchUser = async () => {
    loading.value = true;

    try {
      const headers = import.meta.server
        ? useRequestHeaders(["cookie"])
        : undefined;

      const response = await $fetch<AuthResponse>("/api/auth/me", {
        headers,
      });
      user.value = response.user;
      return response.user;
    } catch (error) {
      user.value = null;
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  const logout = async () => {
    loading.value = true;
    try {
      await $fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      user.value = null;
      loading.value = false;
      await navigateTo("/login");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Role
  |--------------------------------------------------------------------------
  */

  const roleName = computed(() => {
    return user.value?.role?.name ?? "Authenticated";
  });

  /*
  |--------------------------------------------------------------------------
  | Initials
  |--------------------------------------------------------------------------
  */

  const initials = computed(() => {
    const value = user.value?.username?.trim();
    if (!value) {
      return "U";
    }

    const parts = value.split(/[\s._-]+/);

    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }

    return (
      (parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")
    ).toUpperCase();
  });

  return {
    user,
    loading,
    roleName,
    initials,
    fetchUser,
    logout,
  };
};
