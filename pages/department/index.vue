<template>
  <div class="department-page">
    <!-- =========================================================
         PAGE HEADER
    ========================================================== -->
    <div class="page-header">
      <div class="page-heading">
        <div class="page-heading-icon">
          <v-icon size="23">
            mdi-office-building-outline
          </v-icon>
        </div>

        <div>
          <h1 class="page-title">
            Departments
          </h1>

          <p class="page-subtitle">
            Organize and manage departments used throughout the attendance system.
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
          class="refresh-button"
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
          mdi-domain
        </v-icon>
      </div>

      <div class="overview-content">
        <div class="overview-label">
          Department Directory
        </div>

        <div class="overview-description">
          Organizational units available for employee assignment
        </div>
      </div>

      <div class="overview-spacer" />

      <div class="overview-stat">
        <span class="overview-stat-value">
          {{ departmentList.length }}
        </span>

        <span class="overview-stat-label">
          Departments
        </span>
      </div>

      <div class="overview-divider" />

      <div class="overview-stat">
        <span class="overview-stat-value text-success">
          {{ departmentCodeCoverage }}%
        </span>

        <span class="overview-stat-label">
          Code Coverage
        </span>
      </div>
    </div>

    <!-- =========================================================
         SUMMARY CARDS
    ========================================================== -->
    <v-row class="summary-row">
      <!-- Total Departments -->
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
              <div class="summary-icon icon-total">
                <v-icon size="21">
                  mdi-office-building-outline
                </v-icon>
              </div>

              <div class="summary-tag">
                DIRECTORY
              </div>
            </div>

            <div class="summary-value">
              {{ departmentList.length }}
            </div>

            <div class="summary-label">
              Total Departments
            </div>

            <div class="summary-description">
              Registered organizational units
            </div>

            <div class="summary-footer">
              <span>
                Active directory entries
              </span>

              <v-icon size="15">
                mdi-check-circle-outline
              </v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- With Code -->
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
              <div class="summary-icon icon-code">
                <v-icon size="21">
                  mdi-code-tags-check
                </v-icon>
              </div>

              <div class="summary-tag summary-tag-success">
                VALID
              </div>
            </div>

            <div class="summary-value text-success">
              {{ departmentsWithCode }}
            </div>

            <div class="summary-label">
              With Department Code
            </div>

            <div class="summary-description">
              Departments with assigned codes
            </div>

            <div class="summary-progress">
              <div
                class="summary-progress-bar"
                :style="{
                  width: `${departmentCodeCoverage}%`
                }"
              />
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Created This Month -->
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
              <div class="summary-icon icon-new">
                <v-icon size="21">
                  mdi-calendar-plus-outline
                </v-icon>
              </div>

              <div class="summary-tag summary-tag-blue">
                THIS MONTH
              </div>
            </div>

            <div class="summary-value summary-value-blue">
              {{ createdThisMonth }}
            </div>

            <div class="summary-label">
              Newly Created
            </div>

            <div class="summary-description">
              Departments added this month
            </div>

            <div class="summary-footer">
              <span>
                {{ currentMonthLabel }}
              </span>

              <v-icon size="15">
                mdi-calendar-outline
              </v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Latest Department -->
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
              <div class="summary-icon icon-latest">
                <v-icon size="21">
                  mdi-domain-plus
                </v-icon>
              </div>

              <div class="summary-tag summary-tag-purple">
                LATEST
              </div>
            </div>

            <div class="latest-code">
              {{ latestDepartment?.dept_code || '—' }}
            </div>

            <div class="summary-label latest-label">
              {{ latestDepartment?.dept_name || 'No department yet' }}
            </div>

            <div class="summary-description">
              Most recently created department
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- =========================================================
         MAIN CONTENT
    ========================================================== -->
    <v-row>
      <!-- =======================================================
           CREATE DEPARTMENT
      ======================================================== -->
      <v-col
        cols="12"
        lg="4"
      >
        <v-card
          elevation="0"
          class="content-card create-card"
        >
          <div class="card-header">
            <div class="card-heading">
              <div class="card-heading-icon">
                <v-icon size="20">
                  mdi-office-building-plus-outline
                </v-icon>
              </div>

              <div>
                <div class="section-title">
                  Create Department
                </div>

                <div class="section-subtitle">
                  Add a new organizational unit.
                </div>
              </div>
            </div>
          </div>

          <v-divider />

          <v-card-text class="create-content">
            <v-form
              ref="createDeptForm"
              v-model="valid"
              lazy-validation
            >
              <!-- Department Code -->
              <div class="field-group">
                <div class="field-label-row">
                  <div class="field-label">
                    Department Code
                  </div>

                  <div class="field-hint">
                    Required
                  </div>
                </div>

                <v-text-field
                  v-model="deptCode"
                  :rules="rules.deptCode"
                  placeholder="e.g. IT, HR, FIN"
                  prepend-inner-icon="mdi-code-tags"
                  variant="outlined"
                  density="comfortable"
                  clearable
                  counter="20"
                  maxlength="20"
                  hide-details="auto"
                  class="form-input"
                  @update:model-value="normalizeDepartmentCode"
                />

                <div
                  v-if="
                    deptCode &&
                    departmentCodeExists
                  "
                  class="duplicate-warning"
                >
                  <v-icon size="15">
                    mdi-alert-circle-outline
                  </v-icon>

                  This department code already exists.
                </div>

                <div
                  v-else-if="deptCode"
                  class="code-valid"
                >
                  <v-icon size="15">
                    mdi-check-circle-outline
                  </v-icon>

                  Department code is available.
                </div>
              </div>

              <!-- Department Name -->
              <div class="field-group">
                <div class="field-label-row">
                  <div class="field-label">
                    Department Name
                  </div>

                  <div class="field-hint">
                    Required
                  </div>
                </div>

                <v-text-field
                  v-model="deptName"
                  :rules="rules.deptName"
                  placeholder="Enter department name"
                  prepend-inner-icon="mdi-office-building-outline"
                  variant="outlined"
                  density="comfortable"
                  clearable
                  counter="150"
                  maxlength="150"
                  hide-details="auto"
                  class="form-input"
                />
              </div>

              <!-- Preview -->
              <div
                v-if="
                  deptCode ||
                  deptName
                "
                class="department-preview"
              >
                <div class="preview-label">
                  DEPARTMENT PREVIEW
                </div>

                <div class="preview-main">
                  <div class="preview-icon">
                    <v-icon size="21">
                      mdi-office-building-outline
                    </v-icon>
                  </div>

                  <div class="preview-content">
                    <div class="preview-name">
                      {{
                        deptName.trim() ||
                        'Department Name'
                      }}
                    </div>

                    <div class="preview-code">
                      {{
                        deptCode.trim() ||
                        'CODE'
                      }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Create -->
              <v-btn
                block
                color="primary"
                variant="flat"
                prepend-icon="mdi-plus"
                :loading="creating"
                :disabled="departmentCodeExists"
                class="create-button"
                @click="createDepartment"
              >
                Create Department
              </v-btn>
            </v-form>
          </v-card-text>

          <div class="create-card-footer">
            <v-icon size="14">
              mdi-information-outline
            </v-icon>

            Department codes are automatically converted to uppercase.
          </div>
        </v-card>
      </v-col>

      <!-- =======================================================
           DEPARTMENT DIRECTORY
      ======================================================== -->
      <v-col
        cols="12"
        lg="8"
      >
        <v-card
          elevation="0"
          class="content-card"
        >
          <!-- Toolbar -->
          <div class="table-toolbar">
            <div class="card-heading">
              <div class="card-heading-icon">
                <v-icon size="20">
                  mdi-format-list-bulleted-square
                </v-icon>
              </div>

              <div>
                <div class="section-title">
                  Department Directory
                </div>

                <div class="section-subtitle">
                  Browse organizational units registered in the system.
                </div>
              </div>
            </div>

            <div class="toolbar-actions">
              <v-select
                v-model="sortMode"
                :items="sortOptions"
                item-title="title"
                item-value="value"
                density="compact"
                variant="outlined"
                hide-details
                prepend-inner-icon="mdi-sort"
                class="sort-field"
              />

              <v-text-field
                v-model="search"
                density="compact"
                placeholder="Search department..."
                clearable
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                hide-details
                class="search-field"
              />
            </div>
          </div>

          <!-- Results -->
          <div class="results-bar">
            <div class="results-left">
              <div class="results-icon">
                <v-icon size="15">
                  mdi-office-building-outline
                </v-icon>
              </div>

              <span>
                Department directory
              </span>
            </div>

            <div class="results-right">
              Showing

              <strong>
                {{ filteredDepartments.length }}
              </strong>

              of

              <strong>
                {{ departmentList.length }}
              </strong>

              departments
            </div>
          </div>

          <v-divider />

          <!-- Error -->
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

          <!-- Table -->
          <v-data-table
            :headers="deptHeaders"
            :items="filteredDepartments"
            :loading="loading"
            density="comfortable"
            :items-per-page="15"
            class="department-table"
          >
            <!-- Loading -->
            <template #loading>
              <v-skeleton-loader
                type="table-row@8"
              />
            </template>

            <!-- Department -->
            <template #[`item.dept_name`]="{ item }">
              <div class="department-cell">
                <div class="department-avatar">
                  {{
                    getDepartmentInitials(
                      item.dept_name
                    )
                  }}
                </div>

                <div class="department-info">
                  <div class="department-name">
                    {{
                      item.dept_name ||
                      'Unnamed Department'
                    }}
                  </div>

                  <div class="department-subtitle">
                    Organizational Department
                  </div>
                </div>
              </div>
            </template>

            <!-- Code -->
            <template #[`item.dept_code`]="{ item }">
              <div
                v-if="item.dept_code"
                class="code-cell"
              >
                <div class="code-icon">
                  <v-icon size="15">
                    mdi-code-tags
                  </v-icon>
                </div>

                <div>
                  <div class="code-value">
                    {{ item.dept_code }}
                  </div>

                  <div class="code-label">
                    Department Code
                  </div>
                </div>
              </div>

              <div
                v-else
                class="missing-code"
              >
                <v-icon size="15">
                  mdi-alert-circle-outline
                </v-icon>

                No code
              </div>
            </template>

            <!-- Created -->
            <template #[`item.createdAt`]="{ item }">
              <div
                v-if="item.createdAt"
                class="created-cell"
              >
                <div class="created-icon">
                  <v-icon size="15">
                    mdi-calendar-outline
                  </v-icon>
                </div>

                <div>
                  <div class="created-date-main">
                    {{ formatDate(item.createdAt) }}
                  </div>

                  <div class="created-date-time">
                    {{ formatTime(item.createdAt) }}
                  </div>
                </div>
              </div>

              <span
                v-else
                class="empty-value"
              >
                —
              </span>
            </template>

            <!-- Action -->
            <template #[`item.actions`]="{ item }">
              <v-btn
                icon
                variant="text"
                size="small"
                color="grey-darken-1"
                @click="
                  copyDepartmentCode(
                    item.dept_code
                  )
                "
              >
                <v-icon size="17">
                  mdi-content-copy
                </v-icon>

                <v-tooltip
                  activator="parent"
                  location="left"
                >
                  Copy Department Code
                </v-tooltip>
              </v-btn>
            </template>

            <!-- Empty -->
            <template #no-data>
              <div class="empty-state">
                <div class="empty-icon">
                  <v-icon size="36">
                    mdi-office-building-remove-outline
                  </v-icon>
                </div>

                <div class="empty-title">
                  No departments found
                </div>

                <div class="empty-description">
                  Create a department or change your search criteria.
                </div>

                <v-btn
                  v-if="search"
                  color="primary"
                  variant="tonal"
                  size="small"
                  prepend-icon="mdi-magnify-remove-outline"
                  class="mt-4"
                  @click="search = ''"
                >
                  Clear Search
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- =========================================================
         SNACKBAR
    ========================================================== -->
    <v-snackbar
      v-model="deptSnackbar"
      :color="snackbarColor"
      location="top"
      :timeout="3500"
    >
      <div class="d-flex align-center">
        <v-icon class="me-2">
          {{ snackbarIcon }}
        </v-icon>

        {{ snackbarText }}
      </div>

      <template #actions>
        <v-btn
          icon
          size="small"
          @click="deptSnackbar = false"
        >
          <v-icon>
            mdi-close
          </v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
//@ts-nocheck
/* ==========================================================================
   TYPES
============================================================================ */

interface Department {
  id?: number
  documentId?: string

  dept_code?: string
  dept_name?: string

  createdAt?: string
  updatedAt?: string
}

/* ==========================================================================
   STATE
============================================================================ */

const valid =
  ref(false)

const loading =
  ref(true)

const refreshing =
  ref(false)

const creating =
  ref(false)

const search =
  ref('')

const deptCode =
  ref('')

const deptName =
  ref('')

const createDeptForm =
  ref<any>(null)

const departmentList =
  ref<Department[]>([])

const errorMessage =
  ref('')

const lastUpdated =
  ref<Date | null>(null)

const sortMode =
  ref<
    'latest' |
    'oldest' |
    'name-asc' |
    'name-desc' |
    'code-asc'
  >('latest')

/* ==========================================================================
   SNACKBAR
============================================================================ */

const deptSnackbar =
  ref(false)

const snackbarText =
  ref('')

const snackbarColor =
  ref('success')

const snackbarIcon =
  ref('mdi-check-circle')

/* ==========================================================================
   VALIDATION
============================================================================ */

const rules = {
  deptCode: [
    (
      value:
        string
    ) =>
      !!value?.trim() ||
      'Department code is required',

    (
      value:
        string
    ) =>
      value?.trim().length <=
        20 ||
      'Department code must not exceed 20 characters'
  ],

  deptName: [
    (
      value:
        string
    ) =>
      !!value?.trim() ||
      'Department name is required',

    (
      value:
        string
    ) =>
      value?.trim().length <=
        150 ||
      'Department name must not exceed 150 characters'
  ]
}

/* ==========================================================================
   TABLE
============================================================================ */

const deptHeaders = [
  {
    title:
      'Department',

    key:
      'dept_name',

    sortable:
      true,

    minWidth:
      270
  },

  {
    title:
      'Code',

    key:
      'dept_code',

    sortable:
      true,

    width:
      180
  },

  {
    title:
      'Created',

    key:
      'createdAt',

    sortable:
      true,

    width:
      190
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
      60
  }
]

/* ==========================================================================
   SORT OPTIONS
============================================================================ */

const sortOptions = [
  {
    title:
      'Latest First',

    value:
      'latest'
  },

  {
    title:
      'Oldest First',

    value:
      'oldest'
  },

  {
    title:
      'Name A–Z',

    value:
      'name-asc'
  },

  {
    title:
      'Name Z–A',

    value:
      'name-desc'
  },

  {
    title:
      'Code A–Z',

    value:
      'code-asc'
  }
]

/* ==========================================================================
   SUMMARY
============================================================================ */

const departmentsWithCode =
  computed(
    () => {
      return departmentList.value
        .filter(
          item =>
            Boolean(
              item.dept_code
                ?.trim()
            )
        )
        .length
    }
  )

const departmentCodeCoverage =
  computed(
    () => {
      if (
        departmentList.value
          .length ===
        0
      ) {
        return 0
      }

      return Math.round(
        (
          departmentsWithCode.value /
          departmentList.value.length
        ) *
        100
      )
    }
  )

const latestDepartment =
  computed<
    Department |
    null
  >(
    () => {
      if (
        departmentList.value
          .length ===
        0
      ) {
        return null
      }

      return [
        ...departmentList.value
      ]
        .sort(
          (
            a,
            b
          ) => {
            const timeA =
              a.createdAt
                ? new Date(
                    a.createdAt
                  ).getTime()
                : 0

            const timeB =
              b.createdAt
                ? new Date(
                    b.createdAt
                  ).getTime()
                : 0

            return (
              timeB -
              timeA
            )
          }
        )[0] ??
        null
    }
  )

const createdThisMonth =
  computed(
    () => {
      const now =
        new Date()

      return departmentList.value
        .filter(
          item => {
            if (
              !item.createdAt
            ) {
              return false
            }

            const date =
              new Date(
                item.createdAt
              )

            if (
              Number.isNaN(
                date.getTime()
              )
            ) {
              return false
            }

            return (
              date.getFullYear() ===
                now.getFullYear() &&
              date.getMonth() ===
                now.getMonth()
            )
          }
        )
        .length
    }
  )

const currentMonthLabel =
  computed(
    () => {
      return new Date()
        .toLocaleDateString(
          'en-PH',
          {
            month:
              'long',

            year:
              'numeric'
          }
        )
    }
  )

/* ==========================================================================
   SEARCH + SORT
============================================================================ */

const filteredDepartments =
  computed(
    () => {
      let result = [
        ...departmentList.value
      ]

      const keyword =
        search.value
          .trim()
          .toLowerCase()

      if (
        keyword
      ) {
        result =
          result.filter(
            item => {
              const name =
                String(
                  item.dept_name ??
                  ''
                )
                  .toLowerCase()

              const code =
                String(
                  item.dept_code ??
                  ''
                )
                  .toLowerCase()

              return (
                name.includes(
                  keyword
                ) ||
                code.includes(
                  keyword
                )
              )
            }
          )
      }

      result.sort(
        (
          a,
          b
        ) => {
          switch (
            sortMode.value
          ) {
            case 'oldest':
              return (
                getTimestamp(
                  a.createdAt
                ) -
                getTimestamp(
                  b.createdAt
                )
              )

            case 'name-asc':
              return String(
                a.dept_name ??
                ''
              ).localeCompare(
                String(
                  b.dept_name ??
                  ''
                )
              )

            case 'name-desc':
              return String(
                b.dept_name ??
                ''
              ).localeCompare(
                String(
                  a.dept_name ??
                  ''
                )
              )

            case 'code-asc':
              return String(
                a.dept_code ??
                ''
              ).localeCompare(
                String(
                  b.dept_code ??
                  ''
                )
              )

            case 'latest':
            default:
              return (
                getTimestamp(
                  b.createdAt
                ) -
                getTimestamp(
                  a.createdAt
                )
              )
          }
        }
      )

      return result
    }
  )

const getTimestamp =
  (
    value?:
      string
  ) => {
    if (!value) {
      return 0
    }

    const date =
      new Date(
        value
      )

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return 0
    }

    return date.getTime()
  }

