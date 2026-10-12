<template>
  <div class="users-page">
    <!-- =========================================================
         PAGE HEADER
    ========================================================== -->
    <div class="page-header mb-6">
      <div>
        <div class="d-flex align-center ga-2 mb-1">
          <v-icon color="primary" size="28"> mdi-account-group-outline </v-icon>

          <h1 class="page-title">Users</h1>
        </div>

        <p class="page-subtitle">
          View biometric users registered in the attendance system.
        </p>
      </div>

      <div class="header-actions">
        <v-btn
          color="primary"
          variant="tonal"
          prepend-icon="mdi-refresh"
          :loading="refreshing"
          @click="initialize(false)"
        >
          Refresh
        </v-btn>
      </div>
    </div>

    <!-- =========================================================
         SUMMARY CARDS
    ========================================================== -->
    <v-row class="mb-5">
      <!-- Total Users -->
      <v-col cols="12" sm="6" lg="3">
        <v-card elevation="0" class="summary-card">
          <v-card-text>
            <div class="d-flex justify-space-between align-start">
              <div>
                <div class="summary-label">Total Users</div>

                <div class="summary-value">
                  {{ userAccountList.length }}
                </div>

                <div class="summary-description">
                  Registered biometric users
                </div>
              </div>

              <div class="summary-icon icon-primary">
                <v-icon> mdi-account-group-outline </v-icon>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- With Card -->
      <v-col cols="12" sm="6" lg="3">
        <v-card elevation="0" class="summary-card">
          <v-card-text>
            <div class="d-flex justify-space-between align-start">
              <div>
                <div class="summary-label">With Card</div>

                <div class="summary-value text-primary">
                  {{ usersWithCard }}
                </div>

                <div class="summary-description">Users with card number</div>
              </div>

              <div class="summary-icon icon-info">
                <v-icon> mdi-card-account-details-outline </v-icon>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Without Card -->
      <v-col cols="12" sm="6" lg="3">
        <v-card elevation="0" class="summary-card">
          <v-card-text>
            <div class="d-flex justify-space-between align-start">
              <div>
                <div class="summary-label">Without Card</div>

                <div class="summary-value text-warning">
                  {{ usersWithoutCard }}
                </div>

                <div class="summary-description">No card number assigned</div>
              </div>

              <div class="summary-icon icon-warning">
                <v-icon> mdi-card-off-outline </v-icon>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Roles -->
      <v-col cols="12" sm="6" lg="3">
        <v-card elevation="0" class="summary-card">
          <v-card-text>
            <div class="d-flex justify-space-between align-start">
              <div>
                <div class="summary-label">Roles</div>

                <div class="summary-value">
                  {{ roleCount }}
                </div>

                <div class="summary-description">User role classifications</div>
              </div>

              <div class="summary-icon icon-success">
                <v-icon> mdi-account-key-outline </v-icon>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- =========================================================
         USER DIRECTORY
    ========================================================== -->
    <v-card elevation="0" class="users-card">
      <!-- Toolbar -->
      <div class="table-toolbar">
        <div>
          <div class="section-title">User Directory</div>

          <div class="section-subtitle">
            Browse and manage biometric user profiles.
          </div>
        </div>

        <div class="toolbar-actions">
          <v-text-field
            v-model="search"
            density="compact"
            placeholder="Search users..."
            clearable
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            hide-details
            class="search-field"
          />
        </div>
      </div>

      <v-divider />

      <!-- Error -->
      <v-alert
        v-if="errorMessage"
        type="error"
        variant="tonal"
        closable
        class="ma-4"
        @click:close="errorMessage = ''"
      >
        {{ errorMessage }}
      </v-alert>

      <!-- =======================================================
           TABLE
      ======================================================== -->
      <v-data-table
        :headers="headers"
        :items="userAccountList"
        :search="search"
        :loading="loading"
        density="comfortable"
        :items-per-page="20"
        class="users-table"
      >
        <!-- Loading -->
        <template #loading>
          <v-skeleton-loader type="table-row@10" />
        </template>

        <!-- =====================================================
             USER
        ====================================================== -->
        <template #[`item.name`]="{ item }">
          <div class="user-cell">
            <v-avatar size="38" color="green-lighten-5">
              <span class="avatar-text">
                {{ getInitials(item.name) }}
              </span>
            </v-avatar>

            <div class="user-info">
              <div class="user-name">
                {{ item.name || "Unknown User" }}
              </div>

              <div class="user-id">User ID {{ item.user_id }}</div>
            </div>
          </div>
        </template>

        <!-- =====================================================
             CARD NUMBER
        ====================================================== -->
        <template #[`item.card_no`]="{ item }">
          <v-chip
            v-if="hasCard(item.card_no)"
            size="small"
            variant="tonal"
            color="blue-grey"
          >
            <v-icon start size="14"> mdi-card-account-details-outline </v-icon>

            {{ item.card_no }}
          </v-chip>

          <span v-else class="no-card">
            <v-icon size="15" class="me-1"> mdi-card-off-outline </v-icon>

            Not assigned
          </span>
        </template>

        <!-- =====================================================
             ROLE
        ====================================================== -->
        <template #[`item.role`]="{ item }">
          <v-chip size="small" variant="tonal" :color="getRoleColor(item.role)">
            <v-icon start size="14">
              {{
                String(item.role) === "14"
                  ? "mdi-shield-account-outline"
                  : "mdi-account-outline"
              }}
            </v-icon>

            {{ formatRole(item.role) }}
          </v-chip>
        </template>

        <!-- =====================================================
             ACTION
        ====================================================== -->
        <template #[`item.actions`]="{ item }">
          <div class="d-flex justify-center">
            <v-btn
              :to="`/users/${item.user_id}`"
              variant="tonal"
              size="small"
              color="primary"
              prepend-icon="mdi-eye-outline"
              class="view-button"
            >
              View
            </v-btn>
          </div>
        </template>

        <!-- =====================================================
             EMPTY STATE
        ====================================================== -->
        <template #no-data>
          <div class="empty-state">
            <div class="empty-icon">
              <v-icon size="36"> mdi-account-search-outline </v-icon>
            </div>

            <div class="empty-title">No users found</div>

            <div class="empty-description">
              Try changing your search keyword.
            </div>
          </div>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup lang="ts">
