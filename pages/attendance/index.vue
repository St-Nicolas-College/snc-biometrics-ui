<template>
  <div class="attendance-page">
    <!-- =========================================================
         PAGE HEADER
    ========================================================== -->
    <div class="page-header">
      <div class="page-heading">
        <div class="page-heading-icon">
          <v-icon size="23"> mdi-calendar-clock-outline </v-icon>
        </div>

        <div>
          <h1 class="page-title">Attendance Records</h1>

          <p class="page-subtitle">
            Review employee schedules, attendance, lateness, early departures,
            and working hours.
          </p>
        </div>
      </div>

      <div class="header-actions">
        <!-- Live Status -->
        <div
          class="connection-status"
          :class="{
            'connection-online': realtimeConnected,
            'connection-offline': !realtimeConnected,
          }"
        >
          <span
            class="connection-dot"
            :class="{
              'connection-dot-active': realtimeConnected,
            }"
          />

          {{
            realtimeConnected ? "Live Updates Active" : "Live Updates Offline"
          }}
        </div>

        <!-- Last Updated -->
        <div v-if="lastUpdated" class="updated-status">
          <v-icon size="15"> mdi-clock-outline </v-icon>

          Updated
          {{ formatLastUpdated(lastUpdated) }}
        </div>
      </div>
    </div>

    <!-- =========================================================
         PERIOD INFORMATION
    ========================================================== -->
    <div class="period-bar">
      <div class="period-icon">
        <v-icon size="20"> mdi-calendar-range-outline </v-icon>
      </div>

      <div class="period-information">
        <div class="period-label">Current View</div>

        <div class="period-value">
          {{ currentPeriodLabel }}
        </div>
      </div>

      <div class="period-spacer" />

      <div class="period-meta">
        <div class="period-meta-item">
          <span class="period-meta-value">
            {{ logs.length }}
          </span>

          <span class="period-meta-label"> Records </span>
        </div>

        <div class="period-meta-divider" />

        <div class="period-meta-item">
          <span class="period-meta-value">
            {{ filteredLogs.length }}
          </span>

          <span class="period-meta-label"> Displayed </span>
        </div>
      </div>
    </div>

    <!-- =========================================================
         SUMMARY CARDS
    ========================================================== -->
    <v-row class="summary-row">
      <!-- Records -->
      <v-col cols="12" sm="6" lg="3">
        <v-card
          elevation="0"
          class="summary-card"
          :class="{
            'summary-card-selected': statusFilter === 'all',
          }"
          @click="statusFilter = 'all'"
        >
          <v-card-text class="summary-card-content">
            <div class="summary-top">
              <div class="summary-icon icon-records">
                <v-icon size="21"> mdi-file-document-multiple-outline </v-icon>
              </div>

              <div class="summary-tag">TOTAL</div>
            </div>

            <div class="summary-value">
              {{ logs.length }}
            </div>

            <div class="summary-label">Attendance Records</div>

            <div class="summary-description">
              Records in the selected period
            </div>

            <div class="summary-footer">
              <span> View all records </span>

              <v-icon size="15"> mdi-arrow-right </v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- On Time -->
      <v-col cols="12" sm="6" lg="3">
        <v-card
          elevation="0"
          class="summary-card"
          :class="{
            'summary-card-selected': statusFilter === 'on-time',
          }"
          @click="statusFilter = 'on-time'"
        >
          <v-card-text class="summary-card-content">
            <div class="summary-top">
              <div class="summary-icon icon-on-time">
                <v-icon size="21"> mdi-check-circle-outline </v-icon>
              </div>

              <div class="summary-tag summary-tag-success">ON SCHEDULE</div>
            </div>

            <div class="summary-value text-success">
              {{ onTimeCount }}
            </div>

            <div class="summary-label">On Time</div>

            <div class="summary-description">
              Employees who arrived on schedule
            </div>

            <div class="summary-footer">
              <span> View on-time records </span>

              <v-icon size="15"> mdi-arrow-right </v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Late -->
      <v-col cols="12" sm="6" lg="3">
        <v-card
          elevation="0"
          class="summary-card"
          :class="{
            'summary-card-selected': statusFilter === 'late',
          }"
          @click="statusFilter = 'late'"
        >
          <v-card-text class="summary-card-content">
            <div class="summary-top">
              <div class="summary-icon icon-late">
                <v-icon size="21"> mdi-clock-alert-outline </v-icon>
              </div>

              <div class="summary-tag summary-tag-error">LATE</div>
            </div>

            <div class="summary-value text-error">
              {{ lateCount }}
            </div>

            <div class="summary-label">Late Arrivals</div>

            <div class="summary-description">
              Records with recorded lateness
            </div>

            <div class="summary-footer">
              <span> Review late records </span>

              <v-icon size="15"> mdi-arrow-right </v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Incomplete -->
      <v-col cols="12" sm="6" lg="3">
        <v-card
          elevation="0"
          class="summary-card"
          :class="{
            'summary-card-selected': statusFilter === 'incomplete',
          }"
          @click="statusFilter = 'incomplete'"
        >
          <v-card-text class="summary-card-content">
            <div class="summary-top">
              <div class="summary-icon icon-incomplete">
                <v-icon size="21"> mdi-account-clock-outline </v-icon>
              </div>

              <div class="summary-tag summary-tag-warning">REVIEW</div>
            </div>

            <div class="summary-value text-warning">
              {{ noTimeOutCount }}
            </div>

            <div class="summary-label">No Time Out</div>

            <div class="summary-description">Attendance requiring review</div>

            <div class="summary-footer">
              <span> Review incomplete records </span>

              <v-icon size="15"> mdi-arrow-right </v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- =========================================================
         DATE RANGE FILTER
    ========================================================== -->
    <v-card elevation="0" class="filter-card">
      <div class="filter-card-header">
        <div class="filter-title-group">
          <div class="filter-title-icon">
            <v-icon size="19"> mdi-tune-variant </v-icon>
          </div>

          <div>
            <div class="section-title">Attendance Filter</div>

            <div class="section-subtitle">
              Select a date range or use a quick period.
            </div>
          </div>
        </div>

        <v-chip
          v-if="hasDateFilter"
          size="small"
          variant="tonal"
          color="success"
          class="active-filter-chip"
        >
          <v-icon start size="14"> mdi-filter-check-outline </v-icon>

          Date Filter Active
        </v-chip>
      </div>

      <v-divider />

      <!-- Quick Filters -->
      <div class="quick-filter-section">
        <span class="quick-filter-label"> Quick Range </span>

        <v-btn-toggle
          v-model="activeQuickRange"
          density="compact"
          variant="outlined"
          color="primary"
          class="quick-range-buttons"
        >
          <v-btn value="today" size="small" @click="applyQuickRange('today')">
            Today
          </v-btn>

          <v-btn value="week" size="small" @click="applyQuickRange('week')">
            This Week
          </v-btn>

          <v-btn value="month" size="small" @click="applyQuickRange('month')">
            This Month
          </v-btn>
        </v-btn-toggle>
      </div>

      <v-divider />

      <v-card-text class="filter-content">
        <v-row align="end">
          <!-- Start Date -->
          <v-col cols="12" sm="6" md="4" lg="3">
            <div class="field-label">Start Date</div>

            <v-date-input
              v-model="dateStart"
              density="comfortable"
              placeholder="Select start date"
              prepend-icon=""
              prepend-inner-icon="mdi-calendar-start-outline"
              variant="outlined"
              hide-details
              class="date-input"
              @update:model-value="activeQuickRange = null"
            />
          </v-col>

          <!-- End Date -->
          <v-col cols="12" sm="6" md="4" lg="3">
            <div class="field-label">End Date</div>

            <v-date-input
              v-model="dateEnd"
              density="comfortable"
              placeholder="Select end date"
              prepend-icon=""
              prepend-inner-icon="mdi-calendar-end-outline"
              variant="outlined"
              hide-details
              class="date-input"
              @update:model-value="activeQuickRange = null"
            />
          </v-col>

          <!-- Buttons -->
          <v-col cols="12" md="4" lg="6">
            <div class="filter-buttons">
              <v-btn
                color="primary"
                variant="flat"
                prepend-icon="mdi-magnify"
                :loading="searching"
                class="search-date-button"
                @click="searchAttendanceRange"
              >
                Search Records
              </v-btn>

              <v-btn
                variant="outlined"
                color="grey-darken-1"
                prepend-icon="mdi-filter-remove-outline"
                :disabled="!dateStart && !dateEnd"
                class="clear-date-button"
                @click="clearDateFilter"
              >
                Clear
              </v-btn>
            </div>
          </v-col>
        </v-row>

        <!-- Selected Period -->
        <div v-if="hasDateFilter" class="selected-period">
          <div class="selected-period-icon">
            <v-icon size="17"> mdi-calendar-range </v-icon>
          </div>

          <div>
            <div class="selected-period-label">Selected Attendance Period</div>

            <div class="selected-period-value">
              {{ formatSelectedDate(dateStart) }}

              <v-icon size="14" class="mx-1"> mdi-arrow-right </v-icon>

              {{ formatSelectedDate(dateEnd) }}
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- =========================================================
         TABLE
    ========================================================== -->
    <v-card elevation="0" class="attendance-card">
      <!-- Table Toolbar -->
      <div class="table-toolbar">
        <div class="table-heading">
          <div class="table-heading-icon">
            <v-icon size="20"> mdi-table-clock </v-icon>
          </div>

          <div>
            <div class="section-title">Daily Attendance</div>

            <div class="section-subtitle">
              Employee schedules and attendance activity.
            </div>
          </div>
        </div>

        <div class="toolbar-actions">
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

          <!-- Refresh -->
          <v-btn
            icon
            variant="tonal"
            color="primary"
            size="small"
            :loading="refreshing || searching"
            class="refresh-button"
            @click="refreshCurrentView"
          >
            <v-icon size="18"> mdi-refresh </v-icon>

            <v-tooltip activator="parent" location="bottom">
              Refresh Attendance
            </v-tooltip>
          </v-btn>
        </div>
      </div>

      <!-- Results Bar -->
      <div class="results-bar">
        <div class="results-left">
          <div
            class="results-status-dot"
            :class="{
              'results-status-live': realtimeConnected,
            }"
          />

          <span>
            {{
              realtimeConnected
                ? "Monitoring live biometric updates"
                : "Real-time updates unavailable"
            }}
          </span>
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

      <!-- Error -->
      <v-alert
        v-if="errorMessage"
        type="error"
        variant="tonal"
        closable
        density="comfortable"
        class="ma-4"
        @click:close="errorMessage = ''"
      >
        {{ errorMessage }}
      </v-alert>

      <!-- =======================================================
           DATA TABLE
      ======================================================== -->
      <v-data-table
        :items="filteredLogs"
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
          <v-skeleton-loader type="table-row@10" />
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
                {{ item.name || "Unknown Employee" }}
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
          <div v-if="item.shift_start || item.shift_end" class="schedule-cell">
            <div class="schedule-icon">
              <v-icon size="15"> mdi-clock-outline </v-icon>
            </div>

            <div>
              <div class="schedule-time">
                {{ formatShiftTime(item.shift_start) }}
                –
                {{ formatShiftTime(item.shift_end) }}
              </div>

              <div v-if="item.shift_name" class="schedule-name">
                {{ item.shift_name }}
              </div>
            </div>
          </div>

          <div v-else class="no-schedule">
            <v-icon size="14"> mdi-calendar-remove-outline </v-icon>

            No schedule
          </div>
        </template>

        <!-- =====================================================
             TIME IN
        ====================================================== -->
        <template #[`item.in_time`]="{ item }">
          <div v-if="item.in_time" class="time-entry time-in">
            <div class="time-icon time-icon-in">
              <v-icon size="14"> mdi-login </v-icon>
            </div>

            <span>
              {{ formatTime(item.in_time) }}
            </span>
          </div>

          <span v-else class="empty-value"> — </span>
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
            class="attendance-chip"
          >
            <v-icon start size="13"> mdi-clock-alert-outline </v-icon>

            No Time Out
          </v-chip>

          <div v-else class="time-entry time-out">
            <div class="time-icon time-icon-out">
              <v-icon size="14"> mdi-logout </v-icon>
            </div>

            <span>
              {{ formatTime(item.out_time) }}
            </span>
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
            class="attendance-chip"
          >
            <v-icon start size="13"> mdi-clock-alert-outline </v-icon>

            {{ item.late_minutes }} min
          </v-chip>

          <v-chip
            v-else-if="isOnTime(item)"
            size="small"
            variant="tonal"
            color="success"
            class="attendance-chip"
          >
            <v-icon start size="13"> mdi-check-circle-outline </v-icon>

            On Time
          </v-chip>

          <span v-else class="empty-value"> — </span>
        </template>

        <!-- =====================================================
             EARLY LEAVE
        ====================================================== -->
        <template #[`item.early_leave_status`]="{ item }">
          <v-chip
            v-if="item.early_leave_status"
            size="small"
            variant="tonal"
            :color="getEarlyLeaveMeta(item.early_leave_status).color"
            class="attendance-chip"
          >
            <v-icon start size="13">
              {{ getEarlyLeaveMeta(item.early_leave_status).icon }}
            </v-icon>

            {{ getEarlyLeaveDisplay(item.early_leave_status) }}
          </v-chip>

          <span v-else class="empty-value"> — </span>
        </template>

        <!-- =====================================================
             TOTAL HOURS
        ====================================================== -->
        <template #[`item.total_hours`]="{ item }">
          <div
            v-if="item.total_hours !== null && item.total_hours !== undefined"
            class="hours-cell"
          >
            <div class="hours-value">
              {{ item.total_hours }}
            </div>

            <div class="hours-label">hours</div>
          </div>

          <span v-else class="empty-value"> — </span>
        </template>

        <!-- =====================================================
             NO DATA
        ====================================================== -->
        <template #no-data>
          <div class="empty-state">
            <div class="empty-icon">
              <v-icon size="36"> mdi-calendar-search-outline </v-icon>
            </div>

            <div class="empty-title">No attendance records found</div>

            <div class="empty-description">
              Try changing the date range, status filter, or employee search.
            </div>

            <v-btn
              v-if="hasDateFilter || statusFilter !== 'all' || search"
              variant="tonal"
              color="primary"
              size="small"
              class="mt-4"
              prepend-icon="mdi-filter-remove-outline"
              @click="resetAllFilters"
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

