<template>
  <div class="attendance-dashboard">
    <!-- =========================================================
         PAGE HEADER
    ========================================================== -->
    <div class="dashboard-header mb-6">
      <div>
        <div class="d-flex align-center ga-2 mb-1">
          <v-icon
            color="primary"
            size="28"
          >
            mdi-account-clock
          </v-icon>

          <h1 class="page-title">
            Live Attendance
          </h1>
        </div>

        <p class="page-subtitle">
          Monitor employee biometric attendance and recent activity.
        </p>
      </div>

      <div class="d-flex align-center flex-wrap ga-2">
        <!-- Live SSE Status -->
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
            size="16"
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
      <!-- Today's Employees -->
      <v-col
        cols="12"
        sm="6"
        lg="3"
      >
        <v-card
          elevation="0"
          class="stat-card"
        >
          <v-card-text>
            <div class="d-flex justify-space-between align-start">
              <div>
                <div class="stat-label">
                  Attendance Today
                </div>

                <div class="stat-value">
                  {{ todayLogs.length }}
                </div>

                <div class="stat-description">
                  Employees with attendance
                </div>
              </div>

              <div class="stat-icon stat-icon-primary">
                <v-icon>
                  mdi-account-group-outline
                </v-icon>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Clocked In -->
      <v-col
        cols="12"
        sm="6"
        lg="3"
      >
        <v-card
          elevation="0"
          class="stat-card"
        >
          <v-card-text>
            <div class="d-flex justify-space-between align-start">
              <div>
                <div class="stat-label">
                  Currently In
                </div>

                <div class="stat-value text-success">
                  {{ clockedInCount }}
                </div>

                <div class="stat-description">
                  Active inside
                </div>
              </div>

              <div class="stat-icon stat-icon-success">
                <v-icon>
                  mdi-login
                </v-icon>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Clocked Out -->
      <v-col
        cols="12"
        sm="6"
        lg="3"
      >
        <v-card
          elevation="0"
          class="stat-card"
        >
          <v-card-text>
            <div class="d-flex justify-space-between align-start">
              <div>
                <div class="stat-label">
                  Clocked Out
                </div>

                <div class="stat-value text-primary">
                  {{ clockedOutCount }}
                </div>

                <div class="stat-description">
                  Completed attendance
                </div>
              </div>

              <div class="stat-icon stat-icon-info">
                <v-icon>
                  mdi-logout
                </v-icon>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Latest Punch -->
      <v-col
        cols="12"
        sm="6"
        lg="3"
      >
        <v-card
          elevation="0"
          class="stat-card"
        >
          <v-card-text>
            <div class="d-flex justify-space-between align-start">
              <div class="min-width-0">
                <div class="stat-label">
                  Latest Punch
                </div>

                <div class="latest-time">
                  {{
                    latestAttendance?.last_punch
                      ? formatTime(latestAttendance.last_punch)
                      : '—'
                  }}
                </div>

                <div class="latest-employee">
                  {{ latestAttendance?.name || 'No attendance yet' }}
                </div>
              </div>

              <div class="stat-icon stat-icon-warning">
                <v-icon>
                  mdi-clock-fast
                </v-icon>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- =========================================================
         LATEST ACTIVITY CARD
    ========================================================== -->
    <v-card
      elevation="0"
      class="attendance-card"
    >
      <!-- Toolbar -->
      <div class="table-toolbar">
        <div>
          <div class="section-title">
            Recent Attendance
          </div>

          <div class="section-subtitle">
            Latest biometric activity appears first.
          </div>
        </div>

        <div class="toolbar-actions">
          <!-- Manual Refresh -->
          <v-btn
            variant="tonal"
            color="primary"
            size="small"
            :loading="refreshing"
            prepend-icon="mdi-refresh"
            @click="fetchAttendance"
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

      <!-- =========================================================
           TABLE
      ========================================================== -->
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

        <!-- User ID -->
        <template #[`item.user_id`]="{ item }">
          <div class="employee-id">
            {{ item.user_id }}
          </div>
        </template>

        <!-- Name -->
        <template #[`item.name`]="{ item }">
          <div class="d-flex align-center ga-3">
            <v-avatar
              size="34"
              color="green-lighten-5"
            >
              <span class="employee-avatar-text">
                {{ getInitials(item.name) }}
              </span>
            </v-avatar>

            <div>
              <div class="employee-name">
                {{ item.name || 'Unknown Employee' }}
              </div>

              <div class="employee-secondary">
                Employee ID {{ item.user_id }}
              </div>
            </div>
          </div>
        </template>

        <!-- Date -->
        <template #[`item.log_date`]="{ item }">
          <div>
            <div class="date-primary">
              {{ formatDate(item.log_date) }}
            </div>

            <div class="date-secondary">
              {{ item.day || '' }}
            </div>
          </div>
        </template>

        <!-- Last Punch -->
        <template #[`item.last_punch`]="{ item }">
          <div class="d-flex align-center ga-2">
            <div
              class="punch-icon"
              :class="{
                'latest-punch-icon':
                  isLatestAttendance(item)
              }"
            >
              <v-icon
                size="17"
              >
                mdi-clock-outline
              </v-icon>
            </div>

            <div>
              <div class="last-punch-time">
                {{ formatTime(item.last_punch) }}
              </div>

              <v-chip
                v-if="isLatestAttendance(item)"
                size="x-small"
                color="success"
                variant="tonal"
                class="mt-1"
              >
                LATEST
              </v-chip>
            </div>
          </div>
        </template>

        <!-- Status -->
        <template #[`item.status`]="{ item }">
          <v-chip
            size="small"
            variant="tonal"
            :color="getStatusMeta(item.status).color"
          >
            <v-icon
              start
              size="16"
            >
              {{ getStatusMeta(item.status).icon }}
            </v-icon>

            {{ item.status || 'UNKNOWN' }}
          </v-chip>
        </template>

        <!-- Time In -->
        <template #[`item.in_time`]="{ item }">
          <div
            v-if="item.in_time"
            class="time-value"
          >
            {{ formatTime(item.in_time) }}
          </div>

          <span
            v-else
            class="text-medium-emphasis"
          >
            —
          </span>
        </template>

        <!-- Time Out -->
        <template #[`item.out_time`]="{ item }">
          <v-chip
            v-if="isClockedIn(item)"
            size="small"
            color="warning"
            variant="tonal"
          >
            <v-icon
              start
              size="15"
            >
              mdi-account-clock-outline
            </v-icon>

            Currently In
          </v-chip>

          <div
            v-else-if="item.out_time"
            class="time-value"
          >
            {{ formatTime(item.out_time) }}
          </div>

          <span
            v-else
            class="text-medium-emphasis"
          >
            —
          </span>
        </template>

        <!-- Punches -->
        <template #[`item.entries`]="{ item }">
          <v-chip
            size="small"
            variant="outlined"
            color="grey-darken-1"
          >
            {{ item.entries ?? 0 }}
          </v-chip>
        </template>

        <!-- Total Hours -->
        <template #[`item.total_hours`]="{ item }">
          <div
            v-if="
              item.total_hours !== null &&
              item.total_hours !== undefined
            "
            class="hours-value"
          >
            {{ item.total_hours }}

            <span class="hours-label">
              hrs
            </span>
          </div>

          <span
            v-else
            class="text-medium-emphasis"
          >
            —
          </span>
        </template>

        <!-- Empty -->
        <template #no-data>
          <div class="empty-state">
            <div class="empty-icon">
              <v-icon size="34">
                mdi-calendar-blank-outline
              </v-icon>
            </div>

            <div class="empty-title">
              No attendance records
            </div>

            <div class="empty-description">
              New biometric punches will appear here automatically.
            </div>
          </div>
        </template>

        <!-- Bottom -->
        <template #bottom>
          <div class="table-footer">
            <div class="table-footer-text">
              Showing live biometric attendance records
            </div>

            <v-data-table-footer />
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
  day?: string
  in_time?: string
  out_time?: string
  last_punch?: string
  entries?: number
  punch_status?: number | null
  verify_type?: number | null
  total_hours?: string | number | null
  status?: string
}

