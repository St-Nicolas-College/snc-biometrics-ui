<template>
  <div class="attendance-page">
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
            mdi-calendar-clock-outline
          </v-icon>

          <h1 class="page-title">
            Attendance Records
          </h1>
        </div>

        <p class="page-subtitle">
          Review daily attendance, work schedules, lateness,
          and employee time records.
        </p>
      </div>

      <div class="d-flex align-center flex-wrap ga-2">
        <!-- Live Status -->
        <v-chip
          :color="realtimeConnected ? 'success' : 'error'"
          variant="tonal"
          size="small"
        >
          <v-icon
            start
            size="16"
          >
            {{
              realtimeConnected
                ? 'mdi-access-point'
                : 'mdi-access-point-off'
            }}
          </v-icon>

          {{
            realtimeConnected
              ? 'Live Updates Active'
              : 'Live Updates Offline'
          }}
        </v-chip>

        <!-- Last Updated -->
        <v-chip
          v-if="lastUpdated"
          variant="outlined"
          size="small"
          color="grey-darken-1"
        >
          <v-icon
            start
            size="15"
          >
            mdi-clock-outline
          </v-icon>

          Updated {{ formatLastUpdated(lastUpdated) }}
        </v-chip>
      </div>
    </div>

    <!-- =========================================================
         SUMMARY CARDS
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
                  Attendance entries shown
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
                  Arrived on schedule
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
      <div class="filter-header">
        <div>
          <div class="section-title">
            Attendance Filter
          </div>

          <div class="section-subtitle">
            Select a date range to review attendance records.
          </div>
        </div>

        <v-chip
          v-if="hasDateFilter"
          size="small"
          variant="tonal"
          color="primary"
        >
          <v-icon
            start
            size="15"
          >
            mdi-filter-check-outline
          </v-icon>

          Date Filter Active
        </v-chip>
      </div>

      <v-divider />

      <v-card-text class="pa-5">
        <v-row align="center">
          <!-- Start Date -->
          <v-col
            cols="12"
            sm="6"
            md="4"
            lg="3"
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
            lg="3"
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

          <!-- Filter Buttons -->
          <v-col
            cols="12"
            md="4"
            lg="6"
          >
            <div class="filter-buttons">
              <v-btn
                color="primary"
                variant="flat"
                prepend-icon="mdi-magnify"
                :loading="searching"
                @click="searchAttendanceRange"
              >
                Search
              </v-btn>

              <v-btn
                variant="outlined"
                color="grey-darken-1"
                prepend-icon="mdi-filter-remove-outline"
                :disabled="!dateStart && !dateEnd"
                @click="clearDateFilter"
              >
                Clear
              </v-btn>
            </div>
          </v-col>
        </v-row>

        <!-- Active Date Filter -->
        <div
          v-if="hasDateFilter"
          class="active-filter mt-4"
        >
          <v-icon
            size="17"
            color="primary"
            class="me-2"
          >
            mdi-calendar-range
          </v-icon>

          <span>
            Showing attendance from

            <strong>
              {{ formatSelectedDate(dateStart) }}
            </strong>

            to

            <strong>
              {{ formatSelectedDate(dateEnd) }}
            </strong>
          </span>
        </div>
      </v-card-text>
    </v-card>

    <!-- =========================================================
         TABLE CARD
    ========================================================== -->
    <v-card
      elevation="0"
      class="attendance-card"
    >
      <!-- Table Header -->
      <div class="table-toolbar">
        <div>
          <div class="section-title">
            Daily Attendance
          </div>

          <div class="section-subtitle">
            Employee schedules and attendance activity.
          </div>
        </div>

        <div class="toolbar-actions">
          <!-- Refresh -->
          <v-btn
            variant="tonal"
            color="primary"
            size="small"
            prepend-icon="mdi-refresh"
            :loading="refreshing || searching"
            @click="refreshCurrentView"
          >
            Refresh
          </v-btn>

          <!-- Search -->
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
           ATTENDANCE TABLE
      ======================================================== -->
      <v-data-table
        :items="logs"
        :headers="headers"
        :search="search"
        :loading="loading"
        :sort-by="defaultSort"
        density="comfortable"
        :items-per-page="20"
        class="attendance-table"
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
              class="schedule-icon"
            >
              mdi-clock-outline
            </v-icon>

            <span>
              {{ formatShiftTime(item.shift_start) }}
            </span>

            <span class="schedule-separator">
              –
            </span>

            <span>
              {{ formatShiftTime(item.shift_end) }}
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
            variant="tonal"
            color="warning"
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
            variant="tonal"
            color="error"
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
                mdi-calendar-search-outline
              </v-icon>
            </div>

            <div class="empty-title">
              No attendance records found
            </div>

            <div class="empty-description">
              Try changing the selected date range
              or employee search.
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

  status?: string
}