//@ts-nocheck
/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

interface UserAccount {
  user_id: number;
  uid?: number | null;
  name?: string | null;
  card_no?: string | number | null;
  role?: string | number | null;
}

/*
|--------------------------------------------------------------------------
| State
|--------------------------------------------------------------------------
*/

const userAccountList = ref<UserAccount[]>([]);

const loading = ref(true);

const refreshing = ref(false);

const search = ref("");

const errorMessage = ref("");

/*
|--------------------------------------------------------------------------
| Table Headers
|--------------------------------------------------------------------------
*/

const headers = [
  {
    title: "User",
    key: "name",
    sortable: true,
  },

  {
    title: "Card Number",
    key: "card_no",
    sortable: true,
    width: 220,
  },

  {
    title: "Role",
    key: "role",
    sortable: true,
    width: 180,
  },

  {
    title: "",
    key: "actions",
    sortable: false,
    align: "center" as const,
    width: 120,
  },
];

/*
|--------------------------------------------------------------------------
| Summary
|--------------------------------------------------------------------------
*/

const usersWithCard = computed(() => {
  return userAccountList.value.filter((user) => hasCard(user.card_no)).length;
});

const usersWithoutCard = computed(() => {
  return userAccountList.value.length - usersWithCard.value;
});

const roleCount = computed(() => {
  const roles = new Set(
    userAccountList.value
      .map((user) =>
        String(user.role ?? "")
          .trim()
          .toLowerCase(),
      )
      .filter(Boolean),
  );

  return roles.size;
});