/* ==========================================================================
   SNACKBAR
============================================================================ */

const showSnackbar =
  (
    message:
      string,

    color =
      'success',

    icon =
      'mdi-check-circle'
  ) => {
    snackbarText.value =
      message

    snackbarColor.value =
      color

    snackbarIcon.value =
      icon

    deptSnackbar.value =
      true
  }

/* ==========================================================================
   NORMALIZE CODE
============================================================================ */

const normalizeDepartmentCode =
  () => {
    deptCode.value =
      String(
        deptCode.value ??
        ''
      )
        .toUpperCase()
        .replace(
          /\s+/g,
          ''
        )
  }

/* ==========================================================================
   LOAD DEPARTMENTS
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
          Department[]
        >(
          '/api/department/list'
        )

      departmentList.value =
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
        'Failed to fetch departments:',
        error
      )

      errorMessage.value =
        'Unable to load departments.'
    } finally {
      loading.value =
        false

      refreshing.value =
        false
    }
  }

/* ==========================================================================
   DUPLICATE CHECK
============================================================================ */

const departmentCodeExists =
  computed(
    () => {
      const code =
        deptCode.value
          .trim()
          .toUpperCase()

      if (!code) {
        return false
      }

      return departmentList.value
        .some(
          item =>
            String(
              item.dept_code ??
              ''
            )
              .trim()
              .toUpperCase() ===
            code
        )
    }
  )