/*
|--------------------------------------------------------------------------
| State
|--------------------------------------------------------------------------
*/

const logs = ref<AttendanceLog[]>([])

const loading = ref(true)

const refreshing = ref(false)

const search = ref('')

const errorMessage = ref('')

const realtimeConnected = ref(false)

const lastUpdated =
  ref<Date | null>(null)

/*
|--------------------------------------------------------------------------
| Default Sort
|--------------------------------------------------------------------------
*/

const defaultSort = ref([
  {
    key: 'last_punch',
    order: 'desc' as const
  }
])

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
| Headers
|--------------------------------------------------------------------------
*/

const headers = [
  {
    title: 'ID',
    key: 'user_id',
    sortable: true,
    width: 90
  },

  {
    title: 'Employee',
    key: 'name',
    sortable: true,
    minWidth: 220
  },

  {
    title: 'Date',
    key: 'log_date',
    sortable: true,
    minWidth: 145
  },

  {
    title: 'Latest Punch',
    key: 'last_punch',
    sortable: true,
    minWidth: 150
  },

  {
    title: 'Status',
    key: 'status',
    sortable: true,
    minWidth: 150
  },

  {
    title: 'Time In',
    key: 'in_time',
    sortable: false,
    minWidth: 130
  },

  {
    title: 'Time Out',
    key: 'out_time',
    sortable: false,
    minWidth: 150
  },

  {
    title: 'Punches',
    key: 'entries',
    sortable: true,
    align: 'center' as const,
    width: 100
  },

  {
    title: 'Total Hours',
    key: 'total_hours',
    sortable: false,
    minWidth: 120
  }
]

