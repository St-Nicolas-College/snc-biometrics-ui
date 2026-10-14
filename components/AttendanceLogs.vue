<template>
  <div class="attendance-report">
    <!-- =========================================================
         REPORT SUMMARY
    ========================================================== -->
    <v-row class="summary-row">
      <!-- All Records -->
      <v-col
        cols="12"
        sm="6"
        lg="3"
      >
        <v-card
          elevation="0"
          class="summary-card"
          :class="{
            'summary-card-active':
              statusFilter === 'all'
          }"
          @click="statusFilter = 'all'"
        >
          <v-card-text class="summary-content">
            <div class="summary-top">
              <div class="summary-icon icon-records">
                <v-icon size="20">
                  mdi-file-document-outline
                </v-icon>
              </div>

              <span class="summary-tag">
                TOTAL
              </span>
            </div>

            <div class="summary-value">
              {{ logs.length }}
            </div>

            <div class="summary-label">
              Records
            </div>

            <div class="summary-description">
              Generated attendance records
            </div>

            <div class="summary-action">
              <span>
                View all records
              </span>

              <v-icon size="14">
                mdi-arrow-right
              </v-icon>
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
          :class="{
            'summary-card-active':
              statusFilter === 'on-time'
          }"
          @click="statusFilter = 'on-time'"
        >
          <v-card-text class="summary-content">
            <div class="summary-top">
              <div class="summary-icon icon-on-time">
                <v-icon size="20">
                  mdi-check-circle-outline
                </v-icon>
              </div>

              <span class="summary-tag text-success">
                ON SCHEDULE
              </span>
            </div>

            <div class="summary-value text-success">
              {{ onTimeCount }}
            </div>

            <div class="summary-label">
              On Time
            </div>

            <div class="summary-description">
              Arrived within schedule
            </div>

            <div class="summary-action">
              <span>
                View on-time records
              </span>

              <v-icon size="14">
                mdi-arrow-right
              </v-icon>
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
          :class="{
            'summary-card-active':
              statusFilter === 'late'
          }"
          @click="statusFilter = 'late'"
        >
          <v-card-text class="summary-content">
            <div class="summary-top">
              <div class="summary-icon icon-late">
                <v-icon size="20">
                  mdi-clock-alert-outline
                </v-icon>
              </div>

              <span class="summary-tag text-error">
                LATE
              </span>
            </div>

            <div class="summary-value text-error">
              {{ lateCount }}
            </div>

            <div class="summary-label">
              Late Records
            </div>

            <div class="summary-description">
              Attendance with lateness
            </div>

            <div class="summary-action">
              <span>
                Review late records
              </span>

              <v-icon size="14">
                mdi-arrow-right
              </v-icon>
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
          :class="{
            'summary-card-active':
              statusFilter === 'incomplete'
          }"
          @click="statusFilter = 'incomplete'"
        >
          <v-card-text class="summary-content">
            <div class="summary-top">
              <div class="summary-icon icon-incomplete">
                <v-icon size="20">
                  mdi-account-clock-outline
                </v-icon>
              </div>

              <span class="summary-tag text-warning">
                REVIEW
              </span>
            </div>

            <div class="summary-value text-warning">
              {{ noTimeOutCount }}
            </div>

            <div class="summary-label">
              No Time Out
            </div>

            <div class="summary-description">
              Incomplete attendance
            </div>

            <div class="summary-action">
              <span>
                Review incomplete records
              </span>

              <v-icon size="14">
                mdi-arrow-right
              </v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- =========================================================
         DATE RANGE
    ========================================================== -->
    <v-card
      elevation="0"
      class="filter-card"
    >
      <!-- Header -->
      <div class="card-header">
        <div class="card-heading">
          <div class="card-heading-icon">
            <v-icon size="19">
              mdi-calendar-range-outline
            </v-icon>
          </div>

          <div>
            <div class="section-title">
              Report Date Range
            </div>

            <div class="section-subtitle">
              Select the attendance period you want to include.
            </div>
          </div>
        </div>

        <v-chip
          v-if="hasGeneratedReport"
          size="small"
          color="success"
          variant="tonal"
          class="generated-chip"
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

      <!-- =======================================================
           QUICK RANGE
      ======================================================== -->
      <div class="quick-range-bar">
        <div class="quick-range-label">
          Quick Range
        </div>

        <v-btn-toggle
          v-model="activeQuickRange"
          color="primary"
          variant="outlined"
          density="compact"
          class="quick-range-toggle"
        >
          <v-btn
            value="today"
            size="small"
            @click="applyQuickRange('today')"
          >
            Today
          </v-btn>

          <v-btn
            value="week"
            size="small"
            @click="applyQuickRange('week')"
          >
            This Week
          </v-btn>

          <v-btn
            value="month"
            size="small"
            @click="applyQuickRange('month')"
          >
            This Month
          </v-btn>
        </v-btn-toggle>
      </div>

      <v-divider />

      <!-- =======================================================
           DATE FIELDS
      ======================================================== -->
      <v-card-text class="filter-content">
        <v-row align="end">
          <!-- Start Date -->
          <v-col
            cols="12"
            sm="6"
            md="4"
          >
            <div class="field-label-row">
              <div class="field-label">
                Start Date
              </div>

              <span>
                Required
              </span>
            </div>

            <v-date-input
              v-model="dateStart"
              density="comfortable"
              placeholder="Select start date"
              prepend-icon=""
              prepend-inner-icon="mdi-calendar-start-outline"
              variant="outlined"
              hide-details
              class="date-field"
              @update:model-value="activeQuickRange = null"
            />
          </v-col>

          <!-- End Date -->
          <v-col
            cols="12"
            sm="6"
            md="4"
          >
            <div class="field-label-row">
              <div class="field-label">
                End Date
              </div>

              <span>
                Required
              </span>
            </div>

            <v-date-input
              v-model="dateEnd"
              density="comfortable"
              placeholder="Select end date"
              prepend-icon=""
              prepend-inner-icon="mdi-calendar-end-outline"
              variant="outlined"
              hide-details
              class="date-field"
              @update:model-value="activeQuickRange = null"
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
                class="generate-button"
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
                class="clear-button"
                @click="clearReport"
              >
                Clear
              </v-btn>
            </div>
          </v-col>
        </v-row>

        <!-- =====================================================
             GENERATED REPORT INFORMATION
        ====================================================== -->
        <div
          v-if="hasGeneratedReport"
          class="generated-report-info"
        >
          <div class="generated-period">
            <div class="generated-period-icon">
              <v-icon size="18">
                mdi-calendar-check-outline
              </v-icon>
            </div>

            <div>
              <div class="generated-period-label">
                REPORT PERIOD
              </div>

              <div class="generated-period-value">
                {{ formatSelectedDate(dateStart) }}

                <v-icon
                  size="14"
                  class="mx-1"
                >
                  mdi-arrow-right
                </v-icon>

                {{ formatSelectedDate(dateEnd) }}
              </div>
            </div>
          </div>

          <div
            v-if="generatedAt"
            class="generated-time"
          >
            <v-icon size="15">
              mdi-clock-outline
            </v-icon>

            Generated
            {{ formatGeneratedTime(generatedAt) }}
          </div>
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
      density="comfortable"
      closable
      class="report-alert"
      @click:close="errorMessage = ''"
    >
      {{ errorMessage }}
    </v-alert>

    <!-- =========================================================
         REPORT TABLE
    ========================================================== -->
    <v-card
      elevation="0"
      class="report-table-card"
    >
      <!-- =======================================================
           TABLE HEADER
      ======================================================== -->
      <div class="table-toolbar">
        <div class="card-heading">
          <div class="card-heading-icon">
            <v-icon size="19">
              mdi-table-clock
            </v-icon>
          </div>

          <div>
            <div class="section-title">
              Attendance Records
            </div>

            <div class="section-subtitle">
              Detailed attendance for the generated report period.
            </div>
          </div>
        </div>

        <div class="toolbar-actions">
          <!-- Print -->
          <v-btn
            color="primary"
            variant="outlined"
            prepend-icon="mdi-printer-outline"
            :disabled="
              !hasGeneratedReport ||
              filteredLogs.length === 0
            "
            class="print-button"
            @click="printAttendanceReport"
          >
            Print / PDF
          </v-btn>

          <!-- Status Filter -->
          <v-select
            v-model="statusFilter"
            :items="statusFilterOptions"
            item-title="title"
            item-value="value"
            density="compact"
            variant="outlined"
            hide-details
            prepend-inner-icon="mdi-filter-outline"
            class="status-filter"
          />

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

      <!-- =======================================================
           RESULTS BAR
      ======================================================== -->
      <div class="results-bar">
        <div class="results-left">
          <div
            class="report-result-status"
            :class="{
              'report-result-status-active':
                hasGeneratedReport
            }"
          />

          <span>
            {{
              hasGeneratedReport
                ? 'Generated attendance report'
                : 'No report generated'
            }}
          </span>

          <template v-if="hasGeneratedReport">
            <span class="results-divider">
              •
            </span>

            <span>
              {{ reportPeriodText }}
            </span>
          </template>
        </div>

        <div class="results-right">
          Showing

          <strong>
            {{ filteredLogs.length }}
          </strong>

          of

          <strong>
            {{ logs.length }}
          </strong>

          records
        </div>
      </div>

      <v-divider />

      <!-- =======================================================
           TABLE
      ======================================================== -->
      <v-data-table
        :items="filteredLogs"
        :headers="headers"
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
            <div class="employee-avatar">
              {{ getInitials(item.name) }}
            </div>

            <div class="employee-info">
              <div class="employee-name">
                {{
                  item.name ||
                  'Unknown Employee'
                }}
              </div>

              <div class="employee-subtitle">
                Employee ID {{ item.user_id }}
              </div>
            </div>
          </div>
        </template>

        <!-- =====================================================
             DATE
        ====================================================== -->
        <template #[`item.log_date`]="{ item }">
          <div class="date-cell">
            <div class="date-calendar">
              <span>
                {{ getDateDay(item.log_date) }}
              </span>

              <small>
                {{ getDateMonth(item.log_date) }}
              </small>
            </div>

            <div>
              <div class="date-primary">
                {{ formatDate(item.log_date) }}
              </div>

              <div class="date-secondary">
                {{ getDayName(item.log_date) }}
              </div>
            </div>
          </div>
        </template>

        <!-- =====================================================
             SCHEDULE
        ====================================================== -->
        <template #[`item.schedule`]="{ item }">
          <div
            v-if="
              item.shift_start ||
              item.shift_end
            "
            class="schedule-cell"
          >
            <div class="schedule-icon">
              <v-icon size="15">
                mdi-clock-outline
              </v-icon>
            </div>

            <div>
              <div class="schedule-time">
                {{ formatShiftTime(item.shift_start) }}
                –
                {{ formatShiftTime(item.shift_end) }}
              </div>

              <div
                v-if="item.shift_name"
                class="schedule-name"
              >
                {{ item.shift_name }}
              </div>
            </div>
          </div>

          <div
            v-else
            class="no-schedule"
          >
            <v-icon size="14">
              mdi-calendar-remove-outline
            </v-icon>

            No schedule
          </div>
        </template>

        <!-- =====================================================
             TIME IN
        ====================================================== -->
        <template #[`item.in_time`]="{ item }">
          <div
            v-if="item.in_time"
            class="attendance-time"
          >
            <div class="time-icon time-icon-in">
              <v-icon size="14">
                mdi-login
              </v-icon>
            </div>

            <span class="time-in">
              {{ formatTime(item.in_time) }}
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
             TIME OUT
        ====================================================== -->
        <template #[`item.out_time`]="{ item }">
          <v-chip
            v-if="hasNoTimeOut(item)"
            size="small"
            color="warning"
            variant="tonal"
            class="status-chip"
          >
            <v-icon
              start
              size="13"
            >
              mdi-clock-alert-outline
            </v-icon>

            No Time Out
          </v-chip>

          <div
            v-else
            class="attendance-time"
          >
            <div class="time-icon time-icon-out">
              <v-icon size="14">
                mdi-logout
              </v-icon>
            </div>

            <span class="time-out">
              {{ formatTime(item.out_time) }}
            </span>
          </div>
        </template>

        <!-- =====================================================
             LATENESS
        ====================================================== -->
        <template #[`item.late_status`]="{ item }">
          <v-chip
            v-if="
              Number(
                item.late_minutes ??
                0
              ) > 0
            "
            size="small"
            color="error"
            variant="tonal"
            class="status-chip"
          >
            <v-icon
              start
              size="13"
            >
              mdi-clock-alert-outline
            </v-icon>

            {{ item.late_minutes }}
            min Late
          </v-chip>

          <v-chip
            v-else-if="isOnTime(item)"
            size="small"
            color="success"
            variant="tonal"
            class="status-chip"
          >
            <v-icon
              start
              size="13"
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
            class="status-chip"
          >
            <v-icon
              start
              size="13"
            >
              {{
                getEarlyLeaveMeta(
                  item.early_leave_status
                ).icon
              }}
            </v-icon>

            {{
              getEarlyLeaveDisplay(
                item.early_leave_status
              )
            }}
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
            <span class="total-hours-value">
              {{ item.total_hours }}
            </span>

            <span class="total-hours-label">
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
              <v-icon size="35">
                {{
                  hasGeneratedReport
                    ? 'mdi-file-search-outline'
                    : 'mdi-file-chart-outline'
                }}
              </v-icon>
            </div>

            <div class="empty-title">
              {{
                hasGeneratedReport
                  ? 'No attendance records found'
                  : 'No report generated'
              }}
            </div>

            <div class="empty-description">
              {{
                hasGeneratedReport
                  ? 'Try changing the employee search or attendance status filter.'
                  : 'Select a report period above, then click Generate Report.'
              }}
            </div>

            <v-btn
              v-if="
                hasGeneratedReport &&
                hasActiveTableFilters
              "
              color="primary"
              variant="tonal"
              size="small"
              prepend-icon="mdi-filter-remove-outline"
              class="mt-4"
              @click="resetTableFilters"
            >
              Reset Table Filters
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck

import {
  printReport
} from '~/utils/printReport'

/* ==========================================================================
   TYPES
============================================================================ */

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

/* ==========================================================================
   STATE
============================================================================ */

const dateStart =
  ref<Date | null>(
    null
  )

const dateEnd =
  ref<Date | null>(
    null
  )

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

const generatedAt =
  ref<Date | null>(
    null
  )

const activeQuickRange =
  ref<
    'today' |
    'week' |
    'month' |
    null
  >(null)

const statusFilter =
  ref<
    'all' |
    'on-time' |
    'late' |
    'incomplete'
  >('all')

/* ==========================================================================
   STATUS FILTER
============================================================================ */

const statusFilterOptions = [
  {
    title:
      'All Records',

    value:
      'all'
  },

  {
    title:
      'On Time',

    value:
      'on-time'
  },

  {
    title:
      'Late',

    value:
      'late'
  },

  {
    title:
      'No Time Out',

    value:
      'incomplete'
  }
]

/* ==========================================================================
   SORT
============================================================================ */

const defaultSort =
  ref([
    {
      key:
        'log_date',

      order:
        'desc' as const
    }
  ])

/* ==========================================================================
   HEADERS
============================================================================ */

const headers = [
  {
    title:
      'Employee',

    key:
      'name',

    sortable:
      true,

    minWidth:
      220
  },

  {
    title:
      'Date',

    key:
      'log_date',

    sortable:
      true,

    minWidth:
      165
  },

  {
    title:
      'Schedule',

    key:
      'schedule',

    sortable:
      false,

    minWidth:
      165
  },

  {
    title:
      'Time In',

    key:
      'in_time',

    sortable:
      false,

    width:
      135
  },

  {
    title:
      'Time Out',

    key:
      'out_time',

    sortable:
      false,

    width:
      145
  },

  {
    title:
      'Lateness',

    key:
      'late_status',

    sortable:
      true,

    width:
      135
  },

  {
    title:
      'Early Leave',

    key:
      'early_leave_status',

    sortable:
      true,

    width:
      135
  },

  {
    title:
      'Total Hours',

    key:
      'total_hours',

    sortable:
      true,

    width:
      110
  }
]