/* ==========================================================================
   CREATE DEPARTMENT
============================================================================ */

const createDepartment =
  async () => {
    const validation =
      await createDeptForm.value
        ?.validate()

    if (
      !validation?.valid
    ) {
      return
    }

    if (
      departmentCodeExists.value
    ) {
      showSnackbar(
        'Department code already exists.',
        'warning',
        'mdi-alert-outline'
      )

      return
    }

    creating.value =
      true

    try {
      const payload = {
        dept_code:
          deptCode.value
            .trim()
            .toUpperCase(),

        dept_name:
          deptName.value
            .trim()
      }

      const response =
        await $fetch<any>(
          '/api/department/create',
          {
            method:
              'POST',

            body:
              payload
          }
        )

      if (
        response?.status ===
        'fail'
      ) {
        showSnackbar(
          response.message ??
            'Unable to create department.',
          'warning',
          'mdi-alert-outline'
        )

        return
      }

      showSnackbar(
        'Department created successfully.'
      )

      deptCode.value =
        ''

      deptName.value =
        ''

      createDeptForm.value
        ?.resetValidation()

      await initialize(
        false
      )
    } catch (
      error
    ) {
      console.error(
        'Department create error:',
        error
      )

      showSnackbar(
        'Unable to create department.',
        'error',
        'mdi-alert-circle-outline'
      )
    } finally {
      creating.value =
        false
    }
  }

