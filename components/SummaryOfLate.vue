<template>
  <div class="late-summary-report">
    <!-- =========================================================
         SUMMARY CARDS
    ========================================================== -->
    <v-row class="mb-5">
      <!-- Employees -->
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
                  Late Employees
                </div>

                <div class="summary-value">
                  {{ summary.length }}
                </div>

                <div class="summary-description">
                  Employees with recorded lateness
                </div>
              </div>

              <div class="summary-icon icon-primary">
                <v-icon>
                  mdi-account-clock-outline
                </v-icon>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Total Minutes -->
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
                  Total Late
                </div>

                <div class="summary-value text-error">
                  {{ totalLateMinutes }}
                </div>

                <div class="summary-description">
                  Minutes of accumulated lateness
                </div>
              </div>

              <div class="summary-icon icon-error">
                <v-icon>
                  mdi-clock-alert-outline
                </v-icon>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Average -->
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
                  Average Late
                </div>

                <div class="summary-value text-warning">
                  {{ averageLateMinutes }}
                </div>

                <div class="summary-description">
                  Average minutes per employee
                </div>
              </div>

              <div class="summary-icon icon-warning">
                <v-icon>
                  mdi-timer-outline
                </v-icon>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Highest -->
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
                  Highest Late
                </div>

                <div class="summary-value">
                  {{ highestLateMinutes }}
                </div>

                <div class="summary-description">
                  Maximum late minutes recorded
                </div>
              </div>

              <div class="summary-icon icon-info">
                <v-icon>
                  mdi-chart-line-variant
                </v-icon>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- =========================================================
         DATE FILTER
    ========================================================== -->
    <v-card
      elevation="0"
      class="filter-card mb-5"
    >
      <div class="card-header">
        <div>
          <div class="section-title">
            Late Summary Period
          </div>

          <div class="section-subtitle">
            Select the date range to calculate employee lateness.
          </div>
        </div>

        <v-chip
          v-if="hasGeneratedReport"
          size="small"
          variant="tonal"
          color="success"
        >
          <v-icon
            start
            size="14"
          >
            mdi-check-circle-outline
          </v-icon>

          Report Generated
        </v-chip>
      </div>

      <v-divider />

      <v-card-text class="pa-5">
        <v-row align="end">
          <!-- Start Date -->
          <v-col
            cols="12"
            sm="6"
            md="4"
          >
            <div class="field-label">
              Start Date
            </div>

            <v-date-input
              v-model="dateStart"
              density="comfortable"
              placeholder="Select start date"
              prepend-icon=""
              prepend-inner-icon="mdi-calendar-start-outline"
              variant="outlined"
              hide-details
            />
          </v-col>

          <!-- End Date -->
          <v-col
            cols="12"
            sm="6"
            md="4"
          >
            <div class="field-label">
              End Date
            </div>

            <v-date-input
              v-model="dateEnd"
              density="comfortable"
              placeholder="Select end date"
              prepend-icon=""
              prepend-inner-icon="mdi-calendar-end-outline"
              variant="outlined"
              hide-details
            />
          </v-col>

          <!-- Buttons -->
          <v-col
            cols="12"
            md="4"
          >
            <div class="filter-actions">
              <v-btn
                color="primary"
                variant="flat"
                prepend-icon="mdi-file-chart-outline"
                :loading="loading"
                @click="searchSummaryOfLate"
              >
                Generate Report
              </v-btn>

              <v-btn
                color="grey-darken-1"
                variant="outlined"
                prepend-icon="mdi-filter-remove-outline"
                :disabled="
                  !dateStart &&
                  !dateEnd &&
                  summary.length === 0
                "
                @click="clearReport"
              >
                Clear
              </v-btn>
            </div>
          </v-col>
        </v-row>

        <!-- Active Period -->
        <div
          v-if="hasGeneratedReport"
          class="selected-range mt-4"
        >
          <v-icon
            size="17"
            color="primary"
            class="me-2"
          >
            mdi-calendar-range
          </v-icon>

          Late summary period:

          <strong class="mx-1">
            {{ formatSelectedDate(dateStart) }}
          </strong>

          to

          <strong class="ms-1">
            {{ formatSelectedDate(dateEnd) }}
          </strong>
        </div>
      </v-card-text>
    </v-card>

    <!-- =========================================================
         ERROR
    ========================================================== -->
    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      closable
      class="mb-5"
      @click:close="errorMessage = ''"
    >
      {{ errorMessage }}
    </v-alert>

    <!-- =========================================================
         TABLE
    ========================================================== -->
    <v-card
      elevation="0"
      class="report-table-card"
    >
      <div class="table-toolbar">
        <div>
          <div class="section-title">
            Employee Late Summary
          </div>

          <div class="section-subtitle">
            Consolidated late attendance for the selected period.
          </div>
        </div>

        <v-text-field
          v-model="search"
          density="compact"
          placeholder="Search employee..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          clearable
          hide-details
          class="search-field"
        />
      </div>

      <v-divider />

      <v-data-table
        :items="summary"
        :headers="headers"
        :search="search"
        :loading="loading"
        :sort-by="defaultSort"
        density="comfortable"
        :items-per-page="20"
        class="late-summary-table"
      >
        <!-- Loading -->
        <template #loading>
          <v-skeleton-loader
            type="table-row@10"
          />
        </template>

        <!-- =====================================================
             EMPLOYEE
        ====================================================== -->
        <template #[`item.employee_name`]="{ item }">
          <div class="employee-cell">
            <v-avatar
              size="36"
              color="green-lighten-5"
            >
              <span class="avatar-text">
                {{ getInitials(item.employee_name) }}
              </span>
            </v-avatar>

            <div class="employee-info">
              <div class="employee-name">
                {{ item.employee_name || 'Unknown Employee' }}
              </div>

              <div class="employee-subtitle">
                User ID {{ item.user_id }}
              </div>
            </div>
          </div>
        </template>

        <!-- =====================================================
             CUTOFF PERIOD
        ====================================================== -->
        <template #[`item.cutoff_date`]="{ item }">
          <div class="period-cell">
            <div class="period-main">
              {{ formatDate(item.cutoff_start) }}
            </div>

            <div class="period-separator">
              to
            </div>

            <div class="period-main">
              {{ formatDate(item.cutoff_end) }}
            </div>
          </div>
        </template>

        <!-- =====================================================
             LATE MINUTES
        ====================================================== -->
        <template #[`item.late_minutes`]="{ item }">
          <v-chip
            v-if="Number(item.late_minutes ?? 0) > 0"
            size="small"
            variant="tonal"
            :color="getLateColor(item.late_minutes)"
          >
            <v-icon
              start
              size="14"
            >
              mdi-clock-alert-outline
            </v-icon>

            {{ item.late_minutes }} min
          </v-chip>

          <v-chip
            v-else
            size="small"
            variant="tonal"
            color="success"
          >
            <v-icon
              start
              size="14"
            >
              mdi-check-circle-outline
            </v-icon>

            On Time
          </v-chip>
        </template>

        <!-- =====================================================
             LEVEL
        ====================================================== -->
        <template #[`item.level`]="{ item }">
          <v-chip
            size="small"
            variant="tonal"
            :color="getLateLevel(item.late_minutes).color"
          >
            {{ getLateLevel(item.late_minutes).label }}
          </v-chip>
        </template>

        <!-- =====================================================
             NO DATA
        ====================================================== -->
        <template #no-data>
          <div class="empty-state">
            <div class="empty-icon">
              <v-icon size="36">
                mdi-clock-check-outline
              </v-icon>
            </div>

            <div class="empty-title">
              No late records found
            </div>

            <div class="empty-description">
              Select a date range and generate the late summary report.
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

