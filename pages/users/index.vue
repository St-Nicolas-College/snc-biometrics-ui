<template>
  <div class="users-page">
    <!-- =========================================================
         PAGE HEADER
    ========================================================== -->
    <div class="page-header">
      <div class="page-heading">
        <div class="page-heading-icon">
          <v-icon size="23">
            mdi-account-group-outline
          </v-icon>
        </div>

        <div>
          <h1 class="page-title">
            Users
          </h1>

          <p class="page-subtitle">
            Manage biometric users registered in the attendance system.
          </p>
        </div>
      </div>

      <div class="header-actions">
        <div
          v-if="lastUpdated"
          class="updated-status"
        >
          <v-icon size="15">
            mdi-clock-outline
          </v-icon>

          Updated
          {{ formatLastUpdated(lastUpdated) }}
        </div>

        <v-btn
          color="primary"
          variant="tonal"
          prepend-icon="mdi-refresh"
          :loading="refreshing"
          class="refresh-header-button"
          @click="initialize(false)"
        >
          Refresh
        </v-btn>
      </div>
    </div>

    <!-- =========================================================
         DIRECTORY OVERVIEW
    ========================================================== -->
    <div class="directory-overview">
      <div class="overview-icon">
        <v-icon size="21">
          mdi-fingerprint
        </v-icon>
      </div>

      <div class="overview-content">
        <div class="overview-label">
          Biometric User Directory
        </div>

        <div class="overview-description">
          ZKTeco registered users and card assignments
        </div>
      </div>

      <div class="overview-spacer" />

      <div class="overview-stat">
        <span class="overview-stat-value">
          {{ userAccountList.length }}
        </span>

        <span class="overview-stat-label">
          Registered
        </span>
      </div>

      <div class="overview-divider" />

      <div class="overview-stat">
        <span class="overview-stat-value text-success">
          {{ cardCoveragePercent }}%
        </span>

        <span class="overview-stat-label">
          Card Coverage
        </span>
      </div>
    </div>

    <!-- =========================================================
         SUMMARY CARDS
    ========================================================== -->
    <v-row class="summary-row">
      <!-- Total Users -->
      <v-col
        cols="12"
        sm="6"
        lg="3"
      >
        <v-card
          elevation="0"
          class="summary-card"
          :class="{
            'summary-card-selected':
              cardFilter === 'all' &&
              roleFilter === 'all'
          }"
          @click="showAllUsers"
        >
          <v-card-text class="summary-content">
            <div class="summary-top">
              <div class="summary-icon icon-total">
                <v-icon size="21">
                  mdi-account-group-outline
                </v-icon>
              </div>

              <div class="summary-tag">
                DIRECTORY
              </div>
            </div>

            <div class="summary-value">
              {{ userAccountList.length }}
            </div>

            <div class="summary-label">
              Total Users
            </div>

            <div class="summary-description">
              Registered biometric users
            </div>

            <div class="summary-footer">
              <span>View all users</span>

              <v-icon size="15">
                mdi-arrow-right
              </v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- With Card -->
      <v-col
        cols="12"
        sm="6"
        lg="3"
      >
        <v-card
          elevation="0"
          class="summary-card"
          :class="{
            'summary-card-selected':
              cardFilter === 'with-card'
          }"
          @click="cardFilter = 'with-card'"
        >
          <v-card-text class="summary-content">
            <div class="summary-top">
              <div class="summary-icon icon-card">
                <v-icon size="21">
                  mdi-card-account-details-outline
                </v-icon>
              </div>

              <div class="summary-tag summary-tag-blue">
                ASSIGNED
              </div>
            </div>

            <div class="summary-value summary-value-blue">
              {{ usersWithCard }}
            </div>

            <div class="summary-label">
              With Card
            </div>

            <div class="summary-description">
              Users with card numbers
            </div>

            <div class="summary-progress">
              <div
                class="summary-progress-bar progress-blue"
                :style="{
                  width: `${cardCoveragePercent}%`
                }"
              />
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Without Card -->
      <v-col
        cols="12"
        sm="6"
        lg="3"
      >
        <v-card
          elevation="0"
          class="summary-card"
          :class="{
            'summary-card-selected':
              cardFilter === 'without-card'
          }"
          @click="cardFilter = 'without-card'"
        >
          <v-card-text class="summary-content">
            <div class="summary-top">
              <div class="summary-icon icon-no-card">
                <v-icon size="21">
                  mdi-card-off-outline
                </v-icon>
              </div>

              <div class="summary-tag summary-tag-warning">
                REVIEW
              </div>
            </div>

            <div class="summary-value text-warning">
              {{ usersWithoutCard }}
            </div>

            <div class="summary-label">
              Without Card
            </div>

            <div class="summary-description">
              No card number assigned
            </div>

            <div class="summary-footer">
              <span>Review missing cards</span>

              <v-icon size="15">
                mdi-arrow-right
              </v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Roles -->
      <v-col
        cols="12"
        sm="6"
        lg="3"
      >
        <v-card
          elevation="0"
          class="summary-card"
        >
          <v-card-text class="summary-content">
            <div class="summary-top">
              <div class="summary-icon icon-role">
                <v-icon size="21">
                  mdi-account-key-outline
                </v-icon>
              </div>

              <div class="summary-tag summary-tag-green">
                ACCESS
              </div>
            </div>

            <div class="summary-value">
              {{ roleCount }}
            </div>

            <div class="summary-label">
              User Roles
            </div>

            <div class="summary-description">
              Role classifications detected
            </div>

            <div class="role-preview">
              <v-chip
                v-for="role in rolePreview"
                :key="role.value"
                size="x-small"
                variant="tonal"
                :color="getRoleColor(role.value)"
              >
                {{ role.title }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- =========================================================
         USER DIRECTORY
    ========================================================== -->
    <v-card
      elevation="0"
      class="users-card"
    >
      <!-- =======================================================
           TOOLBAR
      ======================================================== -->
      <div class="table-toolbar">
        <div class="directory-heading">
          <div class="directory-heading-icon">
            <v-icon size="20">
              mdi-account-box-multiple-outline
            </v-icon>
          </div>

          <div>
            <div class="section-title">
              User Directory
            </div>

            <div class="section-subtitle">
              Browse biometric profiles, card assignments and roles.
            </div>
          </div>
        </div>

        <div class="toolbar-actions">
          <!-- Card Filter -->
          <v-select
            v-model="cardFilter"
            :items="cardFilterOptions"
            item-title="title"
            item-value="value"
            density="compact"
            variant="outlined"
            hide-details
            prepend-inner-icon="mdi-card-account-details-outline"
            class="card-filter"
          />

          <!-- Role Filter -->
          <v-select
            v-model="roleFilter"
            :items="roleFilterOptions"
            item-title="title"
            item-value="value"
            density="compact"
            variant="outlined"
            hide-details
            prepend-inner-icon="mdi-account-key-outline"
            class="role-filter"
          />

          <!-- Search -->
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

      <!-- =======================================================
           RESULTS BAR
      ======================================================== -->
      <div class="results-bar">
        <div class="results-left">
          <div class="results-icon">
            <v-icon size="15">
              mdi-database-outline
            </v-icon>
          </div>

          <span>
            Biometric user records
          </span>
        </div>

        <div class="results-right">
          Showing

          <strong>
            {{ filteredUsers.length }}
          </strong>

          of

          <strong>
            {{ userAccountList.length }}
          </strong>

          users
        </div>
      </div>

      <v-divider />

      <!-- =======================================================
           ERROR
      ======================================================== -->
      <v-alert
        v-if="errorMessage"
        type="error"
        variant="tonal"
        density="comfortable"
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
        :items="filteredUsers"
        :loading="loading"
        density="comfortable"
        :items-per-page="20"
        class="users-table"
      >
        <!-- Loading -->
        <template #loading>
          <v-skeleton-loader
            type="table-row@10"
          />
        </template>

        <!-- =====================================================
             USER
        ====================================================== -->
        <template #[`item.name`]="{ item }">
          <div class="user-cell">
            <div class="user-avatar">
              {{ getInitials(item.name) }}
            </div>

            <div class="user-info">
              <div class="user-name">
                {{
                  item.name ||
                  'Unknown User'
                }}
              </div>

              <div class="user-metadata">
                <span>
                  ID {{ item.user_id }}
                </span>

                <template
                  v-if="
                    item.uid !== null &&
                    item.uid !== undefined
                  "
                >
                  <span class="metadata-dot">
                    •
                  </span>

                  <span>
                    UID {{ item.uid }}
                  </span>
                </template>
              </div>
            </div>
          </div>
        </template>

        <!-- =====================================================
             CARD NUMBER
        ====================================================== -->
        <template #[`item.card_no`]="{ item }">
          <div
            v-if="hasCard(item.card_no)"
            class="card-assigned"
          >
            <div class="card-icon card-icon-assigned">
              <v-icon size="15">
                mdi-card-account-details-outline
              </v-icon>
            </div>

            <div>
              <div class="card-number">
                {{ item.card_no }}
              </div>

              <div class="card-status">
                Assigned
              </div>
            </div>
          </div>

          <div
            v-else
            class="card-assigned"
          >
            <div class="card-icon card-icon-empty">
              <v-icon size="15">
                mdi-card-off-outline
              </v-icon>
            </div>

            <div>
              <div class="no-card-title">
                Not assigned
              </div>

              <div class="card-status">
                No card number
              </div>
            </div>
          </div>
        </template>

        <!-- =====================================================
             ROLE
        ====================================================== -->
        <template #[`item.role`]="{ item }">
          <v-chip
            size="small"
            variant="tonal"
            :color="getRoleColor(item.role)"
            class="role-chip"
          >
            <v-icon
              start
              size="14"
            >
              {{ getRoleIcon(item.role) }}
            </v-icon>

            {{ formatRole(item.role) }}
          </v-chip>
        </template>

        <!-- =====================================================
             ACTION
        ====================================================== -->
        <template #[`item.actions`]="{ item }">
          <div class="action-cell">
            <v-btn
              :to="`/users/${item.user_id}`"
              variant="tonal"
              size="small"
              color="primary"
              class="view-button"
            >
              <v-icon
                start
                size="16"
              >
                mdi-eye-outline
              </v-icon>

              View Profile
            </v-btn>

            <v-btn
              :to="`/users/${item.user_id}`"
              icon
              variant="text"
              size="small"
              color="grey-darken-1"
              class="view-icon-button"
            >
              <v-icon size="17">
                mdi-chevron-right
              </v-icon>

              <v-tooltip
                activator="parent"
                location="left"
              >
                Open user profile
              </v-tooltip>
            </v-btn>
          </div>
        </template>

        <!-- =====================================================
             EMPTY STATE
        ====================================================== -->
        <template #no-data>
          <div class="empty-state">
            <div class="empty-icon">
              <v-icon size="36">
                mdi-account-search-outline
              </v-icon>
            </div>

            <div class="empty-title">
              No users found
            </div>

            <div class="empty-description">
              Try changing the search keyword,
              card status, or role filter.
            </div>

            <v-btn
              v-if="hasActiveFilters"
              color="primary"
              variant="tonal"
              size="small"
              prepend-icon="mdi-filter-remove-outline"
              class="mt-4"
              @click="resetFilters"
            >
              Reset Filters
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck

/* ==========================================================================
   TYPES
============================================================================ */

interface UserAccount {
  user_id: number

  uid?: number | null

  name?: string | null

  card_no?: string | number | null

  role?: string | number | null
}

/* ==========================================================================
   STATE
============================================================================ */

const userAccountList =
  ref<UserAccount[]>([])

const loading =
  ref(true)

const refreshing =
  ref(false)

const search =
  ref('')

const errorMessage =
  ref('')

const lastUpdated =
  ref<Date | null>(null)

const cardFilter =
  ref<
    'all' |
    'with-card' |
    'without-card'
  >('all')

const roleFilter =
  ref('all')

/* ==========================================================================
   TABLE HEADERS
============================================================================ */

const headers = [
  {
    title:
      'User',

    key:
      'name',

    sortable:
      true,

    minWidth:
      260
  },

  {
    title:
      'Card Number',

    key:
      'card_no',

    sortable:
      true,

    minWidth:
      210
  },

  {
    title:
      'Role',

    key:
      'role',

    sortable:
      true,

    width:
      180
  },

  {
    title:
      '',

    key:
      'actions',

    sortable:
      false,

    align:
      'center' as const,

    width:
      190
  }
]

/* ==========================================================================
   FILTER OPTIONS
============================================================================ */

const cardFilterOptions = [
  {
    title:
      'All Card Status',

    value:
      'all'
  },

  {
    title:
      'With Card',

    value:
      'with-card'
  },

  {
    title:
      'Without Card',

    value:
      'without-card'
  }
]

/* ==========================================================================
   HAS CARD
============================================================================ */

const hasCard =
  (
    card?:
      string |
      number |
      null
  ) => {
    if (
      card === null ||
      card === undefined
    ) {
      return false
    }

    const value =
      String(
        card
      ).trim()

    return (
      value !== '' &&
      value !== '0'
    )
  }

/* ==========================================================================
   SUMMARY
============================================================================ */

const usersWithCard =
  computed(
    () => {
      return userAccountList.value
        .filter(
          user =>
            hasCard(
              user.card_no
            )
        )
        .length
    }
  )

const usersWithoutCard =
  computed(
    () => {
      return (
        userAccountList.value.length -
        usersWithCard.value
      )
    }
  )

const roleCount =
  computed(
    () => {
      const roles =
        new Set(
          userAccountList.value
            .map(
              user =>
                String(
                  user.role ??
                  ''
                )
                  .trim()
                  .toLowerCase()
            )
            .filter(
              Boolean
            )
        )

      return roles.size
    }
  )

const cardCoveragePercent =
  computed(
    () => {
      if (
        userAccountList.value.length ===
        0
      ) {
        return 0
      }

      return Math.round(
        (
          usersWithCard.value /
          userAccountList.value.length
        ) *
        100
      )
    }
  )

/* ==========================================================================
   ROLE FORMAT
============================================================================ */

const formatRole =
  (
    role?:
      string |
      number |
      null
  ) => {
    if (
      role === null ||
      role === undefined ||
      String(
        role
      ).trim() === ''
    ) {
      return 'User'
    }

    const value =
      String(
        role
      ).trim()

    /*
    |--------------------------------------------------------------------------
    | ZKTeco Roles
    |--------------------------------------------------------------------------
    |
    | 0  = Normal User
    | 14 = Administrator
    |
    */

    if (
      value === '0'
    ) {
      return 'User'
    }

    if (
      value === '14'
    ) {
      return 'Administrator'
    }

    /*
     * Text-based role.
     */

    if (
      !/^\d+$/.test(
        value
      )
    ) {
      return value
        .replace(
          /[\_-]/g,
          ' '
        )
        .replace(
          /\b\w/g,
          char =>
            char.toUpperCase()
        )
    }

    return (
      `Role ${value}`
    )
  }

/* ==========================================================================
   ROLE COLOR
============================================================================ */

const getRoleColor =
  (
    role?:
      string |
      number |
      null
  ) => {
    const value =
      String(
        role ??
        ''
      )
        .trim()
        .toLowerCase()

    if (
      value === '0'
    ) {
      return 'success'
    }

    if (
      value === '14'
    ) {
      return 'purple'
    }

    if (
      value.includes(
        'admin'
      )
    ) {
      return 'purple'
    }

    if (
      value.includes(
        'teacher'
      ) ||
      value.includes(
        'faculty'
      )
    ) {
      return 'primary'
    }

    if (
      value.includes(
        'employee'
      ) ||
      value.includes(
        'staff'
      ) ||
      value.includes(
        'user'
      )
    ) {
      return 'success'
    }

    return 'blue-grey'
  }

/* ==========================================================================
   ROLE ICON
============================================================================ */

const getRoleIcon =
  (
    role?:
      string |
      number |
      null
  ) => {
    const value =
      String(
        role ??
        ''
      )
        .trim()
        .toLowerCase()

    if (
      value === '14' ||
      value.includes(
        'admin'
      )
    ) {
      return (
        'mdi-shield-account-outline'
      )
    }

    if (
      value.includes(
        'teacher'
      ) ||
      value.includes(
        'faculty'
      )
    ) {
      return (
        'mdi-account-school-outline'
      )
    }

    return (
      'mdi-account-outline'
    )
  }

/* ==========================================================================
   ROLE OPTIONS
============================================================================ */

const roleFilterOptions =
  computed(
    () => {
      const roleMap =
        new Map<
          string,
          string
        >()

      userAccountList.value
        .forEach(
          user => {
            const rawRole =
              String(
                user.role ??
                '0'
              ).trim()

            roleMap.set(
              rawRole,
              formatRole(
                user.role
              )
            )
          }
        )

      const options =
        Array.from(
          roleMap.entries()
        )
          .map(
            (
              [
                value,
                title
              ]
            ) => ({
              title,
              value
            })
          )
          .sort(
            (
              a,
              b
            ) =>
              a.title.localeCompare(
                b.title
              )
          )

      return [
        {
          title:
            'All Roles',

          value:
            'all'
        },

        ...options
      ]
    }
  )

const rolePreview =
  computed(
    () => {
      return roleFilterOptions.value
        .filter(
          role =>
            role.value !==
            'all'
        )
        .slice(
          0,
          3
        )
    }
  )

/* ==========================================================================
   SEARCH + FILTER
============================================================================ */

const filteredUsers =
  computed(
    () => {
      let users = [
        ...userAccountList.value
      ]

      /*
      |--------------------------------------------------------------------------
      | Card Filter
      |--------------------------------------------------------------------------
      */

      if (
        cardFilter.value ===
        'with-card'
      ) {
        users =
          users.filter(
            user =>
              hasCard(
                user.card_no
              )
          )
      }

      if (
        cardFilter.value ===
        'without-card'
      ) {
        users =
          users.filter(
            user =>
              !hasCard(
                user.card_no
              )
          )
      }

      /*
      |--------------------------------------------------------------------------
      | Role Filter
      |--------------------------------------------------------------------------
      */

      if (
        roleFilter.value !==
        'all'
      ) {
        users =
          users.filter(
            user =>
              String(
                user.role ??
                '0'
              ).trim() ===
              roleFilter.value
          )
      }

      /*
      |--------------------------------------------------------------------------
      | Search
      |--------------------------------------------------------------------------
      */

      const keyword =
        search.value
          .trim()
          .toLowerCase()

      if (
        keyword
      ) {
        users =
          users.filter(
            user => {
              const fields = [
                user.name,
                user.user_id,
                user.uid,
                user.card_no,
                formatRole(
                  user.role
                )
              ]

              return fields.some(
                field =>
                  String(
                    field ??
                    ''
                  )
                    .toLowerCase()
                    .includes(
                      keyword
                    )
              )
            }
          )
      }

      return users
    }
  )

/* ==========================================================================
   ACTIVE FILTER
============================================================================ */

const hasActiveFilters =
  computed(
    () => {
      return Boolean(
        search.value ||
        cardFilter.value !==
          'all' ||
        roleFilter.value !==
          'all'
      )
    }
  )

/* ==========================================================================
   SHOW ALL
============================================================================ */

const showAllUsers =
  () => {
    cardFilter.value =
      'all'

    roleFilter.value =
      'all'

    search.value =
      ''
  }

/* ==========================================================================
   RESET FILTERS
============================================================================ */

const resetFilters =
  () => {
    search.value =
      ''

    cardFilter.value =
      'all'

    roleFilter.value =
      'all'
  }

/* ==========================================================================
   FETCH USERS
============================================================================ */

const initialize =
  async (
    showLoader =
      true
  ) => {
    if (
      showLoader
    ) {
      loading.value =
        true
    } else {
      refreshing.value =
        true
    }

    try {
      const result =
        await $fetch<
          UserAccount[]
        >(
          '/api/user-accounts/list'
        )

      userAccountList.value =
        result ??
        []

      lastUpdated.value =
        new Date()

      errorMessage.value =
        ''
    } catch (
      error
    ) {
      console.error(
        'Failed to fetch users:',
        error
      )

      errorMessage.value =
        'Unable to load user accounts.'
    } finally {
      loading.value =
        false

      refreshing.value =
        false
    }
  }

/* ==========================================================================
   USER INITIALS
============================================================================ */

const getInitials =
  (
    name?:
      string |
      null
  ) => {
    if (
      !name
    ) {
      return '?'
    }

    const parts =
      name
        .trim()
        .split(
          /\s+/
        )

    if (
      parts.length ===
      1
    ) {
      return parts[0]
        .substring(
          0,
          2
        )
        .toUpperCase()
    }

    return (
      (
        parts[0]?.[0] ??
        ''
      ) +
      (
        parts[
          parts.length - 1
        ]?.[0] ??
        ''
      )
    ).toUpperCase()
  }

/* ==========================================================================
   LAST UPDATED
============================================================================ */

const formatLastUpdated =
  (
    value:
      Date
  ) => {
    return value
      .toLocaleTimeString(
        'en-PH',
        {
          hour:
            '2-digit',

          minute:
            '2-digit',

          hour12:
            true
        }
      )
  }

/* ==========================================================================
   LIFECYCLE
============================================================================ */

onMounted(
  async () => {
    await initialize(
      true
    )
  }
)
</script>

<style scoped>
/* ==========================================================================
   PAGE
============================================================================ */

.users-page {
  min-height:
    100%;

  padding:
    24px;

  background:
    #f7f9f8;
}

/* ==========================================================================
   HEADER
============================================================================ */

.page-header {
  display:
    flex;

  align-items:
    center;

  justify-content:
    space-between;

  gap:
    20px;

  margin-bottom:
    20px;
}

.page-heading {
  display:
    flex;

  align-items:
    center;

  gap:
    12px;
}

.page-heading-icon {
  width:
    44px;

  height:
    44px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  flex-shrink:
    0;

  border:
    1px solid
    #dceee1;

  border-radius:
    12px;

  background:
    #edf9f1;

  color:
    #15803d;
}

.page-title {
  margin:
    0;

  color:
    #1f2937;

  font-size:
    1.48rem;

  font-weight:
    760;

  line-height:
    1.2;
}

.page-subtitle {
  margin:
    4px
    0
    0;

  color:
    #7d8792;

  font-size:
    0.82rem;
}

.header-actions {
  display:
    flex;

  align-items:
    center;

  gap:
    8px;
}

.updated-status {
  min-height:
    34px;

  display:
    flex;

  align-items:
    center;

  gap:
    7px;

  padding:
    7px
    11px;

  border:
    1px solid
    #e5e7eb;

  border-radius:
    9px;

  background:
    #ffffff;

  color:
    #6b7280;

  font-size:
    0.66rem;

  font-weight:
    600;
}

.refresh-header-button {
  text-transform:
    none;

  font-size:
    0.7rem;

  font-weight:
    650;

  letter-spacing:
    0;
}

/* ==========================================================================
   DIRECTORY OVERVIEW
============================================================================ */

.directory-overview {
  display:
    flex;

  align-items:
    center;

  gap:
    11px;

  margin-bottom:
    20px;

  padding:
    13px
    16px;

  border:
    1px solid
    #dfe9e2;

  border-radius:
    12px;

  background:
    linear-gradient(
      90deg,
      #f4faf6,
      #ffffff
    );
}

.overview-icon {
  width:
    38px;

  height:
    38px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  flex-shrink:
    0;

  border-radius:
    10px;

  background:
    #def3e5;

  color:
    #15803d;
}

.overview-content {
  min-width:
    0;
}

.overview-label {
  color:
    #374151;

  font-size:
    0.73rem;

  font-weight:
    700;
}

.overview-description {
  margin-top:
    2px;

  color:
    #9ca3af;

  font-size:
    0.61rem;
}

.overview-spacer {
  flex:
    1;
}

.overview-stat {
  display:
    flex;

  flex-direction:
    column;

  align-items:
    flex-end;
}

.overview-stat-value {
  color:
    #1f2937;

  font-size:
    0.82rem;

  font-weight:
    760;
}

.overview-stat-label {
  margin-top:
    1px;

  color:
    #9ca3af;

  font-size:
    0.57rem;
}

.overview-divider {
  width:
    1px;

  height:
    28px;

  background:
    #e2e7e4;
}

/* ==========================================================================
   SUMMARY
============================================================================ */

.summary-row {
  margin-bottom:
    16px;
}

.summary-card {
  height:
    100%;

  overflow:
    hidden;

  border:
    1px solid
    #e5e9e6;

  border-radius:
    15px;

  background:
    #ffffff;

  cursor:
    pointer;

  box-shadow:
    0 3px 13px
    rgba(
      15,
      23,
      42,
      0.025
    );

  transition:
    transform
      0.16s ease,
    border-color
      0.16s ease,
    box-shadow
      0.16s ease;
}

.summary-card:hover {
  transform:
    translateY(-3px);

  border-color:
    #d7e8dc;

  box-shadow:
    0 10px 25px
    rgba(
      15,
      23,
      42,
      0.055
    );
}

.summary-card-selected {
  border-color:
    rgba(
      22,
      163,
      74,
      0.3
    );

  box-shadow:
    0 0 0
    2px
    rgba(
      22,
      163,
      74,
      0.05
    );
}

.summary-content {
  padding:
    19px !important;
}

.summary-top {
  display:
    flex;

  align-items:
    center;

  justify-content:
    space-between;

  margin-bottom:
    14px;
}

.summary-icon {
  width:
    42px;

  height:
    42px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  border-radius:
    11px;
}

.icon-total {
  border:
    1px solid
    #d9ecdf;

  background:
    #edf9f1;

  color:
    #15803d;
}

.icon-card {
  border:
    1px solid
    #dbeafe;

  background:
    #eff6ff;

  color:
    #2563eb;
}

.icon-no-card {
  border:
    1px solid
    #fde8c8;

  background:
    #fff8eb;

  color:
    #d97706;
}

.icon-role {
  border:
    1px solid
    #d7efdf;

  background:
    #effbf3;

  color:
    #16a34a;
}

.summary-tag {
  color:
    #9ca3af;

  font-size:
    0.54rem;

  font-weight:
    750;

  letter-spacing:
    0.07em;
}

.summary-tag-blue {
  color:
    #2563eb;
}

.summary-tag-warning {
  color:
    #d97706;
}

.summary-tag-green {
  color:
    #16a34a;
}

.summary-value {
  color:
    #1f2937;

  font-size:
    1.9rem;

  font-weight:
    780;

  line-height:
    1;
}

.summary-value-blue {
  color:
    #2563eb;
}

.summary-label {
  margin-top:
    9px;

  color:
    #374151;

  font-size:
    0.75rem;

  font-weight:
    680;
}

.summary-description {
  margin-top:
    3px;

  color:
    #9ca3af;

  font-size:
    0.66rem;
}

.summary-footer {
  display:
    flex;

  align-items:
    center;

  justify-content:
    space-between;

  margin-top:
    16px;

  padding-top:
    11px;

  border-top:
    1px solid
    #f0f2f1;

  color:
    #9ca3af;

  font-size:
    0.6rem;
}

.summary-progress {
  overflow:
    hidden;

  height:
    4px;

  margin-top:
    17px;

  border-radius:
    10px;

  background:
    #f1f3f2;
}

.summary-progress-bar {
  height:
    100%;

  border-radius:
    inherit;

  transition:
    width
    0.3s ease;
}

.progress-blue {
  background:
    linear-gradient(
      90deg,
      #2563eb,
      #60a5fa
    );
}

.role-preview {
  display:
    flex;

  flex-wrap:
    wrap;

  gap:
    5px;

  margin-top:
    15px;
}

/* ==========================================================================
   USERS CARD
============================================================================ */

.users-card {
  overflow:
    hidden;

  border:
    1px solid
    #e5e9e6;

  border-radius:
    15px;

  background:
    #ffffff;

  box-shadow:
    0 4px 18px
    rgba(
      15,
      23,
      42,
      0.025
    );
}

/* ==========================================================================
   TOOLBAR
============================================================================ */

.table-toolbar {
  min-height:
    74px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    space-between;

  gap:
    20px;

  padding:
    15px
    19px;
}

.directory-heading {
  display:
    flex;

  align-items:
    center;

  gap:
    10px;
}

.directory-heading-icon {
  width:
    39px;

  height:
    39px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  flex-shrink:
    0;

  border:
    1px solid
    #dceee1;

  border-radius:
    10px;

  background:
    #eff9f2;

  color:
    #15803d;
}

.section-title {
  color:
    #1f2937;

  font-size:
    0.94rem;

  font-weight:
    720;
}

.section-subtitle {
  margin-top:
    2px;

  color:
    #9ca3af;

  font-size:
    0.68rem;
}

.toolbar-actions {
  display:
    flex;

  align-items:
    center;

  gap:
    8px;
}

.card-filter {
  width:
    175px;
}

.role-filter {
  width:
    175px;
}

.search-field {
  width:
    260px;
}

:deep(
  .card-filter
  .v-field
),
:deep(
  .role-filter
  .v-field
),
:deep(
  .search-field
  .v-field
) {
  border-radius:
    9px;
}

/* ==========================================================================
   RESULTS BAR
============================================================================ */

.results-bar {
  min-height:
    40px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    space-between;

  gap:
    12px;

  padding:
    8px
    19px;

  border-top:
    1px solid
    #f0f2f1;

  background:
    #fafbfa;

  color:
    #929aa4;

  font-size:
    0.61rem;
}

.results-left {
  display:
    flex;

  align-items:
    center;

  gap:
    7px;
}

.results-icon {
  width:
    24px;

  height:
    24px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  border-radius:
    6px;

  background:
    #edf5ef;

  color:
    #15803d;
}

.results-right strong {
  color:
    #4b5563;
}

/* ==========================================================================
   TABLE
============================================================================ */

:deep(
  .users-table
  thead
  th
) {
  height:
    48px !important;

  padding-left:
    14px !important;

  padding-right:
    14px !important;

  border-bottom:
    1px solid
    #e8ebe9 !important;

  background:
    #fafbfa !important;

  color:
    #667085 !important;

  font-size:
    0.65rem !important;

  font-weight:
    720 !important;

  letter-spacing:
    0.04em;

  text-transform:
    uppercase;
}

:deep(
  .users-table
  tbody
  td
) {
  height:
    66px !important;

  padding-left:
    14px !important;

  padding-right:
    14px !important;

  border-bottom:
    1px solid
    #f0f2f1 !important;

  color:
    #374151;

  font-size:
    0.76rem;
}

:deep(
  .users-table
  tbody
  tr
) {
  transition:
    background-color
    0.15s ease;
}

:deep(
  .users-table
  tbody
  tr:hover
) {
  background:
    #f8fbf9 !important;
}

/* ==========================================================================
   USER CELL
============================================================================ */

.user-cell {
  display:
    flex;

  align-items:
    center;

  gap:
    10px;
}

.user-avatar {
  width:
    38px;

  height:
    38px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  flex-shrink:
    0;

  border:
    1px solid
    #d7eddd;

  border-radius:
    11px;

  background:
    #ebf8ef;

  color:
    #15803d;

  font-size:
    0.67rem;

  font-weight:
    760;
}

.user-info {
  min-width:
    0;
}

.user-name {
  max-width:
    240px;

  overflow:
    hidden;

  color:
    #1f2937;

  font-size:
    0.77rem;

  font-weight:
    680;

  text-overflow:
    ellipsis;

  white-space:
    nowrap;
}

.user-metadata {
  display:
    flex;

  align-items:
    center;

  gap:
    5px;

  margin-top:
    3px;

  color:
    #9ca3af;

  font-size:
    0.59rem;
}

.metadata-dot {
  color:
    #d1d5db;
}

/* ==========================================================================
   CARD NUMBER
============================================================================ */

.card-assigned {
  display:
    flex;

  align-items:
    center;

  gap:
    8px;
}

.card-icon {
  width:
    30px;

  height:
    30px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  flex-shrink:
    0;

  border-radius:
    8px;
}

.card-icon-assigned {
  background:
    #eef5ff;

  color:
    #2563eb;
}

.card-icon-empty {
  background:
    #f6f6f6;

  color:
    #9ca3af;
}

.card-number {
  color:
    #374151;

  font-size:
    0.7rem;

  font-weight:
    660;
}

.no-card-title {
  color:
    #7c8590;

  font-size:
    0.68rem;

  font-weight:
    630;
}

.card-status {
  margin-top:
    2px;

  color:
    #a0a7b0;

  font-size:
    0.56rem;
}

/* ==========================================================================
   ROLE
============================================================================ */

.role-chip {
  font-size:
    0.62rem;
}

/* ==========================================================================
   ACTION
============================================================================ */

.action-cell {
  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  gap:
    3px;
}

.view-button {
  text-transform:
    none;

  font-size:
    0.65rem;

  font-weight:
    650;

  letter-spacing:
    0;
}

.view-icon-button {
  border-radius:
    8px;
}

/* ==========================================================================
   EMPTY
============================================================================ */

.empty-state {
  padding:
    64px
    20px;

  text-align:
    center;
}

.empty-icon {
  width:
    66px;

  height:
    66px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  margin:
    0
    auto
    14px;

  border-radius:
    50%;

  background:
    #f2f6f3;

  color:
    #9fa8a2;
}

.empty-title {
  color:
    #374151;

  font-size:
    0.91rem;

  font-weight:
    700;
}

.empty-description {
  max-width:
    360px;

  margin:
    5px
    auto
    0;

  color:
    #9ca3af;

  font-size:
    0.69rem;

  line-height:
    1.5;
}

/* ==========================================================================
   TABLET
============================================================================ */

@media (
  max-width: 1100px
) {
  .toolbar-actions {
    flex-wrap:
      wrap;

    justify-content:
      flex-end;
  }

  .search-field {
    width:
      230px;
  }
}

@media (
  max-width: 960px
) {
  .users-page {
    padding:
      16px;
  }

  .page-header {
    align-items:
      flex-start;

    flex-direction:
      column;
  }

  .header-actions {
    width:
      100%;
  }

  .directory-overview {
    flex-wrap:
      wrap;
  }

  .overview-spacer {
    display:
      none;
  }

  .overview-stat:first-of-type {
    margin-left:
      auto;
  }

  .table-toolbar {
    align-items:
      stretch;

    flex-direction:
      column;
  }

  .toolbar-actions {
    width:
      100%;

    flex-wrap:
      nowrap;
  }

  .card-filter,
  .role-filter {
    width:
      180px;
  }

  .search-field {
    flex:
      1;

    width:
      auto;
  }

  :deep(
    .users-table
    .v-table__wrapper
  ) {
    overflow-x:
      auto;
  }
}

/* ==========================================================================
   MOBILE
============================================================================ */

@media (
  max-width: 600px
) {
  .users-page {
    padding:
      10px;
  }

  .page-heading {
    align-items:
      flex-start;
  }

  .page-heading-icon {
    width:
      40px;

    height:
      40px;
  }

  .page-title {
    font-size:
      1.2rem;
  }

  .page-subtitle {
    font-size:
      0.7rem;
  }

  .header-actions {
    align-items:
      stretch;

    flex-direction:
      column;
  }

  .updated-status {
    justify-content:
      center;
  }

  .refresh-header-button {
    width:
      100%;
  }

  .directory-overview {
    align-items:
      flex-start;
  }

  .overview-content {
    width:
      calc(
        100% - 50px
      );
  }

  .overview-stat {
    align-items:
      flex-start;

    margin-left:
      49px !important;
  }

  .summary-footer {
    display:
      none;
  }

  .toolbar-actions {
    align-items:
      stretch;

    flex-direction:
      column;
  }

  .card-filter,
  .role-filter,
  .search-field {
    width:
      100%;
  }

  .results-bar {
    align-items:
      flex-start;

    flex-direction:
      column;
  }

  .user-name {
    max-width:
      175px;
  }

  .view-button {
    display:
      none;
  }
}

/* ==========================================================================
   REDUCED MOTION
============================================================================ */

@media (
  prefers-reduced-motion:
  reduce
) {
  .summary-card,
  .summary-progress-bar {
    transition:
      none;
  }
}
</style>