/*
|--------------------------------------------------------------------------
| Fetch Users
|--------------------------------------------------------------------------
*/

const initialize = async (showLoader = true) => {
  if (showLoader) {
    loading.value = true;
  } else {
    refreshing.value = true;
  }

  try {
    const result = await $fetch<UserAccount[]>("/api/user-accounts/list");

    userAccountList.value = result ?? [];

    errorMessage.value = "";
  } catch (error) {
    console.error("Failed to fetch users:", error);

    errorMessage.value = "Unable to load user accounts.";
  } finally {
    loading.value = false;

    refreshing.value = false;
  }
};

/*
|--------------------------------------------------------------------------
| Has Card
|--------------------------------------------------------------------------
*/

const hasCard = (card?: string | number | null) => {
  if (card === null || card === undefined) {
    return false;
  }

  const value = String(card).trim();

  return value !== "" && value !== "0";
};

/*
|--------------------------------------------------------------------------
| User Initials
|--------------------------------------------------------------------------
*/

const getInitials = (name?: string | null) => {
  if (!name) {
    return "?";
  }

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return (
    (parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")
  ).toUpperCase();
};

/*
|--------------------------------------------------------------------------
| Role
|--------------------------------------------------------------------------
*/

const formatRole = (role?: string | number | null) => {
  if (role === null || role === undefined || String(role).trim() === "") {
    return "User";
  }

  const value = String(role).trim();

  /*
  |--------------------------------------------------------------------------
  | ZKTeco Role Codes
  |--------------------------------------------------------------------------
  |
  | 0  = Normal User
  | 14 = Administrator / Super Admin
  |
  */

  if (value === "0") {
    return "User";
  }

  if (value === "14") {
    return "Administrator";
  }

  /*
   * If the API later returns text roles
   * such as employee, faculty, admin, etc.
   */
  if (!/^\d+$/.test(value)) {
    return value
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  /*
   * Unknown biometric role code.
   */
  return `Role ${value}`;
};

const getRoleColor = (role?: string | number | null) => {
  const value = String(role ?? "")
    .trim()
    .toLowerCase();

  /*
   * ZKTeco normal user
   */
  if (value === "0") {
    return "success";
  }

  /*
   * ZKTeco administrator
   */
  if (value === "14") {
    return "purple";
  }

  /*
   * Text-based roles
   */
  if (value.includes("admin")) {
    return "purple";
  }

  if (value.includes("teacher") || value.includes("faculty")) {
    return "primary";
  }

  if (
    value.includes("employee") ||
    value.includes("staff") ||
    value.includes("user")
  ) {
    return "success";
  }

  return "blue-grey";
};

/*
|--------------------------------------------------------------------------
| Lifecycle
|--------------------------------------------------------------------------
*/

onMounted(async () => {
  await initialize(true);
});
</script>

<style scoped>
/* =========================================================
   PAGE
========================================================= */

.users-page {
  min-height: 100%;
  padding: 24px;
  background: #f7f8fa;
}

/* =========================================================
   PAGE HEADER
========================================================= */

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 20px;
}

.page-title {
  margin: 0;

  color: #1f2937;

  font-size: 1.55rem;
  font-weight: 750;
  line-height: 1.2;
}

.page-subtitle {
  margin: 0;

  color: #6b7280;

  font-size: 0.9rem;
}

.header-actions {
  display: flex;
  align-items: center;

  gap: 10px;
}

/* =========================================================
   SUMMARY CARDS
========================================================= */

.summary-card {
  height: 100%;

  border: 1px solid #e7e9ed;
  border-radius: 14px;

  background: #ffffff;

  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.summary-card:hover {
  transform: translateY(-2px);

  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
}

.summary-label {
  color: #6b7280;

  font-size: 0.76rem;
  font-weight: 700;

  letter-spacing: 0.04em;

  text-transform: uppercase;
}

.summary-value {
  margin-top: 5px;

  color: #1f2937;

  font-size: 2rem;
  font-weight: 750;
  line-height: 1.1;
}

.summary-description {
  margin-top: 5px;

  color: #9ca3af;

  font-size: 0.75rem;
}

.summary-icon {
  width: 44px;
  height: 44px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 12px;
}

.icon-primary {
  color: #15803d;
  background: #ecfdf5;
}

.icon-info {
  color: #2563eb;
  background: #eff6ff;
}

.icon-warning {
  color: #d97706;
  background: #fffbeb;
}

.icon-success {
  color: #16a34a;
  background: #ecfdf5;
}

/* =========================================================
   USER CARD
========================================================= */

.users-card {
  overflow: hidden;

  border: 1px solid #e7e9ed;
  border-radius: 14px;

  background: #ffffff;
}

/* =========================================================
   TOOLBAR
========================================================= */

.table-toolbar {
  min-height: 76px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 20px;

  padding: 16px 20px;
}

.section-title {
  color: #1f2937;

  font-size: 1rem;
  font-weight: 700;
}

.section-subtitle {
  margin-top: 2px;

  color: #9ca3af;

  font-size: 0.8rem;
}

.toolbar-actions {
  display: flex;
  align-items: center;

  gap: 10px;
}

.search-field {
  width: 300px;
}

/* =========================================================
   TABLE
========================================================= */

:deep(.users-table thead th) {
  height: 50px !important;

  padding-left: 14px !important;
  padding-right: 14px !important;

  background: #fafafa !important;

  border-bottom: 1px solid #e5e7eb !important;

  color: #4b5563 !important;

  font-size: 0.72rem !important;
  font-weight: 700 !important;

  letter-spacing: 0.025em;

  text-transform: uppercase;
}

:deep(.users-table tbody td) {
  height: 64px !important;

  padding-left: 14px !important;
  padding-right: 14px !important;

  border-bottom: 1px solid #f0f1f3 !important;

  color: #374151;

  font-size: 0.84rem;
}

:deep(.users-table tbody tr) {
  transition: background-color 0.15s ease;
}

:deep(.users-table tbody tr:hover) {
  background: #f8faf9 !important;
}

/* =========================================================
   USER
========================================================= */

.user-cell {
  display: flex;
  align-items: center;

  gap: 11px;
}

.user-info {
  min-width: 0;
}

.user-name {
  color: #1f2937;

  font-weight: 650;
}

.user-id {
  margin-top: 2px;

  color: #9ca3af;

  font-size: 0.69rem;
}

.avatar-text {
  color: #15803d;

  font-size: 0.7rem;
  font-weight: 750;
}

/* =========================================================
   CARD NUMBER
========================================================= */

.no-card {
  display: flex;
  align-items: center;

  color: #9ca3af;

  font-size: 0.76rem;
}

/* =========================================================
   ACTION
========================================================= */

.view-button {
  text-transform: none;
}

/* =========================================================
   EMPTY STATE
========================================================= */

.empty-state {
  padding: 64px 20px;

  text-align: center;
}

.empty-icon {
  width: 68px;
  height: 68px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin: 0 auto 14px;

  border-radius: 50%;

  background: #f3f4f6;

  color: #9ca3af;
}

.empty-title {
  color: #374151;

  font-size: 1rem;
  font-weight: 700;
}

.empty-description {
  margin-top: 5px;

  color: #9ca3af;

  font-size: 0.8rem;
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 960px) {
  .users-page {
    padding: 16px;
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .table-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .toolbar-actions {
    width: 100%;
  }

  .search-field {
    width: 100%;
  }
}

@media (max-width: 600px) {
  .users-page {
    padding: 10px;
  }

  .page-title {
    font-size: 1.3rem;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .v-btn {
    width: 100%;
  }

  .user-name {
    max-width: 180px;

    overflow: hidden;

    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