interface LateSummary {
  user_id: number

  employee_name?: string

  cutoff_start?: string
  cutoff_end?: string

  late_minutes?: number | string
}

/*
|--------------------------------------------------------------------------
| API Response
|--------------------------------------------------------------------------
*/

interface LateSummaryResponse {
  data?: LateSummary[]
}

/*
|--------------------------------------------------------------------------
| State
|--------------------------------------------------------------------------
*/

const dateStart =
  ref<Date | null>(null)

const dateEnd =
  ref<Date | null>(null)

const search =
  ref('')

const loading =
  ref(false)

const summary =
  ref<LateSummary[]>([])

const errorMessage =
  ref('')

const hasGeneratedReport =
  ref(false)

/*
|--------------------------------------------------------------------------
| Headers
|--------------------------------------------------------------------------
*/

const headers = [
  {
    title: 'Employee',
    key: 'employee_name',
    sortable: true
  },

  {
    title: 'Report Period',
    key: 'cutoff_date',
    sortable: false,
    width: 240
  },

  {
    title: 'Late Minutes',
    key: 'late_minutes',
    sortable: true,
    width: 160
  },

  {
    title: 'Late Level',
    key: 'level',
    sortable: false,
    width: 140
  }
]

/*
|--------------------------------------------------------------------------
| Default Sort
|--------------------------------------------------------------------------
*/

