<template>
  <div class="attendance-report">
    <!-- =========================================================
         REPORT SUMMARY
    ========================================================== -->
    <v-row class="mb-5">
      <!-- Records -->
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
                  Records
                </div>

                <div class="summary-value">
                  {{ logs.length }}
                </div>

                <div class="summary-description">
                  Generated attendance records
                </div>
              </div>

              <div class="summary-icon icon-primary">
                <v-icon>
                  mdi-file-document-outline
                </v-icon>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- On Time -->
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
                  On Time
                </div>

                <div class="summary-value text-success">
                  {{ onTimeCount }}
                </div>

                <div class="summary-description">
                  Arrived within schedule
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

      <!-- Late -->
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
                  Late
                </div>

                <div class="summary-value text-error">
                  {{ lateCount }}
                </div>

                <div class="summary-description">
                  Late attendance records
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

      <!-- No Time Out -->
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
                  No Time Out
                </div>

                <div class="summary-value text-warning">
                  {{ noTimeOutCount }}
                </div>

                <div class="summary-description">
                  Incomplete attendance
                </div>
              </div>

              <div class="summary-icon icon-warning">
                <v-icon>
                  mdi-account-clock-outline
                </v-icon>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- =========================================================
         FILTER
    ========================================================== -->
    <v-card
      elevation="0"
      class="filter-card mb-5"
    >
      <div class="card-header">
        <div>
          <div class="section-title">
            Report Date Range
          </div>

          <div class="section-subtitle">
            Select the start and end dates for the attendance report.
          </div>
        </div>

        <v-chip
          v-if="hasGeneratedReport"
          size="small"
          color="success"
          variant="tonal"
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

          <!-- Actions -->
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
                @click="searchAttendanceRange"
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
                  logs.length === 0
                "
                @click="clearReport"
              >
                Clear
              </v-btn>
            </div>
          </v-col>
        </v-row>

        <!-- Selected Range -->
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

          Report period:

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
         ATTENDANCE REPORT TABLE
    ========================================================== -->
    <v-card
      elevation="0"
      class="report-table-card"
    >
      <div class="table-toolbar">
        <div>
          <div class="section-title">
            Attendance Records
          </div>

          <div class="section-subtitle">
            Detailed employee attendance for the selected report period.
          </div>
        </div>

        <v-text-field
          v-model="search"
          density="compact"
          placeholder="Search employee..."
          clearable
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
          class="search-field"
        />
      </div>

      <v-divider />

      <v-data-table
        :items="logs"
        :headers="headers"
        :search="search"
        :loading="loading"
        :sort-by="defaultSort"
        density="comfortable"
        :items-per-page="20"
        class="attendance-report-table"
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
        <template #[`item.name`]="{ item }">
          <div class="employee-cell">
            <v-avatar
              size="36"
              color="green-lighten-5"
            >
              <span class="avatar-text">
                {{ getInitials(item.name) }}
              </span>
            </v-avatar>

            <div class="employee-info">
              <div class="employee-name">
                {{ item.name || 'Unknown Employee' }}
              </div>

              <div class="employee-subtitle">
                ID {{ item.user_id }}
              </div>
            </div>
          </div>
        </template>

        <!-- =====================================================
             DATE
        ====================================================== -->
        <template #[`item.log_date`]="{ item }">
          <div class="date-cell">
            <div class="date-primary">
              {{ formatDate(item.log_date) }}
            </div>

            <div class="date-secondary">
              {{ getDayName(item.log_date) }}
            </div>
          </div>
        </template>

        <!-- =====================================================
             SCHEDULE
        ====================================================== -->
        <template #[`item.schedule`]="{ item }">
          <div
            v-if="item.shift_start || item.shift_end"
            class="schedule-cell"
          >
            <v-icon
              size="15"
              class="me-1"
            >
              mdi-clock-outline
            </v-icon>

            {{ formatShiftTime(item.shift_start) }}

            <span class="schedule-separator">
              –
            </span>

            {{ formatShiftTime(item.shift_end) }}
          </div>

          <span
            v-else
            class="empty-value"
          >
            —
          </span>
        </template>

        <!-- =====================================================
             TIME IN
        ====================================================== -->
        <template #[`item.in_time`]="{ item }">
          <div
            v-if="item.in_time"
            class="attendance-time time-in"
          >
            <v-icon
              size="16"
              class="me-1"
            >
              mdi-login
            </v-icon>

            {{ formatTime(item.in_time) }}
          </div>

          <span
            v-else
            class="empty-value"
          >
            —
          </span>
        </template>

        <!-- =====================================================
             TIME OUT
        ====================================================== -->
        <template #[`item.out_time`]="{ item }">
          <v-chip
            v-if="hasNoTimeOut(item)"
            size="small"
            color="warning"
            variant="tonal"
          >
            <v-icon
              start
              size="14"
            >
              mdi-clock-alert-outline
            </v-icon>

            No Time Out
          </v-chip>

          <div
            v-else
            class="attendance-time time-out"
          >
            <v-icon
              size="16"
              class="me-1"
            >
              mdi-logout
            </v-icon>

            {{ formatTime(item.out_time) }}
          </div>
        </template>

        <!-- =====================================================
             LATENESS
        ====================================================== -->
        <template #[`item.late_status`]="{ item }">
          <v-chip
            v-if="Number(item.late_minutes ?? 0) > 0"
            size="small"
            color="error"
            variant="tonal"
          >
            <v-icon
              start
              size="14"
            >
              mdi-clock-alert-outline
            </v-icon>

            {{ item.late_minutes }} min Late
          </v-chip>

          <v-chip
            v-else-if="item.late_status"
            size="small"
            color="success"
            variant="tonal"
          >
            <v-icon
              start
              size="14"
            >
              mdi-check-circle-outline
            </v-icon>

            On Time
          </v-chip>

          <span
            v-else
            class="empty-value"
          >
            —
          </span>
        </template>

        <!-- =====================================================
             EARLY LEAVE
        ====================================================== -->
        <template #[`item.early_leave_status`]="{ item }">
          <v-chip
            v-if="item.early_leave_status"
            size="small"
            variant="tonal"
            :color="
              getEarlyLeaveMeta(
                item.early_leave_status
              ).color
            "
          >
            <v-icon
              start
              size="14"
            >
              {{
                getEarlyLeaveMeta(
                  item.early_leave_status
                ).icon
              }}
            </v-icon>

            {{ item.early_leave_status }}
          </v-chip>

          <span
            v-else
            class="empty-value"
          >
            —
          </span>
        </template>

        <!-- =====================================================
             TOTAL HOURS
        ====================================================== -->
        <template #[`item.total_hours`]="{ item }">
          <div
            v-if="
              item.total_hours !== null &&
              item.total_hours !== undefined
            "
            class="total-hours"
          >
            {{ item.total_hours }}

            <span>
              hrs
            </span>
          </div>

          <span
            v-else
            class="empty-value"
          >
            —
          </span>
        </template>

        <!-- =====================================================
             NO DATA
        ====================================================== -->
        <template #no-data>
          <div class="empty-state">
            <div class="empty-icon">
              <v-icon size="36">
                mdi-file-search-outline
              </v-icon>
            </div>

            <div class="empty-title">
              No report generated
            </div>

            <div class="empty-description">
              Select a start and end date, then click Generate Report.
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