/* ==========================================================================
   ATTENDANCE HELPERS
============================================================================ */

const hasNoTimeOut =
  (
    item:
      AttendanceLog
  ) => {
    return (
      !item.out_time ||
      item.in_time ===
        item.out_time
    )
  }

const isOnTime =
  (
    item:
      AttendanceLog
  ) => {
    const status =
      String(
        item.late_status ??
        ''
      )
        .trim()
        .toLowerCase()

    const lateMinutes =
      Number(
        item.late_minutes ??
        0
      )

    return (
      status.includes(
        'on time'
      ) ||
      (
        Boolean(
          item.late_status
        ) &&
        lateMinutes === 0
      )
    )
  }

/* ==========================================================================
   SUMMARY
============================================================================ */

const onTimeCount =
  computed(
    () => {
      return logs.value
        .filter(
          item =>
            isOnTime(
              item
            )
        )
        .length
    }
  )

const lateCount =
  computed(
    () => {
      return logs.value
        .filter(
          item =>
            Number(
              item.late_minutes ??
                0
            ) > 0
        )
        .length
    }
  )

const noTimeOutCount =
  computed(
    () => {
      return logs.value
        .filter(
          item =>
            hasNoTimeOut(
              item
            )
        )
        .length
    }
  )

/* ==========================================================================
   FILTER TABLE
============================================================================ */