const defaultSort =
  ref([
    {
      key: 'late_minutes',
      order: 'desc' as const
    }
  ])

/*
|--------------------------------------------------------------------------
| Summary Statistics
|--------------------------------------------------------------------------
*/

const totalLateMinutes =
  computed(() => {
    return summary.value.reduce(
      (
        total,
        item
      ) => {
        return (
          total +
          Number(
            item.late_minutes ??
            0
          )
        )
      },
      0
    )
  })

const averageLateMinutes =
  computed(() => {
    if (
      summary.value.length === 0
    ) {
      return 0
    }

    return Math.round(
      totalLateMinutes.value /
      summary.value.length
    )
  })

const highestLateMinutes =
  computed(() => {
    if (
      summary.value.length === 0
    ) {
      return 0
    }

    return Math.max(
      ...summary.value.map(
        item =>
          Number(
            item.late_minutes ??
            0
          )
      )
    )
  })

/*
|--------------------------------------------------------------------------
| Search Date Format
|--------------------------------------------------------------------------
|
| Current backend endpoint expects:
|
| DD/MM/YYYY
|
*/

const formatSearchDate =
  (
    value: Date
  ) => {
    return value.toLocaleDateString(
      'en-GB'
    )
  }

/*
|--------------------------------------------------------------------------
| Generate Report
|--------------------------------------------------------------------------
*/

const searchSummaryOfLate =
  async () => {
    errorMessage.value =
      ''

    if (
      !dateStart.value ||
      !dateEnd.value
    ) {
      errorMessage.value =
        'Please select both the start date and end date.'

      return
    }

    if (
      dateStart.value >
      dateEnd.value
    ) {
      errorMessage.value =
        'Start date cannot be later than the end date.'

      return
    }

    loading.value =
      true

    try {
      const formattedDateStart =
        formatSearchDate(
          dateStart.value
        )

      const formattedDateEnd =
        formatSearchDate(
          dateEnd.value
        )

      const result =
        await $fetch<
          LateSummaryResponse |
          LateSummary[]
        >(
          `/api/attendance/late-summary?start=${encodeURIComponent(
            formattedDateStart
          )}&end=${encodeURIComponent(
            formattedDateEnd
          )}`
        )

      /*
       * Your current backend previously returned:
       *
       * {
       *   data: [...]
       * }
       *
       * This also supports an array response
       * in case the API is changed later.
       */

      if (
        Array.isArray(result)
      ) {
        summary.value =
          result
      } else {
        summary.value =
          result?.data ??
          []
      }

      hasGeneratedReport.value =
        true
    } catch (error) {
      console.error(
        'Late summary error:',
        error
      )

      summary.value =
        []

      hasGeneratedReport.value =
        false

      errorMessage.value =
        'Unable to generate the late summary report.'
    } finally {
      loading.value =
        false
    }
  }