interface AttendanceLog {
  user_id: number

  name?: string

  log_date?: string

  shift_name?: string
  shift_start?: string
  shift_end?: string

  in_time?: string
  out_time?: string

  late_minutes?: number
  late_status?: string

  early_leave_status?: string

  total_hours?: number | string | null
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

const logs =
  ref<AttendanceLog[]>([])

const loading =
  ref(false)

const search =
  ref('')

const errorMessage =
  ref('')

const hasGeneratedReport =
  ref(false)

/*
|--------------------------------------------------------------------------
| Sort
|--------------------------------------------------------------------------
*/

const defaultSort =
  ref([
    {
      key: 'log_date',
      order: 'desc' as const
    }
  ])

/*
|--------------------------------------------------------------------------
| Headers
|--------------------------------------------------------------------------
*/

const headers = [
  {
    title: 'Employee',
    key: 'name',
    sortable: true
  },

  {
    title: 'Date',
    key: 'log_date',
    sortable: true,
    width: 130
  },

  {
    title: 'Schedule',
    key: 'schedule',
    sortable: false,
    width: 160
  },

  {
    title: 'Time In',
    key: 'in_time',
    sortable: false,
    width: 125
  },

  {
    title: 'Time Out',
    key: 'out_time',
    sortable: false,
    width: 140
  },

  {
    title: 'Lateness',
    key: 'late_status',
    sortable: true,
    width: 135
  },

  {
    title: 'Early Leave',
    key: 'early_leave_status',
    sortable: true,
    width: 130
  },

  {
    title: 'Total Hours',
    key: 'total_hours',
    sortable: true,
    width: 110
  }
]

/*
|--------------------------------------------------------------------------
| Summary
|--------------------------------------------------------------------------
*/

const onTimeCount =
  computed(() => {
    return logs.value.filter(
      item => {
        const status =
          String(
            item.late_status ?? ''
          ).toLowerCase()

        return (
          status.includes(
            'on time'
          ) ||
          (
            item.late_status &&
            Number(
              item.late_minutes ??
              0
            ) === 0
          )
        )
      }
    ).length
  })

const lateCount =
  computed(() => {
    return logs.value.filter(
      item =>
        Number(
          item.late_minutes ??
          0
        ) > 0
    ).length
  })

const noTimeOutCount =
  computed(() => {
    return logs.value.filter(
      item =>
        hasNoTimeOut(item)
    ).length
  })

/*
|--------------------------------------------------------------------------
| Format Date for API
|--------------------------------------------------------------------------
|
| Existing backend:
|
| /api/attendance/search
|
| expects:
|
| DD/MM/YYYY
|
*/

const formatSearchDate =
  (
    value: Date
  ) => {
    return value
      .toLocaleDateString(
        'en-GB'
      )
  }

/*
|--------------------------------------------------------------------------
| Generate Report
|--------------------------------------------------------------------------
*/

const searchAttendanceRange =
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
          AttendanceLog[]
        >(
          `/api/attendance/search?date_start=${encodeURIComponent(
            formattedDateStart
          )}&date_end=${encodeURIComponent(
            formattedDateEnd
          )}`
        )

