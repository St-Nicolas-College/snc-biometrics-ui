<template>
  <div class="department-page">
    <!-- =========================================================
         PAGE HEADER
    ========================================================== -->
    <div class="page-header mb-6">
      <div>
        <div class="d-flex align-center ga-2 mb-1">
          <v-icon
            color="primary"
            size="28"
          >
            mdi-office-building-outline
          </v-icon>

          <h1 class="page-title">
            Departments
          </h1>
        </div>

        <p class="page-subtitle">
          Create and manage departments used throughout the attendance system.
        </p>
      </div>

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

    <!-- =========================================================
         SUMMARY CARDS
    ========================================================== -->
    <v-row class="mb-5">
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
          <v-card-text>
            <div class="d-flex justify-space-between align-start">
              <div>
                <div class="summary-label">
                  Total Departments
                </div>

                <div class="summary-value">
                  {{ departmentList.length }}
                </div>

                <div class="summary-description">
                  Registered departments
                </div>
              </div>

              <div class="summary-icon icon-primary">
                <v-icon>
                  mdi-office-building-outline
                </v-icon>
              </div>
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
          <v-card-text>
            <div class="d-flex justify-space-between align-start">
              <div class="min-width-0">
                <div class="summary-label">
                  Latest Department
                </div>

                <div class="latest-department">
                  {{ latestDepartment?.dept_code || '—' }}
                </div>

                <div class="summary-description text-truncate">
                  {{ latestDepartment?.dept_name || 'No department yet' }}
                </div>
              </div>

              <div class="summary-icon icon-info">
                <v-icon>
                  mdi-domain-plus
                </v-icon>
              </div>
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
          <v-card-text>
            <div class="d-flex justify-space-between align-start">
              <div>
                <div class="summary-label">
                  With Code
                </div>

                <div class="summary-value text-success">
                  {{ departmentsWithCode }}
                </div>

                <div class="summary-description">
                  Valid department codes
                </div>
              </div>

              <div class="summary-icon icon-success">
                <v-icon>
                  mdi-code-tags-check
                </v-icon>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- System Status -->
      <v-col
        cols="12"
        sm="6"
        lg="3"
      >
        <v-card
          elevation="0"
          class="summary-card"
        >
          <v-card-text>
            <div class="d-flex justify-space-between align-start">
              <div>
                <div class="summary-label">
                  Directory Status
                </div>

                <div class="status-value">
                  Ready
                </div>

                <div class="summary-description">
                  Department directory active
                </div>
              </div>

              <div class="summary-icon icon-success">
                <v-icon>
                  mdi-check-circle-outline
                </v-icon>
              </div>
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
            <div>
              <div class="section-title">
                Create Department
              </div>

              <div class="section-subtitle">
                Add a new department to the system.
              </div>
            </div>

            <div class="card-header-icon">
              <v-icon>
                mdi-office-building-plus-outline
              </v-icon>
            </div>
          </div>

          <v-divider />

          <v-card-text class="pa-5">
            <v-form
              ref="createDeptForm"
              v-model="valid"
              lazy-validation
            >
              <!-- Department Code -->
              <div class="field-label">
                Department Code
              </div>

              <v-text-field
                v-model="deptCode"
                :rules="rules.deptCode"
                placeholder="e.g. IT, HR, FIN"
                prepend-inner-icon="mdi-code-tags"
                variant="outlined"
                density="comfortable"
                clearable
                class="mb-4"
                @update:model-value="normalizeDepartmentCode"
              />

              <!-- Department Name -->
              <div class="field-label">
                Department Name
              </div>

              <v-text-field
                v-model="deptName"
                :rules="rules.deptName"
                placeholder="Enter department name"
                prepend-inner-icon="mdi-office-building-outline"
                variant="outlined"
                density="comfortable"
                clearable
              />

              <!-- Create -->
              <v-btn
                block
                color="primary"
                variant="flat"
                prepend-icon="mdi-plus"
                class="mt-4"
                :loading="creating"
                @click="createDepartment"
              >
                Create Department
              </v-btn>
            </v-form>
          </v-card-text>
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
            <div>
              <div class="section-title">
                Department Directory
              </div>

              <div class="section-subtitle">
                Browse all departments registered in the system.
              </div>
            </div>

            <div class="toolbar-actions">
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

          <!-- Table -->
          <v-data-table
            :headers="deptHeaders"
            :items="departmentList"
            :search="search"
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

            <!-- Code -->
            <template #[`item.dept_code`]="{ item }">
              <v-chip
                size="small"
                variant="tonal"
                color="primary"
              >
                <v-icon
                  start
                  size="14"
                >
                  mdi-code-tags
                </v-icon>

                {{ item.dept_code || '—' }}
              </v-chip>
            </template>

            <!-- Name -->
            <template #[`item.dept_name`]="{ item }">
              <div class="department-name-cell">
                <div class="department-icon">
                  <v-icon size="18">
                    mdi-office-building-outline
                  </v-icon>
                </div>

                <div>
                  <div class="department-name">
                    {{ item.dept_name || 'Unnamed Department' }}
                  </div>

                  <div class="department-subtitle">
                    {{ item.dept_code || 'No code assigned' }}
                  </div>
                </div>
              </div>
            </template>

            <!-- Created -->
            <template #[`item.createdAt`]="{ item }">
              <div
                v-if="item.createdAt"
                class="created-date"
              >
                <div class="created-date-main">
                  {{ formatDate(item.createdAt) }}
                </div>

                <div class="created-date-time">
                  {{ formatTime(item.createdAt) }}
                </div>
              </div>

              <span
                v-else
                class="empty-value"
              >
                —
              </span>
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
/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