interface AttendanceLog {
  user_id: number;

  name?: string;

  log_date?: string;

  shift_name?: string;
  shift_start?: string;
  shift_end?: string;

  in_time?: string;
  out_time?: string;

  late_minutes?: number;
  late_status?: string;

  early_leave_status?: string;

  total_hours?: number | string | null;

  status?: string;
}

/* ==========================================================================
   STATE
============================================================================ */

const logs = ref<AttendanceLog[]>([]);

const loading = ref(true);

const refreshing = ref(false);

const searching = ref(false);

const search = ref("");

const dateStart = ref<Date | null>(null);

const dateEnd = ref<Date | null>(null);

const errorMessage = ref("");

const realtimeConnected = ref(false);

const lastUpdated = ref<Date | null>(null);

const activeQuickRange = ref<"today" | "week" | "month" | null>(null);

const statusFilter = ref<"all" | "on-time" | "late" | "incomplete">("all");

/* ==========================================================================
   STATUS FILTER OPTIONS
============================================================================ */

const statusFilterOptions = [
  {
    title: "All Records",

    value: "all",
  },

  {
    title: "On Time",

    value: "on-time",
  },

  {
    title: "Late",

    value: "late",
  },

  {
    title: "No Time Out",

    value: "incomplete",
  },
];