const filteredLogs =
  computed(
    () => {
      let result = [
        ...logs.value
      ]

      /* ================================================================
         STATUS
      ================================================================= */

      switch (
        statusFilter.value
      ) {
        case 'on-time':
          result =
            result.filter(
              item =>
                isOnTime(
                  item
                )
            )

          break

        case 'late':
          result =
            result.filter(
              item =>
                Number(
                  item.late_minutes ??
                    0
                ) > 0
            )

          break

        case 'incomplete':
          result =
            result.filter(
              item =>
                hasNoTimeOut(
                  item
                )
            )

          break
      }

      /* ================================================================
         SEARCH
      ================================================================= */

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
              const searchableValues = [
                item.name,
                item.user_id,
                item.log_date,
                item.shift_name,
                item.late_status,
                item.early_leave_status
              ]

              return searchableValues
                .some(
                  value =>
                    String(
                      value ??
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

      return result
    }
  )

const hasActiveTableFilters =
  computed(
    () => {
      return (
        Boolean(
          search.value
        ) ||
        statusFilter.value !==
          'all'
      )
    }
  )

const resetTableFilters =
  () => {
    search.value =
      ''

    statusFilter.value =
      'all'
  }

/* ==========================================================================
   REPORT PERIOD
============================================================================ */

const reportPeriodText =
  computed(
    () => {
      if (
        !dateStart.value ||
        !dateEnd.value
      ) {
        return ''
      }

      return (
        `${formatSelectedDate(
          dateStart.value
        )} – ${formatSelectedDate(
          dateEnd.value
        )}`
      )
    }
  )

/* ==========================================================================
   API DATE FORMAT
============================================================================ */

const formatSearchDate =
  (
    value:
      Date
  ) => {
    const day =
      String(
        value.getDate()
      ).padStart(
        2,
        '0'
      )

    const month =
      String(
        value.getMonth() +
          1
      ).padStart(
        2,
        '0'
      )

    const year =
      value.getFullYear()

    return (
      `${day}/${month}/${year}`
    )
  }

/* ==========================================================================
   GENERATE REPORT
============================================================================ */

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
        result ??
        []

      hasGeneratedReport.value =
        true

      generatedAt.value =
        new Date()

      statusFilter.value =
        'all'

      search.value =
        ''

      errorMessage.value =
        ''
    } catch (
      error
    ) {
      console.error(
        'Attendance report error:',
        error
      )

      logs.value =
        []

      hasGeneratedReport.value =
        false

      generatedAt.value =
        null

      errorMessage.value =
        'Unable to generate the attendance report.'
    } finally {
      loading.value =
        false
    }
  }

/* ==========================================================================
   QUICK RANGE
============================================================================ */

const applyQuickRange =
  async (
    range:
      'today' |
      'week' |
      'month'
  ) => {
    activeQuickRange.value =
      range

    const today =
      new Date()

    today.setHours(
      0,
      0,
      0,
      0
    )

    let startDate =
      new Date(
        today
      )

    /* ================================================================
       THIS WEEK
       Monday = first day
    ================================================================= */

    if (
      range ===
      'week'
    ) {
      const weekday =
        today.getDay()

      const daysFromMonday =
        weekday === 0
          ? 6
          : weekday - 1

      startDate.setDate(
        today.getDate() -
          daysFromMonday
      )
    }

    /* ================================================================
       THIS MONTH
    ================================================================= */

    if (
      range ===
      'month'
    ) {
      startDate =
        new Date(
          today.getFullYear(),
          today.getMonth(),
          1
        )
    }

    dateStart.value =
      startDate

    dateEnd.value =
      new Date(
        today
      )

    await nextTick()

    await searchAttendanceRange()
  }

/* ==========================================================================
   CLEAR REPORT
============================================================================ */

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

    generatedAt.value =
      null

    activeQuickRange.value =
      null

    statusFilter.value =
      'all'
  }

/* ==========================================================================
   INITIALS
============================================================================ */

const getInitials =
  (
    name?:
      string
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
          parts.length -
            1
        ]?.[0] ??
          ''
      )
    ).toUpperCase()
  }

/* ==========================================================================
   DATE PARSING
============================================================================ */

const parseDateValue =
  (
    value?:
      string
  ) => {
    if (
      !value
    ) {
      return null
    }

    const cleanValue =
      String(
        value
      ).trim()

    /*
     * YYYY-MM-DD returned by
     * attendance APIs.
     *
     * Build it as local date
     * to avoid UTC date shifting.
     */

    const match =
      cleanValue.match(
        /^(\d{4})-(\d{2})-(\d{2})$/
      )

    if (
      match
    ) {
      return new Date(
        Number(
          match[1]
        ),
        Number(
          match[2]
        ) - 1,
        Number(
          match[3]
        )
      )
    }

    const date =
      new Date(
        cleanValue
      )

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return null
    }

    return date
  }