interface Department {
  id?: number
  documentId?: string

  dept_code?: string
  dept_name?: string

  createdAt?: string
  updatedAt?: string
}

/*
|--------------------------------------------------------------------------
| State
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Snackbar
|--------------------------------------------------------------------------
*/

const deptSnackbar =
  ref(false)

const snackbarText =
  ref('')

const snackbarColor =
  ref('success')

const snackbarIcon =
  ref('mdi-check-circle')

/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/

const rules = {
  deptCode: [
    (value: string) =>
      !!value?.trim() ||
      'Department code is required',

    (value: string) =>
      value?.trim().length <= 20 ||
      'Department code must not exceed 20 characters'
  ],

  deptName: [
    (value: string) =>
      !!value?.trim() ||
      'Department name is required',

    (value: string) =>
      value?.trim().length <= 150 ||
      'Department name must not exceed 150 characters'
  ]
}

/*
|--------------------------------------------------------------------------
| Headers
|--------------------------------------------------------------------------
*/

const deptHeaders = [
  {
    title: 'Department',
    key: 'dept_name',
    sortable: true
  },

  {
    title: 'Code',
    key: 'dept_code',
    sortable: true,
    width: 150
  },

  {
    title: 'Created',
    key: 'createdAt',
    sortable: true,
    width: 180
  }
]

/*
|--------------------------------------------------------------------------
| Computed
|--------------------------------------------------------------------------
*/

const departmentsWithCode =
  computed(() => {
    return departmentList.value.filter(
      item =>
        Boolean(
          item.dept_code?.trim()
        )
    ).length
  })

const latestDepartment =
  computed<Department | null>(
    () => {
      if (
        departmentList.value.length === 0
      ) {
        return null
      }

      return [...departmentList.value]
        .sort(
          (a, b) => {
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

            return timeB - timeA
          }
        )[0] ?? null
    }
  )

/*
|--------------------------------------------------------------------------
| Snackbar
|--------------------------------------------------------------------------
*/

const showSnackbar =
  (
    message: string,
    color = 'success',
    icon = 'mdi-check-circle'
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

/*
|--------------------------------------------------------------------------
| Normalize Department Code
|--------------------------------------------------------------------------
*/

const normalizeDepartmentCode =
  () => {
    deptCode.value =
      String(
        deptCode.value ?? ''
      )
        .toUpperCase()
        .replace(/\s+/g, '')
}

/*
|--------------------------------------------------------------------------
| Load Departments
|--------------------------------------------------------------------------
*/

const initialize =
  async (
    showLoader = true
  ) => {
    if (showLoader) {
      loading.value = true
    } else {
      refreshing.value = true
    }

    try {
      const result =
        await $fetch<
          Department[]
        >(
          '/api/department/list'
        )

      departmentList.value =
        result ?? []

      errorMessage.value =
        ''
    } catch (error) {
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

/*
|--------------------------------------------------------------------------
| Duplicate Check
|--------------------------------------------------------------------------
*/

const departmentCodeExists =
  computed(() => {
    const code =
      deptCode.value
        .trim()
        .toUpperCase()

    if (!code) {
      return false
    }

    return departmentList.value.some(
      item =>
        String(
          item.dept_code ?? ''
        )
          .trim()
          .toUpperCase() ===
        code
    )
  })

/*
|--------------------------------------------------------------------------
| Create Department
|--------------------------------------------------------------------------
*/

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

    /*
     * Frontend duplicate prevention.
     *
     * Backend should still enforce this
     * as well if dept_code must be unique.
     */
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
            method: 'POST',
            body: payload
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

      await initialize(false)
    } catch (error) {
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

/*
|--------------------------------------------------------------------------
| Date
|--------------------------------------------------------------------------
*/

const formatDate =
  (
    value?: string
  ) => {
    if (!value) {
      return '—'
    }

    const date =
      new Date(value)

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return '—'
    }

    return date.toLocaleDateString(
      'en-PH',
      {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      }
    )
  }

/*
|--------------------------------------------------------------------------
| Time
|--------------------------------------------------------------------------
*/

const formatTime =
  (
    value?: string
  ) => {
    if (!value) {
      return '—'
    }

    const date =
      new Date(value)

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return '—'
    }

    return date.toLocaleTimeString(
      'en-PH',
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }
    )
  }