/* ==========================================================================
   SSE
============================================================================ */

let eventSource: EventSource | null = null;

let refreshTimer: ReturnType<typeof setTimeout> | null = null;

/* ==========================================================================
   DEFAULT SORT
============================================================================ */

const defaultSort = ref([
  {
    key: "log_date",

    order: "desc" as const,
  },
]);

/* ==========================================================================
   HEADERS
============================================================================ */

const headers = [
  {
    title: "Employee",

    key: "name",

    sortable: true,

    minWidth: 200,
  },

  {
    title: "Date",

    key: "log_date",

    sortable: true,

    width: 125,
  },

  {
    title: "Schedule",

    key: "schedule",

    sortable: false,

    minWidth: 150,
  },

  {
    title: "Time In",

    key: "in_time",

    sortable: false,

    width: 125,
  },

  {
    title: "Time Out",

    key: "out_time",

    sortable: false,

    width: 135,
  },

  {
    title: "Lateness",

    key: "late_status",

    sortable: true,

    width: 125,
  },

  {
    title: "Early Leave",

    key: "early_leave_status",

    sortable: true,

    width: 125,
  },

  {
    title: "Total Hours",

    key: "total_hours",

    sortable: true,

    width: 105,
  },
];

/* ==========================================================================
   ATTENDANCE HELPERS
============================================================================ */