/* ==========================================================================
   FORMAT DATE
============================================================================ */

const formatDate =
  (
    value?:
      string
  ) => {
    const date =
      parseDateValue(
        value
      )

    if (
      !date
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

const getDayName =
  (
    value?:
      string
  ) => {
    const date =
      parseDateValue(
        value
      )

    if (
      !date
    ) {
      return ''
    }

    return date
      .toLocaleDateString(
        'en-PH',
        {
          weekday:
            'long'
        }
      )
  }

const getDateDay =
  (
    value?:
      string
  ) => {
    const date =
      parseDateValue(
        value
      )

    if (
      !date
    ) {
      return '--'
    }

    return String(
      date.getDate()
    ).padStart(
      2,
      '0'
    )
  }

const getDateMonth =
  (
    value?:
      string
  ) => {
    const date =
      parseDateValue(
        value
      )

    if (
      !date
    ) {
      return '---'
    }

    return date
      .toLocaleDateString(
        'en-PH',
        {
          month:
            'short'
        }
      )
      .toUpperCase()
  }

/* ==========================================================================
   ATTENDANCE TIME
============================================================================ */

const formatTime =
  (
    value?:
      string
  ) => {
    if (
      !value
    ) {
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

          second:
            '2-digit',

          hour12:
            true
        }
      )
  }

/* ==========================================================================
   SHIFT TIME
============================================================================ */

const formatShiftTime =
  (
    value?:
      string
  ) => {
    if (
      !value
    ) {
      return '—'
    }

    const match =
      value.match(
        /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/
      )

    if (
      !match
    ) {
      return value
    }

    const hour =
      Number(
        match[1]
      )

    const minute =
      match[2]

    const period =
      hour >= 12
        ? 'PM'
        : 'AM'

    const displayHour =
      hour % 12 ||
      12

    return (
      `${displayHour}:${minute} ${period}`
    )
  }

/* ==========================================================================
   SELECTED DATE
============================================================================ */

const formatSelectedDate =
  (
    value:
      Date |
      null
  ) => {
    if (
      !value
    ) {
      return '—'
    }

    return value
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
   GENERATED TIME
============================================================================ */

const formatGeneratedTime =
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
   EARLY LEAVE
============================================================================ */

const getEarlyLeaveMeta =
  (
    status?:
      string
  ) => {
    if (
      !status
    ) {
      return {
        color:
          'grey',

        icon:
          'mdi-minus-circle-outline'
      }
    }

    const value =
      status
        .trim()
        .toUpperCase()

    if (
      value.includes(
        'EARLY'
      )
    ) {
      return {
        color:
          'warning',

        icon:
          'mdi-clock-minus-outline'
      }
    }

    if (
      value.includes(
        'OK'
      )
    ) {
      return {
        color:
          'success',

        icon:
          'mdi-check-circle-outline'
      }
    }

    return {
      color:
        'grey',

      icon:
        'mdi-information-outline'
    }
  }

const getEarlyLeaveDisplay =
  (
    status?:
      string
  ) => {
    if (
      !status
    ) {
      return '—'
    }

    const value =
      status
        .trim()
        .toUpperCase()

    if (
      value.includes(
        'EARLY'
      )
    ) {
      return 'Left Early'
    }

    if (
      value.includes(
        'OK'
      )
    ) {
      return 'OK'
    }

    return status
  }

/* ==========================================================================
   PRINT / PDF
============================================================================ */

const printAttendanceReport =
  () => {
    if (
      !hasGeneratedReport.value ||
      filteredLogs.value.length ===
        0
    ) {
      return
    }

    const records =
      filteredLogs.value

    const printedOnTime =
      records.filter(
        item =>
          isOnTime(
            item
          )
      ).length

    const printedLate =
      records.filter(
        item =>
          Number(
            item.late_minutes ??
              0
          ) > 0
      ).length

    const printedIncomplete =
      records.filter(
        item =>
          hasNoTimeOut(
            item
          )
      ).length

    try {
      printReport({
        title:
          'Attendance Logs Report',

        subtitle:
          'Detailed biometric attendance records',

        period:
          reportPeriodText.value,

        orientation:
          'portraits',

        note:
          hasActiveTableFilters.value
            ? 'This report reflects the currently selected table filters.'
            : undefined,

        metrics: [
          {
            label:
              'Records',

            value:
              records.length
          },

          {
            label:
              'On Time',

            value:
              printedOnTime
          },

          {
            label:
              'Late',

            value:
              printedLate
          },

          {
            label:
              'No Time Out',

            value:
              printedIncomplete
          }
        ],

        columns: [
          {
            key:
              'employee',

            label:
              'Employee'
          },

          {
            key:
              'date',

            label:
              'Date'
          },

          {
            key:
              'schedule',

            label:
              'Schedule'
          },

          {
            key:
              'time_in',

            label:
              'Time In'
          },

          {
            key:
              'time_out',

            label:
              'Time Out'
          },

          {
            key:
              'lateness',

            label:
              'Lateness'
          },

          // {
          //   key:
          //     'early_leave',

          //   label:
          //     'Early Leave'
          // },

          {
            key:
              'total_hours',

            label:
              'Total Hours',

            align:
              'right'
          }
        ],

        rows:
          records.map(
            item => {
              const lateMinutes =
                Number(
                  item.late_minutes ??
                    0
                )

              const dayName =
                getDayName(
                  item.log_date
                )

              return {
                employee:
                  `${
                    item.name ||
                    'Unknown Employee'
                  } (ID ${
                    item.user_id
                  })`,

                date:
                  dayName
                    ? `${
                        formatDate(
                          item.log_date
                        )
                      } - ${dayName}`
                    : formatDate(
                        item.log_date
                      ),

                schedule:
                  (
                    item.shift_start ||
                    item.shift_end
                  )
                    ? `${
                        formatShiftTime(
                          item.shift_start
                        )
                      } - ${
                        formatShiftTime(
                          item.shift_end
                        )
                      }${
                        item.shift_name
                          ? ` (${item.shift_name})`
                          : ''
                      }`
                    : 'No schedule',

                time_in:
                  formatTime(
                    item.in_time
                  ),

                time_out:
                  hasNoTimeOut(
                    item
                  )
                    ? 'No Time Out'
                    : formatTime(
                        item.out_time
                      ),

                lateness:
                  lateMinutes >
                  0
                    ? `${lateMinutes} min Late`
                    : isOnTime(
                        item
                      )
                      ? 'On Time'
                      : '—',

                early_leave:
                  getEarlyLeaveDisplay(
                    item.early_leave_status
                  ),

                total_hours:
                  item.total_hours !==
                    null &&
                  item.total_hours !==
                    undefined
                    ? `${item.total_hours} hrs`
                    : '—'
              }
            }
          )
      })
    } catch (
      error:
        any
    ) {
      console.error(
        'Print report error:',
        error
      )

      errorMessage.value =
        error?.message ??
        'Unable to open the print report.'
    }
  }
</script>

<style scoped>
/* ==========================================================================
   COMPONENT
============================================================================ */

.attendance-report {
  width: 100%;
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

  border:
    1px solid
    #e5e9e6;

  border-radius: 13px;

  background: #ffffff;

  cursor: pointer;

  box-shadow:
    0 3px 12px
    rgba(
      15,
      23,
      42,
      0.022
    );

  transition:
    transform
      0.15s ease,
    border-color
      0.15s ease,
    box-shadow
      0.15s ease;
}

.summary-card:hover {
  transform:
    translateY(-2px);

  border-color:
    #d7e7db;

  box-shadow:
    0 8px 20px
    rgba(
      15,
      23,
      42,
      0.05
    );
}

.summary-card-active {
  border-color:
    rgba(
      22,
      163,
      74,
      0.33
    );

  background:
    linear-gradient(
      145deg,
      #f8fcf9,
      #ffffff
    );

  box-shadow:
    0 0 0
    2px
    rgba(
      22,
      163,
      74,
      0.045
    );
}

.summary-content {
  padding:
    17px !important;
}

.summary-top {
  display: flex;

  align-items:
    center;

  justify-content:
    space-between;
}

.summary-icon {
  width: 39px;

  height: 39px;

  display: flex;

  align-items:
    center;

  justify-content:
    center;

  border-radius: 10px;
}

.icon-records {
  background:
    #edf9f1;

  color:
    #15803d;
}

.icon-on-time {
  background:
    #effbf3;

  color:
    #16a34a;
}

.icon-late {
  background:
    #fff5f5;

  color:
    #dc2626;
}

.icon-incomplete {
  background:
    #fff8eb;

  color:
    #d97706;
}

.summary-tag {
  color:
    #9ca3af;

  font-size:
    0.51rem;

  font-weight:
    750;

  letter-spacing:
    0.07em;
}

.summary-value {
  margin-top:
    13px;

  color:
    #1f2937;

  font-size:
    1.75rem;

  font-weight:
    780;

  line-height:
    1;
}

.summary-label {
  margin-top:
    8px;

  color:
    #374151;

  font-size:
    0.71rem;

  font-weight:
    680;
}

.summary-description {
  margin-top:
    3px;

  color:
    #9ca3af;

  font-size:
    0.62rem;
}

.summary-action {
  display: flex;

  align-items:
    center;

  justify-content:
    space-between;

  margin-top:
    13px;

  padding-top:
    9px;

  border-top:
    1px solid
    #f0f2f1;

  color:
    #a0a7b0;

  font-size:
    0.56rem;
}

/* ==========================================================================
   CARDS
============================================================================ */

.filter-card,
.report-table-card {
  overflow: hidden;

  border:
    1px solid
    #e5e9e6;

  border-radius: 13px;

  background:
    #ffffff;

  box-shadow:
    0 3px 14px
    rgba(
      15,
      23,
      42,
      0.02
    );
}

.filter-card {
  margin-bottom: 16px;
}

/* ==========================================================================
   HEADERS
============================================================================ */

.card-header,
.table-toolbar {
  min-height: 70px;

  display: flex;

  align-items: center;

  justify-content:
    space-between;

  gap: 16px;

  padding:
    14px 17px;
}

.card-heading {
  display: flex;

  align-items:
    center;

  gap: 9px;
}

.card-heading-icon {
  width: 37px;

  height: 37px;

  display: flex;

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
    9px;

  background:
    #eff9f2;

  color:
    #15803d;
}

.section-title {
  color:
    #1f2937;

  font-size:
    0.89rem;

  font-weight:
    720;
}

.section-subtitle {
  margin-top:
    2px;

  color:
    #9ca3af;

  font-size:
    0.63rem;
}

.generated-chip {
  font-size:
    0.58rem;
}

/* ==========================================================================
   QUICK RANGE
============================================================================ */

.quick-range-bar {
  display: flex;

  align-items:
    center;

  gap: 11px;

  padding:
    9px 17px;

  background:
    #fafbfa;
}

.quick-range-label {
  color:
    #8e969f;

  font-size:
    0.61rem;

  font-weight:
    650;
}

.quick-range-toggle {
  overflow:
    hidden;

  border-radius:
    8px;
}

:deep(
  .quick-range-toggle
  .v-btn
) {
  min-height:
    29px;

  padding-inline:
    11px;

  text-transform:
    none;

  font-size:
    0.61rem;

  letter-spacing:
    0;
}

/* ==========================================================================
   FILTER
============================================================================ */

.filter-content {
  padding:
    17px !important;
}

.field-label-row {
  display: flex;

  align-items:
    center;

  justify-content:
    space-between;

  margin-bottom:
    7px;
}

.field-label {
  color:
    #4b5563;

  font-size:
    0.67rem;

  font-weight:
    650;
}

.field-label-row > span {
  color:
    #a3aab2;

  font-size:
    0.52rem;

  text-transform:
    uppercase;
}

:deep(
  .date-field
  .v-field
) {
  border-radius:
    9px;
}

.filter-actions {
  display: flex;

  align-items:
    center;

  gap:
    8px;
}

.generate-button,
.clear-button,
.print-button {
  min-height: 40px;

  text-transform: none;

  font-size:
    0.65rem;

  font-weight:
    650;

  letter-spacing:
    0;

  white-space:
    nowrap;
}

/* ==========================================================================
   GENERATED REPORT
============================================================================ */

.generated-report-info {
  display: flex;

  align-items:
    center;

  justify-content:
    space-between;

  gap: 16px;

  margin-top:
    15px;

  padding:
    10px 12px;

  border:
    1px solid
    #dcece1;

  border-radius:
    10px;

  background:
    linear-gradient(
      90deg,
      #f4faf6,
      #fbfdfb
    );
}

.generated-period {
  display: flex;

  align-items:
    center;

  gap: 8px;
}

.generated-period-icon {
  width: 32px;

  height: 32px;

  display: flex;

  align-items:
    center;

  justify-content:
    center;

  flex-shrink:
    0;

  border-radius:
    8px;

  background:
    #dff2e4;

  color:
    #15803d;
}

.generated-period-label {
  color:
    #929c95;

  font-size:
    0.51rem;

  font-weight:
    720;

  letter-spacing:
    0.06em;
}

.generated-period-value {
  display: flex;

  align-items:
    center;

  margin-top:
    2px;

  color:
    #374151;

  font-size:
    0.64rem;

  font-weight:
    650;
}

.generated-time {
  display: flex;

  align-items:
    center;

  gap: 5px;

  color:
    #929aa4;

  font-size:
    0.56rem;
}

/* ==========================================================================
   ERROR
============================================================================ */

.report-alert {
  margin-bottom:
    16px;
}

/* ==========================================================================
   TABLE TOOLBAR
============================================================================ */

.toolbar-actions {
  display: flex;

  align-items:
    center;

  gap: 8px;
}

.status-filter {
  width:
    165px;
}

.search-field {
  width:
    235px;
}

:deep(
  .status-filter
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
    38px;

  display: flex;

  align-items:
    center;

  justify-content:
    space-between;

  gap: 12px;

  padding:
    8px 17px;

  border-top:
    1px solid
    #f0f2f1;

  background:
    #fafbfa;

  color:
    #929aa4;

  font-size:
    0.58rem;
}

.results-left {
  display: flex;

  align-items:
    center;

  gap: 6px;
}

.report-result-status {
  width:
    6px;

  height:
    6px;

  border-radius:
    50%;

  background:
    #c5cbd0;
}

.report-result-status-active {
  background:
    #22c55e;

  box-shadow:
    0 0 0
    4px
    rgba(
      34,
      197,
      94,
      0.1
    );
}

.results-divider {
  color:
    #c4c9ce;
}

.results-right strong {
  color:
    #4b5563;
}

/* ==========================================================================
   TABLE
============================================================================ */

:deep(
  .attendance-report-table
  .v-table__wrapper
) {
  overflow-x:
    auto;
}

:deep(
  .attendance-report-table
  thead
  th
) {
  height:
    47px !important;

  padding-left:
    9px !important;

  padding-right:
    9px !important;

  border-bottom:
    1px solid
    #e8ebe9 !important;

  background:
    #fafbfa !important;

  color:
    #667085 !important;

  font-size:
    0.62rem !important;

  font-weight:
    720 !important;

  letter-spacing:
    0.035em;

  text-transform:
    uppercase;

  white-space:
    nowrap;
}

:deep(
  .attendance-report-table
  tbody
  td
) {
  height:
    62px !important;

  padding-left:
    9px !important;

  padding-right:
    9px !important;

  border-bottom:
    1px solid
    #f0f2f1 !important;

  color:
    #374151;

  font-size:
    0.72rem;

  white-space:
    nowrap;
}

:deep(
  .attendance-report-table
  tbody
  tr
) {
  transition:
    background-color
    0.15s ease;
}

:deep(
  .attendance-report-table
  tbody
  tr:hover
) {
  background:
    #f8fbf9 !important;
}

/* ==========================================================================
   EMPLOYEE
============================================================================ */

.employee-cell {
  display: flex;

  align-items:
    center;

  gap: 9px;
}

.employee-avatar {
  width:
    36px;

  height:
    36px;

  display: flex;

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
    10px;

  background:
    #ebf8ef;

  color:
    #15803d;

  font-size:
    0.64rem;

  font-weight:
    760;
}

.employee-info {
  min-width:
    0;
}

.employee-name {
  max-width:
    180px;

  overflow:
    hidden;

  color:
    #1f2937;

  font-size:
    0.71rem;

  font-weight:
    680;

  text-overflow:
    ellipsis;

  white-space:
    nowrap;
}

.employee-subtitle {
  margin-top:
    2px;

  color:
    #9ca3af;

  font-size:
    0.56rem;
}

/* ==========================================================================
   DATE
============================================================================ */

.date-cell {
  display: flex;

  align-items:
    center;

  gap: 8px;
}

.date-calendar {
  width:
    36px;

  height:
    39px;

  display: flex;

  flex-direction:
    column;

  align-items:
    center;

  justify-content:
    center;

  flex-shrink:
    0;

  border:
    1px solid
    #dfe7e2;

  border-radius:
    8px;

  background:
    #f6faf7;
}

.date-calendar span {
  color:
    #374151;

  font-size:
    0.68rem;

  font-weight:
    760;

  line-height:
    1;
}

.date-calendar small {
  margin-top:
    3px;

  color:
    #15803d;

  font-size:
    0.44rem;

  font-weight:
    750;
}

.date-primary {
  color:
    #374151;

  font-size:
    0.65rem;

  font-weight:
    640;
}

.date-secondary {
  margin-top:
    2px;

  color:
    #9ca3af;

  font-size:
    0.54rem;
}

/* ==========================================================================
   SCHEDULE
============================================================================ */

.schedule-cell {
  display: flex;

  align-items:
    center;

  gap: 7px;
}

.schedule-icon {
  width:
    28px;

  height:
    28px;

  display: flex;

  align-items:
    center;

  justify-content:
    center;

  flex-shrink:
    0;

  border-radius:
    7px;

  background:
    #f1f3f2;

  color:
    #6b7280;
}

.schedule-time {
  color:
    #4b5563;

  font-size:
    0.62rem;

  font-weight:
    640;
}

.schedule-name {
  max-width:
    115px;

  margin-top:
    2px;

  overflow:
    hidden;

  color:
    #9ca3af;

  font-size:
    0.52rem;

  text-overflow:
    ellipsis;

  white-space:
    nowrap;
}

.no-schedule {
  display:
    inline-flex;

  align-items:
    center;

  gap:
    4px;

  color:
    #adb4bc;

  font-size:
    0.58rem;
}

/* ==========================================================================
   TIME
============================================================================ */

.attendance-time {
  display: flex;

  align-items:
    center;

  gap: 5px;
}

.time-icon {
  width:
    25px;

  height:
    25px;

  display: flex;

  align-items:
    center;

  justify-content:
    center;

  flex-shrink:
    0;

  border-radius:
    7px;
}

.time-icon-in {
  background:
    #e9f8ee;

  color:
    #15803d;
}

.time-icon-out {
  background:
    #eff6ff;

  color:
    #2563eb;
}

.time-in {
  color:
    #15803d;

  font-size:
    0.64rem;

  font-weight:
    650;
}

.time-out {
  color:
    #2563eb;

  font-size:
    0.64rem;

  font-weight:
    650;
}

/* ==========================================================================
   STATUS
============================================================================ */

.status-chip {
  font-size:
    0.56rem;
}

/* ==========================================================================
   HOURS
============================================================================ */

.total-hours {
  display: flex;

  align-items:
    baseline;

  gap:
    3px;
}

.total-hours-value {
  color:
    #374151;

  font-size:
    0.69rem;

  font-weight:
    740;
}

.total-hours-label {
  color:
    #9ca3af;

  font-size:
    0.52rem;
}

.empty-value {
  color:
    #c1c6cc;
}

/* ==========================================================================
   EMPTY
============================================================================ */

.empty-state {
  padding:
    58px 20px;

  text-align:
    center;
}

.empty-icon {
  width:
    62px;

  height:
    62px;

  display: flex;

  align-items:
    center;

  justify-content:
    center;

  margin:
    0 auto 13px;

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
    0.88rem;

  font-weight:
    700;
}

.empty-description {
  max-width:
    370px;

  margin:
    5px auto 0;

  color:
    #9ca3af;

  font-size:
    0.65rem;

  line-height:
    1.5;
}

/* ==========================================================================
   TABLET
============================================================================ */

@media (
  max-width: 960px
) {
  .card-header,
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
      wrap;
  }

  .print-button {
    flex-shrink:
      0;
  }

  .status-filter {
    width:
      180px;
  }

  .search-field {
    flex:
      1;

    width:
      auto;

    min-width:
      200px;
  }

  .filter-actions {
    width:
      100%;
  }

  .filter-actions .v-btn {
    flex:
      1;
  }

  .generated-report-info {
    align-items:
      flex-start;

    flex-direction:
      column;
  }
}

/* ==========================================================================
   MOBILE
============================================================================ */

@media (
  max-width: 600px
) {
  .summary-action {
    display:
      none;
  }

  .quick-range-bar {
    align-items:
      flex-start;

    flex-direction:
      column;
  }

  .quick-range-toggle {
    width:
      100%;
  }

  :deep(
    .quick-range-toggle
    .v-btn
  ) {
    flex:
      1;
  }

  .filter-actions {
    align-items:
      stretch;

    flex-direction:
      column;
  }

  .filter-actions .v-btn {
    width:
      100%;
  }

  .toolbar-actions {
    align-items:
      stretch;

    flex-direction:
      column;
  }

  .print-button,
  .status-filter,
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

  .generated-period-value {
    align-items:
      flex-start;

    flex-wrap:
      wrap;
  }
}

/* ==========================================================================
   REDUCED MOTION
============================================================================ */

@media (
  prefers-reduced-motion:
  reduce
) {
  .summary-card {
    transition:
      none;
  }
}
</style>