/*
|--------------------------------------------------------------------------
| State
|--------------------------------------------------------------------------
*/

const logs =
  ref<AttendanceLog[]>([])

const loading =
  ref(true)

const refreshing =
  ref(false)

const searching =
  ref(false)

const search =
  ref('')

const dateStart =
  ref<Date | null>(null)

const dateEnd =
  ref<Date | null>(null)

const errorMessage =
  ref('')

const realtimeConnected =
  ref(false)

const lastUpdated =
  ref<Date | null>(null)

/*
|--------------------------------------------------------------------------
| SSE
|--------------------------------------------------------------------------
*/

let eventSource:
  EventSource |
  null = null

let refreshTimer:
  ReturnType<typeof setTimeout> |
  null = null

/*
|--------------------------------------------------------------------------
| Default Sort
|--------------------------------------------------------------------------
*/

const defaultSort = ref([
  {
    key: 'log_date',
    order: 'desc' as const
  }
])

/*
|--------------------------------------------------------------------------
| Table Headers
|--------------------------------------------------------------------------
|
| Combined columns:
|
| - User ID moved under Employee
| - Day moved under Date
| - Shift Start + Shift End = Schedule
| - Late Minutes + Status = Lateness
|
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
    width: 125
  },

  {
    title: 'Schedule',
    key: 'schedule',
    sortable: false,
    width: 155
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
    width: 135
  },

  {
    title: 'Lateness',
    key: 'late_status',
    sortable: true,
    width: 125
  },

  {
    title: 'Early Leave',
    key: 'early_leave_status',
    sortable: true,
    width: 125
  },

  {
    title: 'Total Hours',
    key: 'total_hours',
    sortable: true,
    width: 105
  }
]

/*
|--------------------------------------------------------------------------
| Summary
|--------------------------------------------------------------------------
*/

const onTimeCount =
  computed(
    () => {
      return logs.value.filter(
        item => {
          const status =
            (
              item.late_status ??
              ''
            ).toUpperCase()

          return status.includes(
            'ON TIME'
          )
        }
      ).length
    }
  )

const lateCount =
  computed(
    () => {
      return logs.value.filter(
        item =>
          Number(
            item.late_minutes ??
            0
          ) > 0
      ).length
    }
  )

const noTimeOutCount =
  computed(
    () => {
      return logs.value.filter(
        item =>
          hasNoTimeOut(item)
      ).length
    }
  )

const hasDateFilter =
  computed(
    () => {
      return Boolean(
        dateStart.value &&
        dateEnd.value
      )
    }
  )

/*
|--------------------------------------------------------------------------
| Fetch Attendance
|--------------------------------------------------------------------------
*/

const fetchAttendance =
  async (
    showLoader = false
  ) => {
    if (showLoader) {
      loading.value = true
    } else {
      refreshing.value = true
    }

    try {
      const data =
        await $fetch<
          AttendanceLog[]
        >(
          '/api/attendance/inout_shift'
        )

      logs.value =
        data ?? []

      lastUpdated.value =
        new Date()

      errorMessage.value =
        ''
    } catch (error) {
      console.error(
        'Attendance fetch error:',
        error
      )

      errorMessage.value =
        'Unable to load attendance.'
    } finally {
      loading.value =
        false

      refreshing.value =
        false
    }
  }

/*
|--------------------------------------------------------------------------
| Date For Search API
|--------------------------------------------------------------------------
|
| Existing search endpoint expects:
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
| Search Attendance Range
|--------------------------------------------------------------------------
*/