const isOnTime = (item: AttendanceLog) => {
  const lateMinutes = Number(item.late_minutes ?? 0);

  const status = String(item.late_status ?? "")
    .trim()
    .toUpperCase();

  return lateMinutes <= 0 && status.includes("ON TIME");
};

const hasNoTimeOut = (item: AttendanceLog) => {
  return !item.out_time || item.in_time === item.out_time;
};

/* ==========================================================================
   SUMMARY
============================================================================ */

const onTimeCount = computed(() => {
  return logs.value.filter((item) => isOnTime(item)).length;
});

const lateCount = computed(() => {
  return logs.value.filter((item) => Number(item.late_minutes ?? 0) > 0).length;
});

const noTimeOutCount = computed(() => {
  return logs.value.filter((item) => hasNoTimeOut(item)).length;
});

/* ==========================================================================
   FILTERED RECORDS
============================================================================ */

const filteredLogs = computed(() => {
  switch (statusFilter.value) {
    case "on-time":
      return logs.value.filter((item) => isOnTime(item));

    case "late":
      return logs.value.filter((item) => Number(item.late_minutes ?? 0) > 0);

    case "incomplete":
      return logs.value.filter((item) => hasNoTimeOut(item));

    default:
      return logs.value;
  }
});

/* ==========================================================================
   DATE FILTER STATE
============================================================================ */

const hasDateFilter = computed(() => {
  return Boolean(dateStart.value && dateEnd.value);
});

const currentPeriodLabel = computed(() => {
  if (dateStart.value && dateEnd.value) {
    return `${formatSelectedDate(dateStart.value)} – ${formatSelectedDate(
      dateEnd.value,
    )}`;
  }

  return "All available attendance records";
});

/* ==========================================================================
   FETCH ATTENDANCE
============================================================================ */

const fetchAttendance = async (showLoader = false) => {
  if (showLoader) {
    loading.value = true;
  } else {
    refreshing.value = true;
  }

  try {
    const data = await $fetch<AttendanceLog[]>("/api/attendance/inout_shift");

    logs.value = data ?? [];

    lastUpdated.value = new Date();

    errorMessage.value = "";
  } catch (error) {
    console.error("Attendance fetch error:", error);

    errorMessage.value = "Unable to load attendance records.";
  } finally {
    loading.value = false;

    refreshing.value = false;
  }
};

/* ==========================================================================
   SEARCH DATE FORMAT
============================================================================ */

const formatSearchDate = (value: Date) => {
  const day = String(value.getDate()).padStart(2, "0");

  const month = String(value.getMonth() + 1).padStart(2, "0");

  const year = value.getFullYear();

  return `${day}/${month}/${year}`;
};

/* ==========================================================================
   SEARCH RANGE
============================================================================ */

const searchAttendanceRange = async () => {
  if (!dateStart.value || !dateEnd.value) {
    errorMessage.value = "Please select both the start and end dates.";

    return;
  }

  if (dateStart.value > dateEnd.value) {
    errorMessage.value = "Start date cannot be later than the end date.";

    return;
  }

  searching.value = true;

  try {
    const formattedDateStart = formatSearchDate(dateStart.value);

    const formattedDateEnd = formatSearchDate(dateEnd.value);

    const result = await $fetch<AttendanceLog[]>(
      `/api/attendance/search?date_start=${encodeURIComponent(
        formattedDateStart,
      )}&date_end=${encodeURIComponent(formattedDateEnd)}`,
    );

    logs.value = result ?? [];

    lastUpdated.value = new Date();

    errorMessage.value = "";
  } catch (error) {
    console.error("Attendance range search error:", error);

    errorMessage.value = "Unable to search the selected attendance period.";
  } finally {
    searching.value = false;
  }
};

/* ==========================================================================
   QUICK RANGE
============================================================================ */

const applyQuickRange = async (range: "today" | "week" | "month") => {
  activeQuickRange.value = range;

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  let start = new Date(today);

  if (range === "week") {
    const weekday = today.getDay();

    const mondayOffset = weekday === 0 ? 6 : weekday - 1;

    start.setDate(today.getDate() - mondayOffset);
  }

  if (range === "month") {
    start = new Date(today.getFullYear(), today.getMonth(), 1);
  }

  dateStart.value = start;

  dateEnd.value = new Date(today);

  await searchAttendanceRange();
};