/*
|--------------------------------------------------------------------------
| Computed Dashboard Information
|--------------------------------------------------------------------------
*/

const latestAttendance =
  computed<AttendanceLog | null>(
    () => {
      return logs.value[0] ?? null
    }
  )

const todayLogs =
  computed(
    () => {
      const today =
        new Date()
          .toLocaleDateString(
            'en-CA'
          )

      return logs.value.filter(
        item => {
          if (!item.log_date) {
            return false
          }

          const date =
            new Date(
              item.log_date
            )

          if (
            Number.isNaN(
              date.getTime()
            )
          ) {
            return false
          }

          return (
            date.toLocaleDateString(
              'en-CA'
            ) === today
          )
        }
      )
    }
  )

const clockedInCount =
  computed(
    () =>
      todayLogs.value.filter(
        item =>
          isClockedIn(item)
      ).length
  )

const clockedOutCount =
  computed(
    () =>
      todayLogs.value.filter(
        item =>
          [
            'CLOCKED OUT',
            'BREAK OUT',
            'OT OUT'
          ].includes(
            item.status ?? ''
          )
      ).length
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
          '/api/attendance'
        )

      logs.value =
        (data ?? [])
          .sort(
            (a, b) => {
              const timeA =
                a.last_punch
                  ? new Date(
                      a.last_punch
                    ).getTime()
                  : 0

              const timeB =
                b.last_punch
                  ? new Date(
                      b.last_punch
                    ).getTime()
                  : 0

              return (
                timeB -
                timeA
              )
            }
          )

      lastUpdated.value =
        new Date()

      errorMessage.value =
        ''

    } catch (error) {
      console.error(
        'Failed to fetch attendance:',
        error
      )

      errorMessage.value =
        'Unable to load attendance records.'

    } finally {
      loading.value = false

      refreshing.value = false
    }
  }

/*
|--------------------------------------------------------------------------
| Current Attendance State
|--------------------------------------------------------------------------
*/

const isClockedIn =
  (
    item: AttendanceLog
  ) => {
    return [
      'CLOCKED IN',
      'BREAK IN',
      'OT IN'
    ].includes(
      item.status ?? ''
    )
  }

/*
|--------------------------------------------------------------------------
| Latest Row
|--------------------------------------------------------------------------
*/

const isLatestAttendance =
  (
    item: AttendanceLog
  ) => {
    if (
      !latestAttendance.value
    ) {
      return false
    }

    return (
      item.user_id ===
        latestAttendance.value
          .user_id &&
      item.last_punch ===
        latestAttendance.value
          .last_punch
    )
  }

/*
|--------------------------------------------------------------------------
| Status Metadata
|--------------------------------------------------------------------------
*/

const getStatusMeta =
  (
    status?: string
  ) => {
    switch (status) {
      case 'CLOCKED IN':
        return {
          color: 'success',
          icon: 'mdi-login'
        }

      case 'CLOCKED OUT':
        return {
          color: 'primary',
          icon: 'mdi-logout'
        }

      case 'BREAK OUT':
        return {
          color: 'warning',
          icon: 'mdi-coffee-outline'
        }

      case 'BREAK IN':
        return {
          color: 'success',
          icon: 'mdi-coffee'
        }

      case 'OT IN':
        return {
          color: 'purple',
          icon: 'mdi-clock-plus-outline'
        }

      case 'OT OUT':
        return {
          color: 'deep-purple',
          icon: 'mdi-clock-minus-outline'
        }

      default:
        return {
          color: 'grey',
          icon: 'mdi-help-circle-outline'
        }
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
        .substring(0, 2)
        .toUpperCase()
    }

    return (
      (
        parts[0][0] ?? ''
      ) +
      (
        parts[
          parts.length - 1
        ][0] ?? ''
      )
    ).toUpperCase()
  }

/*
|--------------------------------------------------------------------------
| Debounced Refresh
|--------------------------------------------------------------------------
*/

const scheduleAttendanceRefresh =
  () => {
    if (refreshTimer) {
      clearTimeout(
        refreshTimer
      )
    }

    refreshTimer =
      setTimeout(
        async () => {
          await fetchAttendance()

          refreshTimer =
            null
        },
        500
      )
  }

/*
|--------------------------------------------------------------------------
| Real-Time Event
|--------------------------------------------------------------------------
*/