/* ==========================================================================
   COPY CODE
============================================================================ */

const copyDepartmentCode =
  async (
    code?:
      string
  ) => {
    if (!code) {
      return
    }

    try {
      await navigator.clipboard
        .writeText(
          code
        )

      showSnackbar(
        `Department code ${code} copied.`,
        'success',
        'mdi-content-copy'
      )
    } catch (
      error
    ) {
      console.error(
        'Copy code error:',
        error
      )

      showSnackbar(
        'Unable to copy department code.',
        'warning',
        'mdi-alert-outline'
      )
    }
  }

/* ==========================================================================
   INITIALS
============================================================================ */

const getDepartmentInitials =
  (
    name?:
      string
  ) => {
    if (!name) {
      return 'DP'
    }

    const words =
      name
        .trim()
        .split(
          /\s+/
        )

    if (
      words.length ===
      1
    ) {
      return words[0]
        .substring(
          0,
          2
        )
        .toUpperCase()
    }

    return (
      (
        words[0]?.[0] ??
        ''
      ) +
      (
        words[
          words.length -
          1
        ]?.[0] ??
        ''
      )
    ).toUpperCase()
  }

/* ==========================================================================
   DATE
============================================================================ */

const formatDate =
  (
    value?:
      string
  ) => {
    if (!value) {
      return '—'
    }

    const date =
      new Date(
        value
      )

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return '—'
    }

    return date
      .toLocaleDateString(
        'en-PH',
        {
          month:
            'short',

          day:
            '2-digit',

          year:
            'numeric'
        }
      )
  }