      logs.value =
        result ?? []

      hasGeneratedReport.value =
        true
    } catch (error) {
      console.error(
        'Attendance report error:',
        error
      )

      logs.value =
        []

      hasGeneratedReport.value =
        false

      errorMessage.value =
        'Unable to generate the attendance report.'
    } finally {
      loading.value =
        false
    }
  }

/*
|--------------------------------------------------------------------------
| Clear
|--------------------------------------------------------------------------
*/

const clearReport =
  () => {
    dateStart.value =
      null

    dateEnd.value =
      null

    logs.value =
      []

    search.value =
      ''

    errorMessage.value =
      ''

    hasGeneratedReport.value =
      false
  }

/*
|--------------------------------------------------------------------------
| No Time Out
|--------------------------------------------------------------------------
*/

const hasNoTimeOut =
  (
    item: AttendanceLog
  ) => {
    return (
      !item.out_time ||
      item.in_time ===
        item.out_time
    )
  }

/*
|--------------------------------------------------------------------------
| Employee Initials
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
| Date Parsing
|--------------------------------------------------------------------------
*/

const parseDateValue =
  (
    value?: string
  ) => {
    if (!value) {
      return null
    }

    const match =
      value.match(
        /^(\d{4})-(\d{2})-(\d{2})$/
      )

    if (match) {
      return new Date(
        Number(match[1]),
        Number(match[2]) - 1,
        Number(match[3])
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

const getDayName =
  (
    value?: string
  ) => {
    const date =
      parseDateValue(value)

    if (!date) {
      return ''
    }

    return date.toLocaleDateString(
      'en-PH',
      {
        weekday: 'long'
      }
    )
  }

/*
|--------------------------------------------------------------------------
| Attendance Time
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
        second: '2-digit',
        hour12: true
      }
    )
  }

/*
|--------------------------------------------------------------------------
| Shift Time
|--------------------------------------------------------------------------
*/

const formatShiftTime =
  (
    value?: string
  ) => {
    if (!value) {
      return '—'
    }

    const match =
      value.match(
        /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/
      )

    if (!match) {
      return value
    }

    const hour =
      Number(match[1])

    const minute =
      match[2]

    const period =
      hour >= 12
        ? 'PM'
        : 'AM'

    const displayHour =
      hour % 12 ||
      12

    return `${displayHour}:${minute} ${period}`
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
| Early Leave
|--------------------------------------------------------------------------
*/

const getEarlyLeaveMeta =
  (
    status?: string
  ) => {
    if (!status) {
      return {
        color: 'grey',
        icon:
          'mdi-minus-circle-outline'
      }
    }

    const value =
      status.toUpperCase()

    if (
      value.includes('EARLY')
    ) {
      return {
        color: 'warning',
        icon:
          'mdi-clock-minus-outline'
      }
    }

    if (
      value.includes('OK')
    ) {
      return {
        color: 'success',
        icon:
          'mdi-check-circle-outline'
      }
    }

    return {
      color: 'grey',
      icon:
        'mdi-information-outline'
    }
  }
</script>

<style scoped>
/* =========================================================
   COMPONENT
========================================================= */

.attendance-report {
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

.icon-success {
  color: #16a34a;
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
   HEADER
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

:deep(.attendance-report-table thead th) {
  height: 50px !important;

  padding-left: 10px !important;
  padding-right: 10px !important;

  background: #fafafa !important;

  border-bottom:
    1px solid
    #e5e7eb !important;

  color: #4b5563 !important;

  font-size: 0.7rem !important;
  font-weight: 700 !important;

  letter-spacing: 0.02em;

  text-transform: uppercase;

  white-space: nowrap;
}

:deep(.attendance-report-table tbody td) {
  height: 62px !important;

  padding-left: 10px !important;
  padding-right: 10px !important;

  border-bottom:
    1px solid
    #f0f1f3 !important;

  color: #374151;

  font-size: 0.8rem;

  white-space: nowrap;
}

:deep(.attendance-report-table tbody tr:hover) {
  background:
    #f8faf9 !important;
}

/* =========================================================
   EMPLOYEE
========================================================= */

.employee-cell {
  display: flex;
  align-items: center;

  gap: 9px;
}

.employee-info {
  min-width: 0;
}

.employee-name {
  max-width: 180px;

  overflow: hidden;

  color: #1f2937;

  font-weight: 650;

  text-overflow: ellipsis;
  white-space: nowrap;
}

.employee-subtitle {
  margin-top: 2px;

  color: #9ca3af;

  font-size: 0.67rem;
}

.avatar-text {
  color: #15803d;

  font-size: 0.68rem;
  font-weight: 750;
}

/* =========================================================
   DATE
========================================================= */

.date-primary {
  color: #374151;

  font-weight: 600;
}

.date-secondary {
  margin-top: 2px;

  color: #9ca3af;

  font-size: 0.67rem;
}

/* =========================================================
   SCHEDULE
========================================================= */

.schedule-cell {
  display: flex;
  align-items: center;

  color: #4b5563;

  font-size: 0.77rem;
  font-weight: 600;

  white-space: nowrap;
}

.schedule-separator {
  margin: 0 4px;

  color: #9ca3af;
}

/* =========================================================
   TIME
========================================================= */

.attendance-time {
  display: flex;
  align-items: center;

  font-size: 0.78rem;
  font-weight: 650;

  white-space: nowrap;
}

.time-in {
  color: #15803d;
}

.time-out {
  color: #2563eb;
}

/* =========================================================
   TOTAL HOURS
========================================================= */

.total-hours {
  color: #374151;

  font-weight: 700;

  white-space: nowrap;
}

.total-hours span {
  color: #9ca3af;

  font-size: 0.67rem;
  font-weight: 500;
}

.empty-value {
  color: #b0b5bd;
}

:deep(.attendance-report-table .v-chip) {
  font-size: 0.68rem;
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

@media (max-width: 1100px) {
  :deep(.attendance-report-table .v-table__wrapper) {
    overflow-x: auto;
  }
}

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
}
</style>