/*
|--------------------------------------------------------------------------
| Lifecycle
|--------------------------------------------------------------------------
*/

onMounted(
  async () => {
    await initialize(true)
  }
)
</script>

<style scoped>
/* =========================================================
   PAGE
========================================================= */

.department-page {
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

/* =========================================================
   SUMMARY
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

  box-shadow:
    0 8px 24px
    rgba(0, 0, 0, 0.05);
}

.summary-label {
  color: #6b7280;

  font-size: 0.75rem;
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

.status-value {
  margin-top: 7px;

  color: #16a34a;

  font-size: 1.45rem;
  font-weight: 750;
  line-height: 1.1;
}

.latest-department {
  max-width: 170px;

  margin-top: 6px;

  overflow: hidden;

  color: #1f2937;

  font-size: 1.3rem;
  font-weight: 750;

  text-overflow: ellipsis;
  white-space: nowrap;
}

.summary-description {
  max-width: 180px;

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

  flex-shrink: 0;

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

.icon-success {
  color: #16a34a;
  background: #ecfdf5;
}

/* =========================================================
   CONTENT CARD
========================================================= */

.content-card {
  overflow: hidden;

  border: 1px solid #e7e9ed;
  border-radius: 14px;

  background: #ffffff;
}

.create-card {
  min-height: 100%;
}

/* =========================================================
   CARD HEADER
========================================================= */

.card-header {
  min-height: 76px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 16px;

  padding: 16px 20px;
}

.card-header-icon {
  width: 42px;
  height: 42px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border-radius: 11px;

  background: #ecfdf5;

  color: #15803d;
}

.section-title {
  color: #1f2937;

  font-size: 1rem;
  font-weight: 700;
}

.section-subtitle {
  margin-top: 2px;

  color: #9ca3af;

  font-size: 0.78rem;
}

/* =========================================================
   FORM
========================================================= */

.field-label {
  margin-bottom: 7px;

  color: #4b5563;

  font-size: 0.75rem;
  font-weight: 650;
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

.toolbar-actions {
  display: flex;
  align-items: center;
}

.search-field {
  width: 280px;
}

/* =========================================================
   TABLE
========================================================= */

:deep(.department-table thead th) {
  height: 50px !important;

  padding-left: 14px !important;
  padding-right: 14px !important;

  background: #fafafa !important;

  border-bottom:
    1px solid
    #e5e7eb !important;

  color: #4b5563 !important;

  font-size: 0.72rem !important;
  font-weight: 700 !important;

  letter-spacing: 0.02em;

  text-transform: uppercase;
}

:deep(.department-table tbody td) {
  height: 64px !important;

  padding-left: 14px !important;
  padding-right: 14px !important;

  border-bottom:
    1px solid
    #f0f1f3 !important;

  color: #374151;

  font-size: 0.84rem;
}

:deep(.department-table tbody tr) {
  transition:
    background-color
    0.15s ease;
}

:deep(.department-table tbody tr:hover) {
  background:
    #f8faf9 !important;
}

/* =========================================================
   DEPARTMENT
========================================================= */

.department-name-cell {
  display: flex;
  align-items: center;

  gap: 11px;
}

.department-icon {
  width: 36px;
  height: 36px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border-radius: 10px;

  background: #f0fdf4;

  color: #15803d;
}

.department-name {
  color: #1f2937;

  font-weight: 650;
}

.department-subtitle {
  margin-top: 2px;

  color: #9ca3af;

  font-size: 0.68rem;
}

/* =========================================================
   CREATED
========================================================= */

.created-date-main {
  color: #374151;

  font-weight: 600;
}

.created-date-time {
  margin-top: 2px;

  color: #9ca3af;

  font-size: 0.69rem;
}

.empty-value {
  color: #b0b5bd;
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
  .department-page {
    padding: 16px;
  }

  .page-header {
    align-items: flex-start;
  }

  .table-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .toolbar-actions,
  .search-field {
    width: 100%;
  }
}

@media (max-width: 600px) {
  .department-page {
    padding: 10px;
  }

  .page-header {
    flex-direction: column;
  }

  .page-header > .v-btn {
    width: 100%;
  }

  .page-title {
    font-size: 1.3rem;
  }

  .department-name {
    max-width: 180px;

    overflow: hidden;

    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>