/* ==========================================================================
   CLEAR DATE FILTER
============================================================================ */

const clearDateFilter = async () => {
  dateStart.value = null;

  dateEnd.value = null;

  activeQuickRange.value = null;

  errorMessage.value = "";

  await fetchAttendance();
};

/* ==========================================================================
   RESET EVERYTHING
============================================================================ */

const resetAllFilters = async () => {
  search.value = "";

  statusFilter.value = "all";

  dateStart.value = null;

  dateEnd.value = null;

  activeQuickRange.value = null;

  errorMessage.value = "";

  await fetchAttendance();
};

/* ==========================================================================
   REFRESH CURRENT VIEW
============================================================================ */

const refreshCurrentView = async () => {
  if (dateStart.value && dateEnd.value) {
    await searchAttendanceRange();

    return;
  }

  await fetchAttendance();
};

/* ==========================================================================
   DEBOUNCED REAL-TIME REFRESH
============================================================================ */

const scheduleRefresh = () => {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
  }

  refreshTimer = setTimeout(async () => {
    await refreshCurrentView();

    refreshTimer = null;
  }, 500);
};

/* ==========================================================================
   SSE EVENT
============================================================================ */

const handleAttendanceEvent = (event: Event) => {
  const messageEvent = event as MessageEvent;

  console.log("New real-time attendance:", messageEvent.data);

  scheduleRefresh();
};

/* ==========================================================================
   SSE CONNECTION
============================================================================ */

const connectRealtime = () => {
  if (typeof window === "undefined") {
    return;
  }

  if (eventSource) {
    eventSource.close();
  }

  eventSource = new EventSource("/api/attendance/stream");

  eventSource.onopen = () => {
    realtimeConnected.value = true;
  };

  eventSource.addEventListener("connected", () => {
    realtimeConnected.value = true;
  });

  eventSource.addEventListener("attendance", handleAttendanceEvent);

  eventSource.onerror = (error) => {
    realtimeConnected.value = false;

    console.warn("Attendance SSE disconnected:", error);
  };
};

/* ==========================================================================
   INITIALS
============================================================================ */

const getInitials = (name?: string) => {
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

/* ==========================================================================
   SAFE DATE
============================================================================ */

const parseLocalDate = (value?: string) => {
  if (!value) {
    return null;
  }

  const cleanValue = String(value).trim();

  /*
   * YYYY-MM-DD from our attendance APIs.
   * Construct it as a local calendar date.
   */
  const match = cleanValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }

  const date = new Date(cleanValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

/* ==========================================================================
   FORMAT DATE
============================================================================ */

const formatDate = (value?: string) => {
  const date = parseLocalDate(value);

  if (!date) {
    return "—";
  }

  return date.toLocaleDateString("en-PH", {
    month: "short",

    day: "2-digit",

    year: "numeric",
  });
};

/* ==========================================================================
   DAY NAME
============================================================================ */

const getDayName = (value?: string) => {
  const date = parseLocalDate(value);

  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-PH", {
    weekday: "long",
  });
};

/* ==========================================================================
   ATTENDANCE TIME
============================================================================ */

const formatTime = (value?: string) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleTimeString("en-PH", {
    hour: "2-digit",

    minute: "2-digit",

    second: "2-digit",

    hour12: true,
  });
};

/* ==========================================================================
   SHIFT TIME
============================================================================ */