/*
|--------------------------------------------------------------------------
| Clear Report
|--------------------------------------------------------------------------
*/

const clearReport =
  () => {
    dateStart.value =
      null

    dateEnd.value =
      null

    search.value =
      ''

    summary.value =
      []

    errorMessage.value =
      ''

    hasGeneratedReport.value =
      false
  }

/*
|--------------------------------------------------------------------------
| Initials
|--------------------------------------------------------------------------
*/

const getInitials =
  (
    name?: string
  ) => {
    if (!name) {
      return '?'
    }

    const parts =
      name
        .trim()
        .split(/\s+/)

    if (
      parts.length === 1
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

/*
|--------------------------------------------------------------------------
| Date Parser
|--------------------------------------------------------------------------
*/

const parseDateValue =
  (
    value?: string
  ) => {
    if (!value) {
      return null
    }

    const dateOnly =
      value.match(
        /^(\d{4})-(\d{2})-(\d{2})$/
      )

    if (dateOnly) {
      return new Date(
        Number(dateOnly[1]),
        Number(dateOnly[2]) - 1,
        Number(dateOnly[3])
      )
    }

    const date =
      new Date(value)

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return null
    }

    return date
  }

/*
|--------------------------------------------------------------------------
| Format Date
|--------------------------------------------------------------------------
*/

const formatDate =
  (
    value?: string
  ) => {
    const date =
      parseDateValue(value)

    if (!date) {
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
| Selected Date
|--------------------------------------------------------------------------
*/

const formatSelectedDate =
  (
    value: Date | null
  ) => {
    if (!value) {
      return '—'
    }

    return value.toLocaleDateString(
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
| Late Level
|--------------------------------------------------------------------------
|
| These levels are presentation labels only.
| They do not change the backend computation.
|
*/

const getLateLevel =
  (
    value?: number | string
  ) => {
    const minutes =
      Number(
        value ??
        0
      )

    if (
      minutes <= 0
    ) {
      return {
        label: 'On Time',
        color: 'success'
      }
    }

    if (
      minutes <= 15
    ) {
      return {
        label: 'Minor',
        color: 'warning'
      }
    }

    if (
      minutes <= 30
    ) {
      return {
        label: 'Moderate',
        color: 'orange'
      }
    }

    return {
      label: 'High',
      color: 'error'
    }
  }

/*
|--------------------------------------------------------------------------
| Late Color
|--------------------------------------------------------------------------
*/

const getLateColor =
  (
    value?: number | string
  ) => {
    const minutes =
      Number(
        value ??
        0
      )

    if (
      minutes <= 0
    ) {
      return 'success'
    }

    if (
      minutes <= 15
    ) {
      return 'warning'
    }

    if (
      minutes <= 30
    ) {
      return 'orange'
    }

    return 'error'
  }
</script>

<style scoped>
/* =========================================================
   COMPONENT
========================================================= */

.late-summary-report {
  width: 100%;
}

/* =========================================================
   SUMMARY
========================================================= */

.summary-card {
  height: 100%;

  border: 1px solid #e7e9ed;
  border-radius: 12px;

  background: #ffffff;
}

.summary-label {
  color: #6b7280;

  font-size: 0.72rem;
  font-weight: 700;

  letter-spacing: 0.04em;

  text-transform: uppercase;
}

.summary-value {
  margin-top: 5px;

  color: #1f2937;

  font-size: 1.8rem;
  font-weight: 750;
  line-height: 1.1;
}

.summary-description {
  margin-top: 5px;

  color: #9ca3af;

  font-size: 0.71rem;
}

.summary-icon {
  width: 42px;
  height: 42px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 11px;
}

.icon-primary {
  color: #15803d;
  background: #ecfdf5;
}

.icon-error {
  color: #dc2626;
  background: #fef2f2;
}

.icon-warning {
  color: #d97706;
  background: #fffbeb;
}

.icon-info {
  color: #2563eb;
  background: #eff6ff;
}

/* =========================================================
   CARDS
========================================================= */

.filter-card,
.report-table-card {
  overflow: hidden;

  border: 1px solid #e7e9ed;
  border-radius: 12px;

  background: #ffffff;
}

/* =========================================================
   HEADER / TOOLBAR
========================================================= */

.card-header,
.table-toolbar {
  min-height: 72px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 16px;

  padding: 15px 18px;
}

.section-title {
  color: #1f2937;

  font-size: 0.95rem;
  font-weight: 700;
}

.section-subtitle {
  margin-top: 2px;

  color: #9ca3af;

  font-size: 0.76rem;
}

/* =========================================================
   FILTER
========================================================= */

.field-label {
  margin-bottom: 7px;

  color: #4b5563;

  font-size: 0.74rem;
  font-weight: 650;
}

.filter-actions {
  display: flex;
  align-items: center;

  gap: 10px;
}

.selected-range {
  display: inline-flex;
  align-items: center;

  padding: 8px 12px;

  border-radius: 8px;

  background: #f0fdf4;

  color: #4b5563;

  font-size: 0.78rem;
}

/* =========================================================
   SEARCH
========================================================= */

.search-field {
  width: 280px;
}

/* =========================================================
   TABLE
========================================================= */

:deep(.late-summary-table thead th) {
  height: 50px !important;

  padding-left: 14px !important;
  padding-right: 14px !important;

  background: #fafafa !important;

  border-bottom:
    1px solid
    #e5e7eb !important;

  color: #4b5563 !important;

  font-size: 0.71rem !important;
  font-weight: 700 !important;

  letter-spacing: 0.02em;

  text-transform: uppercase;

  white-space: nowrap;
}

:deep(.late-summary-table tbody td) {
  height: 64px !important;

  padding-left: 14px !important;
  padding-right: 14px !important;

  border-bottom:
    1px solid
    #f0f1f3 !important;

  color: #374151;

  font-size: 0.82rem;
}

:deep(.late-summary-table tbody tr:hover) {
  background:
    #f8faf9 !important;
}

/* =========================================================
   EMPLOYEE
========================================================= */

.employee-cell {
  display: flex;
  align-items: center;

  gap: 10px;
}

.employee-info {
  min-width: 0;
}

.employee-name {
  max-width: 220px;

  overflow: hidden;

  color: #1f2937;

  font-weight: 650;

  text-overflow: ellipsis;
  white-space: nowrap;
}

.employee-subtitle {
  margin-top: 2px;

  color: #9ca3af;

  font-size: 0.68rem;
}

.avatar-text {
  color: #15803d;

  font-size: 0.68rem;
  font-weight: 750;
}

/* =========================================================
   PERIOD
========================================================= */

.period-cell {
  display: flex;
  align-items: center;

  gap: 7px;

  white-space: nowrap;
}

.period-main {
  color: #374151;

  font-size: 0.8rem;
  font-weight: 600;
}

.period-separator {
  color: #9ca3af;

  font-size: 0.7rem;
}

/* =========================================================
   EMPTY
========================================================= */

.empty-state {
  padding: 60px 20px;

  text-align: center;
}

.empty-icon {
  width: 66px;
  height: 66px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin: 0 auto 13px;

  border-radius: 50%;

  background: #f3f4f6;

  color: #9ca3af;
}

.empty-title {
  color: #374151;

  font-size: 0.95rem;
  font-weight: 700;
}

.empty-description {
  margin-top: 5px;

  color: #9ca3af;

  font-size: 0.78rem;
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 960px) {
  .card-header,
  .table-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .search-field {
    width: 100%;
  }

  .filter-actions {
    width: 100%;
  }

  .filter-actions .v-btn {
    flex: 1;
  }
}

@media (max-width: 600px) {
  .filter-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .filter-actions .v-btn {
    width: 100%;
  }

  .selected-range {
    width: 100%;

    align-items: flex-start;
    flex-wrap: wrap;
  }

  .period-cell {
    align-items: flex-start;
    flex-direction: column;

    gap: 1px;
  }

  .period-separator {
    display: none;
  }
}
</style>