const searchAttendanceRange =
  async () => {
    if (
      !dateStart.value ||
      !dateEnd.value
    ) {
      errorMessage.value =
        'Please select both the start and end dates.'

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

    searching.value =
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

      lastUpdated.value =
        new Date()

      errorMessage.value =
        ''
    } catch (error) {
      console.error(
        'Attendance range search error:',
        error
      )

      errorMessage.value =
        'Unable to search attendance range.'
    } finally {
      searching.value =
        false
    }
  }

/*
|--------------------------------------------------------------------------
| Clear Filter
|--------------------------------------------------------------------------
*/

const clearDateFilter =
  async () => {
    dateStart.value =
      null

    dateEnd.value =
      null

    errorMessage.value =
      ''

    await fetchAttendance()
  }

/*
|--------------------------------------------------------------------------
| Refresh Current View
|--------------------------------------------------------------------------
*/

const refreshCurrentView =
  async () => {
    if (
      dateStart.value &&
      dateEnd.value
    ) {
      await searchAttendanceRange()

      return
    }

    await fetchAttendance()
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
| Debounced Real-Time Refresh
|--------------------------------------------------------------------------
*/

const scheduleRefresh =
  () => {
    if (refreshTimer) {
      clearTimeout(
        refreshTimer
      )
    }

    refreshTimer =
      setTimeout(
        async () => {
          await refreshCurrentView()

          refreshTimer =
            null
        },
        500
      )
  }

/*
|--------------------------------------------------------------------------
| Attendance SSE Event
|--------------------------------------------------------------------------
*/

const handleAttendanceEvent =
  (
    event: Event
  ) => {
    const messageEvent =
      event as MessageEvent

    console.log(
      'New real-time attendance:',
      messageEvent.data
    )

    /*
     * Refresh the backend-calculated
     * attendance values.
     */
    scheduleRefresh()
  }

/*
|--------------------------------------------------------------------------
| SSE Connection
|--------------------------------------------------------------------------
*/

const connectRealtime =
  () => {
    if (
      typeof window ===
      'undefined'
    ) {
      return
    }

    if (eventSource) {
      eventSource.close()
    }

    eventSource =
      new EventSource(
        '/api/attendance/stream'
      )

    eventSource.onopen =
      () => {
        realtimeConnected.value =
          true
      }

    eventSource.addEventListener(
      'connected',
      () => {
        realtimeConnected.value =
          true
      }
    )

    eventSource.addEventListener(
      'attendance',
      handleAttendanceEvent
    )

    eventSource.onerror =
      error => {
        realtimeConnected.value =
          false

        console.warn(
          'Attendance SSE disconnected:',
          error
        )
      }
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
| Day Name
|--------------------------------------------------------------------------
*/

const getDayName =
  (
    value?: string
  ) => {
    if (!value) {
      return ''
    }

    const date =
      new Date(value)

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
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

    /*
     * Example:
     *
     * 08:00:00
     */

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
| Last Updated
|--------------------------------------------------------------------------
*/

const formatLastUpdated =
  (
    value: Date
  ) => {
    return value.toLocaleTimeString(
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
        icon: 'mdi-minus-circle-outline'
      }
    }

    const value =
      status.toUpperCase()

    if (
      value.includes(
        'EARLY'
      )
    ) {
      return {
        color: 'warning',
        icon: 'mdi-clock-minus-outline'
      }
    }

    if (
      value.includes(
        'OK'
      )
    ) {
      return {
        color: 'success',
        icon: 'mdi-check-circle-outline'
      }
    }

    return {
      color: 'grey',
      icon: 'mdi-information-outline'
    }
  }

/*
|--------------------------------------------------------------------------
| Lifecycle
|--------------------------------------------------------------------------
*/

onMounted(
  async () => {
    await fetchAttendance(
      true
    )

    connectRealtime()
  }
)

onBeforeUnmount(
  () => {
    if (refreshTimer) {
      clearTimeout(
        refreshTimer
      )

      refreshTimer =
        null
    }

    if (eventSource) {
      eventSource.close()

      eventSource =
        null
    }

    realtimeConnected.value =
      false
  }
)
</script>

<style scoped>
/* =========================================================
   PAGE
========================================================= */

.attendance-page {
  min-height: 100%;
  padding: 24px;
  background: #f7f8fa;
}

/* =========================================================
   HEADER
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

  box-shadow:
    0 8px 24px
    rgba(0, 0, 0, 0.05);
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
.attendance-card {
  overflow: hidden;

  border: 1px solid #e7e9ed;
  border-radius: 14px;

  background: #ffffff;
}

/* =========================================================
   FILTER
========================================================= */

.filter-header {
  min-height: 72px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 16px;

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

.field-label {
  margin-bottom: 7px;

  color: #4b5563;

  font-size: 0.75rem;
  font-weight: 650;
}

.filter-buttons {
  height: 100%;

  display: flex;
  align-items: flex-end;

  gap: 10px;

  padding-top: 23px;
}

.active-filter {
  display: inline-flex;
  align-items: center;

  padding: 8px 12px;

  border-radius: 8px;

  background: #f0fdf4;

  color: #4b5563;

  font-size: 0.78rem;
}

/* =========================================================
   TABLE TOOLBAR
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

  gap: 10px;
}

.search-field {
  width: 260px;
}

/* =========================================================
   TABLE
========================================================= */

:deep(.attendance-table .v-table__wrapper) {
  overflow-x: hidden;
}

:deep(.attendance-table table) {
  width: 100% !important;

  table-layout: auto;
}

:deep(.attendance-table thead th) {
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

:deep(.attendance-table tbody td) {
  height: 62px !important;

  padding-left: 10px !important;
  padding-right: 10px !important;

  border-bottom:
    1px solid
    #f0f1f3 !important;

  color: #374151;

  font-size: 0.81rem;

  white-space: nowrap;
}

:deep(.attendance-table tbody tr) {
  transition:
    background-color
    0.15s ease;
}

:deep(.attendance-table tbody tr:hover) {
  background:
    #f8faf9 !important;
}

/* =========================================================
   EMPLOYEE
========================================================= */

.employee-cell {
  min-width: 0;

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

  font-size: 0.68rem;
}

.avatar-text {
  color: #15803d;

  font-size: 0.69rem;
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

  font-size: 0.68rem;
}

/* =========================================================
   SCHEDULE
========================================================= */

.schedule-cell {
  display: flex;
  align-items: center;

  color: #4b5563;

  font-size: 0.78rem;
  font-weight: 600;

  white-space: nowrap;
}

.schedule-icon {
  margin-right: 4px;

  color: #6b7280;
}

.schedule-separator {
  margin: 0 4px;

  color: #9ca3af;
}

/* =========================================================
   ATTENDANCE TIME
========================================================= */

.attendance-time {
  display: flex;
  align-items: center;

  font-size: 0.8rem;
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

  font-size: 0.82rem;
  font-weight: 700;

  white-space: nowrap;
}

.total-hours span {
  color: #9ca3af;

  font-size: 0.68rem;
  font-weight: 500;
}

.empty-value {
  color: #b0b5bd;
}

/* =========================================================
   CHIPS
========================================================= */

:deep(.attendance-table .v-chip) {
  font-size: 0.7rem;
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

@media (max-width: 1200px) {
  .employee-name {
    max-width: 150px;
  }

  :deep(.attendance-table tbody td) {
    padding-left: 7px !important;
    padding-right: 7px !important;
  }

  :deep(.attendance-table thead th) {
    padding-left: 7px !important;
    padding-right: 7px !important;
  }

  :deep(.attendance-table .v-chip) {
    padding-left: 7px !important;
    padding-right: 7px !important;
  }
}

@media (max-width: 960px) {
  .attendance-page {
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
    flex: 1;

    width: auto;
  }

  .filter-buttons {
    padding-top: 0;
  }

  /*
   * On tablets the table is allowed to
   * scroll because there is physically
   * not enough width for all information.
   */
  :deep(.attendance-table .v-table__wrapper) {
    overflow-x: auto;
  }
}

@media (max-width: 600px) {
  .attendance-page {
    padding: 10px;
  }

  .page-title {
    font-size: 1.3rem;
  }

  .filter-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .filter-buttons {
    width: 100%;

    align-items: stretch;
    flex-direction: column;
  }

  .filter-buttons .v-btn {
    width: 100%;
  }

  .toolbar-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .search-field {
    width: 100%;
  }
}
</style>