const formatShiftTime = (value?: string) => {
  if (!value) {
    return "—";
  }

  const match = value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);

  if (!match) {
    return value;
  }

  const hour = Number(match[1]);

  const minute = match[2];

  const period = hour >= 12 ? "PM" : "AM";

  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minute} ${period}`;
};

/* ==========================================================================
   SELECTED DATE
============================================================================ */

const formatSelectedDate = (value: Date | null) => {
  if (!value) {
    return "—";
  }

  return value.toLocaleDateString("en-PH", {
    month: "short",

    day: "2-digit",

    year: "numeric",
  });
};

/* ==========================================================================
   LAST UPDATED
============================================================================ */

const formatLastUpdated = (value: Date) => {
  return value.toLocaleTimeString("en-PH", {
    hour: "2-digit",

    minute: "2-digit",

    hour12: true,
  });
};

/* ==========================================================================
   EARLY LEAVE
============================================================================ */

const getEarlyLeaveMeta = (status?: string) => {
  if (!status) {
    return {
      color: "grey",

      icon: "mdi-minus-circle-outline",
    };
  }

  const value = status.trim().toUpperCase();

  if (value.includes("EARLY")) {
    return {
      color: "warning",

      icon: "mdi-clock-minus-outline",
    };
  }

  if (value.includes("OK")) {
    return {
      color: "success",

      icon: "mdi-check-circle-outline",
    };
  }

  return {
    color: "grey",

    icon: "mdi-information-outline",
  };
};

const getEarlyLeaveDisplay = (status?: string) => {
  if (!status) {
    return "—";
  }

  const value = status.trim().toUpperCase();

  if (value.includes("EARLY")) {
    return "Left Early";
  }

  if (value.includes("OK")) {
    return "OK";
  }

  return status;
};

/* ==========================================================================
   LIFECYCLE
============================================================================ */

onMounted(async () => {
  await fetchAttendance(true);

  connectRealtime();
});

onBeforeUnmount(() => {
  if (refreshTimer) {
    clearTimeout(refreshTimer);

    refreshTimer = null;
  }

  if (eventSource) {
    eventSource.close();

    eventSource = null;
  }

  realtimeConnected.value = false;
});
</script>

<style scoped>
/* ==========================================================================
   PAGE
============================================================================ */

.attendance-page {
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

  font-size: 0.82rem;
}

/* ==========================================================================
   HEADER STATUS
============================================================================ */

.header-actions {
  display: flex;

  align-items: center;

  flex-wrap: wrap;

  gap: 8px;
}

.connection-status,
.updated-status {
  min-height: 34px;

  display: flex;

  align-items: center;

  gap: 7px;

  padding: 7px 11px;

  border-radius: 9px;

  font-size: 0.67rem;

  font-weight: 600;
}

.connection-online {
  border: 1px solid #cdebd7;

  background: #effaf2;

  color: #15803d;
}

.connection-offline {
  border: 1px solid #f3d7d7;

  background: #fff5f5;

  color: #dc2626;
}

.connection-dot {
  width: 7px;

  height: 7px;

  border-radius: 50%;

  background: #ef4444;
}

.connection-dot-active {
  background: #22c55e;

  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.11);

  animation: connection-pulse 2s infinite;
}

.updated-status {
  border: 1px solid #e5e7eb;

  background: #ffffff;

  color: #6b7280;
}

/* ==========================================================================
   PERIOD BAR
============================================================================ */

.period-bar {
  display: flex;

  align-items: center;

  gap: 11px;

  margin-bottom: 20px;

  padding: 13px 16px;

  border: 1px solid #e2e8e4;

  border-radius: 12px;

  background: linear-gradient(90deg, #f5fbf7, #ffffff);
}

.period-icon {
  width: 37px;

  height: 37px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-shrink: 0;

  border-radius: 10px;

  background: #e5f6ea;

  color: #15803d;
}

.period-information {
  min-width: 0;
}

.period-label {
  color: #9ca3af;

  font-size: 0.58rem;

  font-weight: 700;

  letter-spacing: 0.07em;

  text-transform: uppercase;
}

.period-value {
  margin-top: 2px;

  color: #374151;

  font-size: 0.73rem;

  font-weight: 650;
}

.period-spacer {
  flex: 1;
}

.period-meta {
  display: flex;

  align-items: center;

  gap: 14px;
}

.period-meta-item {
  display: flex;

  flex-direction: column;

  align-items: flex-end;
}

.period-meta-value {
  color: #1f2937;

  font-size: 0.82rem;

  font-weight: 750;
}

.period-meta-label {
  margin-top: 1px;

  color: #9ca3af;

  font-size: 0.58rem;
}

.period-meta-divider {
  width: 1px;

  height: 28px;

  background: #e4e8e5;
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

  cursor: pointer;

  box-shadow: 0 3px 13px rgba(15, 23, 42, 0.025);

  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    border-color 0.16s ease;
}

.summary-card:hover {
  transform: translateY(-3px);

  border-color: #d5e7da;

  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.055);
}

.summary-card-selected {
  border-color: rgba(22, 163, 74, 0.3);

  box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.055);
}

.summary-card-content {
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

.icon-records {
  border: 1px solid #d8ecde;

  background: #edf9f1;

  color: #15803d;
}

.icon-on-time {
  border: 1px solid #d7efdf;

  background: #effbf3;

  color: #16a34a;
}

.icon-late {
  border: 1px solid #fee2e2;

  background: #fff5f5;

  color: #dc2626;
}

.icon-incomplete {
  border: 1px solid #fde8c8;

  background: #fff8eb;

  color: #d97706;
}

.summary-tag {
  color: #9ca3af;

  font-size: 0.55rem;

  font-weight: 750;

  letter-spacing: 0.07em;
}

.summary-tag-success {
  color: #16a34a;
}

.summary-tag-error {
  color: #dc2626;
}

.summary-tag-warning {
  color: #d97706;
}

.summary-value {
  color: #1f2937;

  font-size: 1.9rem;

  font-weight: 780;

  line-height: 1;
}

.summary-label {
  margin-top: 9px;

  color: #374151;

  font-size: 0.75rem;

  font-weight: 680;
}

.summary-description {
  margin-top: 3px;

  color: #9ca3af;

  font-size: 0.66rem;
}

.summary-footer {
  display: flex;

  align-items: center;

  justify-content: space-between;

  margin-top: 16px;

  padding-top: 11px;

  border-top: 1px solid #f0f2f1;

  color: #9ca3af;

  font-size: 0.6rem;
}

/* ==========================================================================
   FILTER CARD
============================================================================ */

.filter-card,
.attendance-card {
  overflow: hidden;

  border: 1px solid #e5e9e6;

  border-radius: 15px;

  background: #ffffff;

  box-shadow: 0 4px 17px rgba(15, 23, 42, 0.025);
}

.filter-card {
  margin-bottom: 20px;
}

.filter-card-header {
  min-height: 70px;

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 16px;

  padding: 15px 19px;
}

.filter-title-group {
  display: flex;

  align-items: center;

  gap: 10px;
}

.filter-title-icon,
.table-heading-icon {
  width: 38px;

  height: 38px;

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

  font-size: 0.93rem;

  font-weight: 720;
}

.section-subtitle {
  margin-top: 2px;

  color: #9ca3af;

  font-size: 0.68rem;
}

.active-filter-chip {
  font-size: 0.63rem;
}

/* ==========================================================================
   QUICK RANGE
============================================================================ */

.quick-filter-section {
  display: flex;

  align-items: center;

  gap: 12px;

  padding: 10px 19px;

  background: #fbfcfb;
}

.quick-filter-label {
  color: #8c949f;

  font-size: 0.65rem;

  font-weight: 650;
}

.quick-range-buttons {
  overflow: hidden;

  border-radius: 8px;
}

:deep(.quick-range-buttons .v-btn) {
  min-height: 30px;

  padding-inline: 12px;

  text-transform: none;

  font-size: 0.64rem;

  letter-spacing: 0;
}

/* ==========================================================================
   FILTER FORM
============================================================================ */

.filter-content {
  padding: 18px 19px !important;
}

.field-label {
  margin-bottom: 7px;

  color: #4b5563;

  font-size: 0.69rem;

  font-weight: 650;
}

:deep(.date-input .v-field) {
  border-radius: 9px;
}

.filter-buttons {
  display: flex;

  align-items: center;

  gap: 9px;
}

.search-date-button,
.clear-date-button {
  min-height: 40px;

  text-transform: none;

  font-size: 0.7rem;

  font-weight: 650;

  letter-spacing: 0;
}

/* ==========================================================================
   SELECTED PERIOD
============================================================================ */

.selected-period {
  display: inline-flex;

  align-items: center;

  gap: 9px;

  margin-top: 15px;

  padding: 9px 11px;

  border: 1px solid #d9ecdf;

  border-radius: 9px;

  background: #f3faf5;
}

.selected-period-icon {
  width: 30px;

  height: 30px;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 8px;

  background: #ddf3e4;

  color: #15803d;
}

.selected-period-label {
  color: #8a948e;

  font-size: 0.56rem;

  font-weight: 700;

  letter-spacing: 0.05em;

  text-transform: uppercase;
}

.selected-period-value {
  display: flex;

  align-items: center;

  margin-top: 2px;

  color: #374151;

  font-size: 0.66rem;

  font-weight: 650;
}

/* ==========================================================================
   TABLE TOOLBAR
============================================================================ */

.table-toolbar {
  min-height: 72px;

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 20px;

  padding: 15px 19px;
}

.table-heading {
  display: flex;

  align-items: center;

  gap: 10px;
}

.toolbar-actions {
  display: flex;

  align-items: center;

  gap: 8px;
}

.status-filter {
  width: 175px;
}

.search-field {
  width: 250px;
}

:deep(.status-filter .v-field),
:deep(.search-field .v-field) {
  border-radius: 9px;
}

.refresh-button {
  flex-shrink: 0;
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

  font-size: 0.61rem;
}

.results-left {
  display: flex;

  align-items: center;

  gap: 7px;
}

.results-status-dot {
  width: 6px;

  height: 6px;

  border-radius: 50%;

  background: #c6cbd0;
}

.results-status-live {
  background: #22c55e;

  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.1);
}

.results-right strong {
  color: #4b5563;
}

/* ==========================================================================
   TABLE
============================================================================ */

:deep(.attendance-table .v-table__wrapper) {
  overflow-x: hidden;
}

:deep(.attendance-table table) {
  width: 100% !important;

  table-layout: auto;
}

:deep(.attendance-table thead th) {
  height: 47px !important;

  padding-left: 9px !important;

  padding-right: 9px !important;

  border-bottom: 1px solid #e8ebe9 !important;

  background: #fafbfa !important;

  color: #667085 !important;

  font-size: 0.64rem !important;

  font-weight: 720 !important;

  letter-spacing: 0.035em;

  text-transform: uppercase;

  white-space: nowrap;
}

:deep(.attendance-table tbody td) {
  height: 62px !important;

  padding-left: 9px !important;

  padding-right: 9px !important;

  border-bottom: 1px solid #f0f2f1 !important;

  color: #374151;

  font-size: 0.75rem;

  white-space: nowrap;
}

:deep(.attendance-table tbody tr) {
  transition: background-color 0.15s ease;
}

:deep(.attendance-table tbody tr:hover) {
  background: #f8fbf9 !important;
}

/* ==========================================================================
   EMPLOYEE
============================================================================ */

.employee-cell {
  min-width: 0;

  display: flex;

  align-items: center;

  gap: 9px;
}

.employee-avatar {
  width: 36px;

  height: 36px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-shrink: 0;

  border: 1px solid #d7eddd;

  border-radius: 10px;

  background: #ebf8ef;

  color: #15803d;

  font-size: 0.65rem;

  font-weight: 750;
}

.employee-info {
  min-width: 0;
}

.employee-name {
  max-width: 180px;

  overflow: hidden;

  color: #1f2937;

  font-size: 0.74rem;

  font-weight: 670;

  text-overflow: ellipsis;

  white-space: nowrap;
}

.employee-subtitle {
  margin-top: 2px;

  color: #9ca3af;

  font-size: 0.6rem;
}

/* ==========================================================================
   DATE
============================================================================ */

.date-primary {
  color: #374151;

  font-size: 0.7rem;

  font-weight: 620;
}

.date-secondary {
  margin-top: 2px;

  color: #9ca3af;

  font-size: 0.6rem;
}

/* ==========================================================================
   SCHEDULE
============================================================================ */

.schedule-cell {
  display: flex;

  align-items: center;

  gap: 7px;
}

.schedule-icon {
  width: 28px;

  height: 28px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-shrink: 0;

  border-radius: 7px;

  background: #f1f3f2;

  color: #6b7280;
}

.schedule-time {
  color: #4b5563;

  font-size: 0.67rem;

  font-weight: 640;
}

.schedule-name {
  max-width: 120px;

  margin-top: 2px;

  overflow: hidden;

  color: #9ca3af;

  font-size: 0.57rem;

  text-overflow: ellipsis;

  white-space: nowrap;
}

.no-schedule {
  display: inline-flex;

  align-items: center;

  gap: 4px;

  color: #b0b5bc;

  font-size: 0.62rem;
}

/* ==========================================================================
   TIME
============================================================================ */

.time-entry {
  display: inline-flex;

  align-items: center;

  gap: 6px;

  font-size: 0.68rem;

  font-weight: 630;
}

.time-icon {
  width: 25px;

  height: 25px;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 7px;
}

.time-icon-in {
  background: #e9f8ee;

  color: #15803d;
}

.time-icon-out {
  background: #eff6ff;

  color: #2563eb;
}

.time-in {
  color: #15803d;
}

.time-out {
  color: #2563eb;
}

/* ==========================================================================
   CHIPS
============================================================================ */

.attendance-chip {
  font-size: 0.6rem;
}

/* ==========================================================================
   HOURS
============================================================================ */

.hours-cell {
  display: flex;

  align-items: baseline;

  gap: 3px;
}

.hours-value {
  color: #374151;

  font-size: 0.75rem;

  font-weight: 750;
}

.hours-label {
  color: #9ca3af;

  font-size: 0.56rem;
}

.empty-value {
  color: #c3c8ce;
}

/* ==========================================================================
   EMPTY
============================================================================ */

.empty-state {
  padding: 64px 20px;

  text-align: center;
}

.empty-icon {
  width: 66px;

  height: 66px;

  display: flex;

  align-items: center;

  justify-content: center;

  margin: 0 auto 14px;

  border-radius: 50%;

  background: #f2f6f3;

  color: #9fa8a2;
}

.empty-title {
  color: #374151;

  font-size: 0.91rem;

  font-weight: 700;
}

.empty-description {
  max-width: 360px;

  margin: 5px auto 0;

  color: #9ca3af;

  font-size: 0.69rem;

  line-height: 1.5;
}

/* ==========================================================================
   ANIMATION
============================================================================ */

@keyframes connection-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.45;
  }
}

/* ==========================================================================
   1200
============================================================================ */

@media (max-width: 1200px) {
  .employee-name {
    max-width: 145px;
  }

  :deep(.attendance-table tbody td),
  :deep(.attendance-table thead th) {
    padding-left: 7px !important;

    padding-right: 7px !important;
  }
}

/* ==========================================================================
   TABLET
============================================================================ */

@media (max-width: 960px) {
  .attendance-page {
    padding: 16px;
  }

  .page-header {
    align-items: flex-start;

    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }

  .period-bar {
    flex-wrap: wrap;
  }

  .period-spacer {
    display: none;
  }

  .period-meta {
    margin-left: auto;
  }

  .filter-card-header {
    align-items: flex-start;

    flex-direction: column;
  }

  .filter-buttons {
    width: 100%;
  }

  .table-toolbar {
    align-items: stretch;

    flex-direction: column;
  }

  .toolbar-actions {
    width: 100%;
  }

  .status-filter {
    width: 180px;
  }

  .search-field {
    flex: 1;

    width: auto;
  }

  :deep(.attendance-table .v-table__wrapper) {
    overflow-x: auto;
  }
}

/* ==========================================================================
   MOBILE
============================================================================ */

@media (max-width: 600px) {
  .attendance-page {
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
    font-size: 0.7rem;
  }

  .connection-status,
  .updated-status {
    font-size: 0.6rem;
  }

  .period-bar {
    align-items: flex-start;
  }

  .period-meta {
    width: 100%;

    justify-content: flex-start;

    margin-left: 48px;
  }

  .period-meta-item {
    align-items: flex-start;
  }

  .quick-filter-section {
    align-items: flex-start;

    flex-direction: column;
  }

  .quick-range-buttons {
    width: 100%;
  }

  :deep(.quick-range-buttons .v-btn) {
    flex: 1;
  }

  .filter-buttons {
    align-items: stretch;

    flex-direction: column;
  }

  .filter-buttons .v-btn {
    width: 100%;
  }

  .selected-period {
    width: 100%;
  }

  .toolbar-actions {
    align-items: stretch;

    flex-direction: column;
  }

  .status-filter,
  .search-field {
    width: 100%;
  }

  .refresh-button {
    width: 100%;
  }

  .results-bar {
    align-items: flex-start;

    flex-direction: column;
  }

  .summary-footer {
    display: none;
  }
}

/* ==========================================================================
   REDUCED MOTION
============================================================================ */

@media (prefers-reduced-motion: reduce) {
  .connection-dot-active {
    animation: none;
  }

  .summary-card {
    transition: none;
  }
}
</style>