const handleRealtimeEvent =
  (
    event: Event
  ) => {
    const message =
      event as MessageEvent

    console.log(
      'New attendance event:',
      message.data
    )

    scheduleAttendanceRefresh()
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
      handleRealtimeEvent
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
| Date Formatter
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
| Time Formatter
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
.attendance-dashboard {
  padding: 24px;
  min-height: 100%;
  background: #f7f8fa;
}

/* =========================================================
   HEADER
========================================================= */

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.page-title {
  margin: 0;
  font-size: 1.55rem;
  font-weight: 700;
  line-height: 1.2;
  color: #1f2937;
}

.page-subtitle {
  margin: 0;
  color: #6b7280;
  font-size: 0.9rem;
}

/* =========================================================
   STAT CARDS
========================================================= */

.stat-card {
  height: 100%;
  border: 1px solid #e7e9ed;
  border-radius: 14px;
  background: #ffffff;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 8px 24px
    rgba(0, 0, 0, 0.05);
}

.stat-label {
  color: #6b7280;
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.stat-value {
  margin-top: 6px;
  font-size: 2rem;
  font-weight: 750;
  line-height: 1.1;
  color: #1f2937;
}

.stat-description {
  margin-top: 5px;
  color: #9ca3af;
  font-size: 0.78rem;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
}

.stat-icon-primary {
  background: #ecfdf5;
  color: #15803d;
}

.stat-icon-success {
  background: #ecfdf5;
  color: #16a34a;
}

.stat-icon-info {
  background: #eff6ff;
  color: #2563eb;
}

.stat-icon-warning {
  background: #fff7ed;
  color: #ea580c;
}

.latest-time {
  margin-top: 6px;
  font-size: 1.35rem;
  font-weight: 750;
  color: #1f2937;
}

.latest-employee {
  margin-top: 5px;
  color: #6b7280;
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 170px;
}

/* =========================================================
   ATTENDANCE CARD
========================================================= */

.attendance-card {
  border: 1px solid #e7e9ed;
  border-radius: 14px;
  overflow: hidden;
  background: #ffffff;
}

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  gap: 20px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
}

.section-subtitle {
  margin-top: 2px;
  font-size: 0.8rem;
  color: #9ca3af;
}

.search-field {
  width: 280px;
}

/* =========================================================
   TABLE
========================================================= */

:deep(.attendance-table .v-data-table__tr) {
  transition:
    background-color 0.15s ease;
}

:deep(.attendance-table thead th) {
  height: 48px !important;
  background: #fafafa !important;
  color: #4b5563 !important;
  font-size: 0.76rem !important;
  font-weight: 700 !important;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  border-bottom: 1px solid #e5e7eb !important;
}

:deep(.attendance-table tbody td) {
  min-height: 58px;
  border-bottom: 1px solid #f0f1f3 !important;
  font-size: 0.86rem;
}

:deep(.attendance-table tbody tr:hover) {
  background: #f8faf9 !important;
}

.employee-id {
  font-weight: 700;
  color: #374151;
}

.employee-avatar-text {
  font-size: 0.72rem;
  font-weight: 700;
  color: #15803d;
}

.employee-name {
  font-weight: 650;
  color: #1f2937;
}

.employee-secondary {
  margin-top: 1px;
  color: #9ca3af;
  font-size: 0.7rem;
}

.date-primary {
  font-weight: 550;
  color: #374151;
}

.date-secondary {
  margin-top: 2px;
  color: #9ca3af;
  font-size: 0.72rem;
}

.punch-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: #f3f4f6;
  color: #6b7280;
}

.latest-punch-icon {
  background: #ecfdf5;
  color: #16a34a;
}

.last-punch-time,
.time-value {
  font-weight: 600;
  color: #374151;
}

.hours-value {
  font-weight: 700;
  color: #374151;
}

.hours-label {
  font-size: 0.72rem;
  color: #9ca3af;
  font-weight: 500;
}

/* =========================================================
   EMPTY STATE
========================================================= */

.empty-state {
  padding: 64px 20px;
  text-align: center;
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f3f4f6;
  color: #9ca3af;
}

.empty-title {
  font-size: 1rem;
  font-weight: 700;
  color: #374151;
}

.empty-description {
  margin-top: 4px;
  font-size: 0.82rem;
  color: #9ca3af;
}

/* =========================================================
   FOOTER
========================================================= */

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #eef0f2;
  padding-left: 18px;
}

.table-footer-text {
  color: #9ca3af;
  font-size: 0.75rem;
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 960px) {
  .attendance-dashboard {
    padding: 16px;
  }

  .dashboard-header {
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

  .table-footer {
    flex-direction: column;
    align-items: stretch;
    padding: 12px;
  }
}

@media (max-width: 600px) {
  .attendance-dashboard {
    padding: 10px;
  }

  .page-title {
    font-size: 1.25rem;
  }

  .toolbar-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .search-field {
    width: 100%;
  }

  .latest-employee {
    max-width: 140px;
  }
}
</style>