/* ==========================================================================
   TIME
============================================================================ */

const formatTime =
  (
    value?:
      string
  ) => {
    if (!value) {
      return '—'
    }

    const date =
      new Date(
        value
      )

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return '—'
    }

    return date
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

.department-page {
  min-height: 100%;
  padding: 24px;
  background: #f7f9f8;
}

/* ==========================================================================
   HEADER
============================================================================ */

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}

.page-heading {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-heading-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid #dceee1;
  border-radius: 12px;
  background: #edf9f1;
  color: #15803d;
}

.page-title {
  margin: 0;
  color: #1f2937;
  font-size: 1.48rem;
  font-weight: 760;
  line-height: 1.2;
}

.page-subtitle {
  margin: 4px 0 0;
  color: #7d8792;
  font-size: .82rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.updated-status {
  min-height: 34px;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 11px;
  border: 1px solid #e5e7eb;
  border-radius: 9px;
  background: #fff;
  color: #6b7280;
  font-size: .65rem;
  font-weight: 600;
}

.refresh-button {
  text-transform: none;
  font-size: .69rem;
  font-weight: 650;
  letter-spacing: 0;
}

/* ==========================================================================
   OVERVIEW
============================================================================ */

.directory-overview {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 20px;
  padding: 13px 16px;
  border: 1px solid #dfe9e2;
  border-radius: 12px;
  background:
    linear-gradient(
      90deg,
      #f4faf6,
      #ffffff
    );
}

.overview-icon {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 10px;
  background: #def3e5;
  color: #15803d;
}

.overview-content {
  min-width: 0;
}

.overview-label {
  color: #374151;
  font-size: .73rem;
  font-weight: 700;
}

.overview-description {
  margin-top: 2px;
  color: #9ca3af;
  font-size: .61rem;
}

.overview-spacer {
  flex: 1;
}

.overview-stat {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.overview-stat-value {
  color: #1f2937;
  font-size: .82rem;
  font-weight: 760;
}

.overview-stat-label {
  margin-top: 1px;
  color: #9ca3af;
  font-size: .57rem;
}

.overview-divider {
  width: 1px;
  height: 28px;
  background: #e2e7e4;
}

/* ==========================================================================
   SUMMARY
============================================================================ */

.summary-row {
  margin-bottom: 16px;
}

.summary-card {
  height: 100%;
  overflow: hidden;
  border: 1px solid #e5e9e6;
  border-radius: 15px;
  background: #ffffff;
  box-shadow:
    0 3px 13px
    rgba(15,23,42,.025);
  transition:
    transform .16s ease,
    box-shadow .16s ease,
    border-color .16s ease;
}

.summary-card:hover {
  transform: translateY(-3px);
  border-color: #d7e8dc;
  box-shadow:
    0 10px 25px
    rgba(15,23,42,.055);
}

.summary-content {
  padding: 19px !important;
}

.summary-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.summary-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
}

.icon-total {
  border: 1px solid #d9ecdf;
  background: #edf9f1;
  color: #15803d;
}

.icon-code {
  border: 1px solid #d7efdf;
  background: #effbf3;
  color: #16a34a;
}

.icon-new {
  border: 1px solid #dbeafe;
  background: #eff6ff;
  color: #2563eb;
}

.icon-latest {
  border: 1px solid #ede9fe;
  background: #f5f3ff;
  color: #7c3aed;
}

.summary-tag {
  color: #9ca3af;
  font-size: .54rem;
  font-weight: 750;
  letter-spacing: .07em;
}

.summary-tag-success {
  color: #16a34a;
}

.summary-tag-blue {
  color: #2563eb;
}

.summary-tag-purple {
  color: #7c3aed;
}

.summary-value {
  color: #1f2937;
  font-size: 1.9rem;
  font-weight: 780;
  line-height: 1;
}

.summary-value-blue {
  color: #2563eb;
}

.latest-code {
  max-width: 180px;
  overflow: hidden;
  color: #7c3aed;
  font-size: 1.32rem;
  font-weight: 780;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.summary-label {
  margin-top: 9px;
  color: #374151;
  font-size: .75rem;
  font-weight: 680;
}

.latest-label {
  max-width: 210px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.summary-description {
  margin-top: 3px;
  color: #9ca3af;
  font-size: .66rem;
}

.summary-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 11px;
  border-top: 1px solid #f0f2f1;
  color: #9ca3af;
  font-size: .6rem;
}

.summary-progress {
  overflow: hidden;
  height: 4px;
  margin-top: 17px;
  border-radius: 10px;
  background: #f1f3f2;
}

.summary-progress-bar {
  height: 100%;
  border-radius: inherit;
  background:
    linear-gradient(
      90deg,
      #16a34a,
      #4ade80
    );
  transition: width .25s ease;
}

/* ==========================================================================
   CONTENT CARD
============================================================================ */

.content-card {
  height: 100%;
  overflow: hidden;
  border: 1px solid #e5e9e6;
  border-radius: 15px;
  background: #ffffff;
  box-shadow:
    0 4px 17px
    rgba(15,23,42,.025);
}

/* ==========================================================================
   CARD HEADERS
============================================================================ */

.card-header,
.table-toolbar {
  min-height: 74px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 15px 19px;
}

.card-heading {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-heading-icon {
  width: 39px;
  height: 39px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid #dceee1;
  border-radius: 10px;
  background: #eff9f2;
  color: #15803d;
}

.section-title {
  color: #1f2937;
  font-size: .94rem;
  font-weight: 720;
}

.section-subtitle {
  margin-top: 2px;
  color: #9ca3af;
  font-size: .67rem;
}

/* ==========================================================================
   CREATE FORM
============================================================================ */

.create-card {
  display: flex;
  flex-direction: column;
}

.create-content {
  flex: 1;
  padding: 19px !important;
}

.field-group {
  margin-bottom: 18px;
}

.field-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 7px;
}

.field-label {
  color: #4b5563;
  font-size: .69rem;
  font-weight: 650;
}

.field-hint {
  color: #a0a7b0;
  font-size: .56rem;
  text-transform: uppercase;
}

:deep(.form-input .v-field) {
  border-radius: 9px;
}

.duplicate-warning,
.code-valid {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 7px;
  font-size: .59rem;
  font-weight: 600;
}

.duplicate-warning {
  color: #d97706;
}

.code-valid {
  color: #16a34a;
}

/* ==========================================================================
   PREVIEW
============================================================================ */

.department-preview {
  margin-top: 4px;
  padding: 13px;
  border: 1px solid #dcece1;
  border-radius: 11px;
  background: #f5faf7;
}

.preview-label {
  color: #93a099;
  font-size: .54rem;
  font-weight: 700;
  letter-spacing: .07em;
}

.preview-main {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.preview-icon {
  width: 39px;
  height: 39px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 10px;
  background: #dff2e4;
  color: #15803d;
}

.preview-content {
  min-width: 0;
}

.preview-name {
  overflow: hidden;
  color: #374151;
  font-size: .71rem;
  font-weight: 680;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-code {
  margin-top: 3px;
  color: #15803d;
  font-size: .59rem;
  font-weight: 750;
  letter-spacing: .05em;
}

.create-button {
  min-height: 42px;
  margin-top: 20px;
  text-transform: none;
  font-size: .7rem;
  font-weight: 650;
  letter-spacing: 0;
}

.create-card-footer {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 11px 18px;
  border-top: 1px solid #edf0ee;
  background: #fafbfa;
  color: #9ca3af;
  font-size: .57rem;
}

/* ==========================================================================
   TOOLBAR
============================================================================ */

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-field {
  width: 170px;
}

.search-field {
  width: 245px;
}

:deep(.sort-field .v-field),
:deep(.search-field .v-field) {
  border-radius: 9px;
}

/* ==========================================================================
   RESULTS BAR
============================================================================ */

.results-bar {
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 19px;
  border-top: 1px solid #f0f2f1;
  background: #fafbfa;
  color: #929aa4;
  font-size: .61rem;
}

.results-left {
  display: flex;
  align-items: center;
  gap: 7px;
}

.results-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: #edf5ef;
  color: #15803d;
}

.results-right strong {
  color: #4b5563;
}

/* ==========================================================================
   TABLE
============================================================================ */

:deep(.department-table thead th) {
  height: 48px !important;
  padding-left: 13px !important;
  padding-right: 13px !important;
  border-bottom: 1px solid #e8ebe9 !important;
  background: #fafbfa !important;
  color: #667085 !important;
  font-size: .65rem !important;
  font-weight: 720 !important;
  letter-spacing: .04em;
  text-transform: uppercase;
}

:deep(.department-table tbody td) {
  height: 66px !important;
  padding-left: 13px !important;
  padding-right: 13px !important;
  border-bottom: 1px solid #f0f2f1 !important;
  color: #374151;
  font-size: .75rem;
}

:deep(.department-table tbody tr) {
  transition: background-color .15s ease;
}

:deep(.department-table tbody tr:hover) {
  background: #f8fbf9 !important;
}

/* ==========================================================================
   DEPARTMENT CELL
============================================================================ */

.department-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.department-avatar {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid #d7eddd;
  border-radius: 11px;
  background: #ebf8ef;
  color: #15803d;
  font-size: .63rem;
  font-weight: 760;
}

.department-info {
  min-width: 0;
}

.department-name {
  max-width: 260px;
  overflow: hidden;
  color: #1f2937;
  font-size: .76rem;
  font-weight: 680;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.department-subtitle {
  margin-top: 2px;
  color: #9ca3af;
  font-size: .58rem;
}

/* ==========================================================================
   CODE
============================================================================ */

.code-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.code-icon {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 8px;
  background: #edf8f0;
  color: #15803d;
}

.code-value {
  color: #374151;
  font-size: .7rem;
  font-weight: 720;
}

.code-label {
  margin-top: 2px;
  color: #9ca3af;
  font-size: .54rem;
}

.missing-code {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #d97706;
  font-size: .63rem;
}

/* ==========================================================================
   CREATED
============================================================================ */

.created-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.created-icon {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 8px;
  background: #f1f3f2;
  color: #6b7280;
}

.created-date-main {
  color: #374151;
  font-size: .67rem;
  font-weight: 630;
}

.created-date-time {
  margin-top: 2px;
  color: #9ca3af;
  font-size: .55rem;
}

.empty-value {
  color: #c1c6cc;
}

/* ==========================================================================
   EMPTY
============================================================================ */

.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 13px;
  border-radius: 50%;
  background: #f2f6f3;
  color: #9fa8a2;
}

.empty-title {
  color: #374151;
  font-size: .9rem;
  font-weight: 700;
}

.empty-description {
  max-width: 350px;
  margin: 5px auto 0;
  color: #9ca3af;
  font-size: .68rem;
  line-height: 1.5;
}

/* ==========================================================================
   TABLET
============================================================================ */

@media (max-width: 1100px) {
  .toolbar-actions {
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .search-field {
    width: 220px;
  }
}

@media (max-width: 960px) {
  .department-page {
    padding: 16px;
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }

  .directory-overview {
    flex-wrap: wrap;
  }

  .overview-spacer {
    display: none;
  }

  .table-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .toolbar-actions {
    width: 100%;
    flex-wrap: nowrap;
  }

  .sort-field {
    width: 180px;
  }

  .search-field {
    flex: 1;
    width: auto;
  }

  :deep(.department-table .v-table__wrapper) {
    overflow-x: auto;
  }
}

/* ==========================================================================
   MOBILE
============================================================================ */

@media (max-width: 600px) {
  .department-page {
    padding: 10px;
  }

  .page-heading {
    align-items: flex-start;
  }

  .page-heading-icon {
    width: 40px;
    height: 40px;
  }

  .page-title {
    font-size: 1.2rem;
  }

  .page-subtitle {
    font-size: .7rem;
  }

  .header-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .updated-status {
    justify-content: center;
  }

  .refresh-button {
    width: 100%;
  }

  .directory-overview {
    align-items: flex-start;
  }

  .overview-content {
    width: calc(100% - 50px);
  }

  .overview-stat {
    align-items: flex-start;
    margin-left: 49px;
  }

  .summary-footer {
    display: none;
  }

  .toolbar-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .sort-field,
  .search-field {
    width: 100%;
  }

  .results-bar {
    align-items: flex-start;
    flex-direction: column;
  }

  .department-name {
    max-width: 180px;
  }
}

/* ==========================================================================
   REDUCED MOTION
============================================================================ */

@media (prefers-reduced-motion: reduce) {
  .summary-card,
  .summary-progress-bar {
    transition: none;
  }
}
</style>