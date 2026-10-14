<template>
  <div class="employee-attendance-report">
    <!-- =========================================================
         SUMMARY CARDS
    ========================================================== -->
    <v-row class="summary-row">
      <!-- Attendance Days -->
      <v-col cols="12" sm="6" lg="3">
        <v-card
          elevation="0"
          class="summary-card"
          :class="{
            'summary-card-active': statusFilter === 'all',
          }"
          @click="statusFilter = 'all'"
        >
          <v-card-text class="summary-content">
            <div class="summary-top">
              <div class="summary-icon icon-records">
                <v-icon size="20"> mdi-calendar-check-outline </v-icon>
              </div>

              <span class="summary-tag"> RECORDS </span>
            </div>

            <div class="summary-value">
              {{ logs.length }}
            </div>

            <div class="summary-label">Attendance Days</div>

            <div class="summary-description">
              Attendance records in the selected period
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
            'summary-card-active': statusFilter === 'on-time',
          }"
          @click="statusFilter = 'on-time'"
        >
          <v-card-text class="summary-content">
            <div class="summary-top">
              <div class="summary-icon icon-on-time">
                <v-icon size="20"> mdi-check-circle-outline </v-icon>
              </div>

              <span class="summary-tag text-success"> ON TIME </span>
            </div>

            <div class="summary-value text-success">
              {{ onTimeCount }}
            </div>

            <div class="summary-label">On Time</div>

            <div class="summary-description">
              Arrived within assigned schedule
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
            'summary-card-active': statusFilter === 'late',
          }"
          @click="statusFilter = 'late'"
        >
          <v-card-text class="summary-content">
            <div class="summary-top">
              <div class="summary-icon icon-late">
                <v-icon size="20"> mdi-clock-alert-outline </v-icon>
              </div>

              <span class="summary-tag text-error"> LATE </span>
            </div>

            <div class="summary-value text-error">
              {{ lateCount }}
            </div>

            <div class="summary-label">Late Days</div>

            <div class="summary-description">
              {{ totalLateMinutes }} accumulated late minutes
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Total Hours -->
      <v-col cols="12" sm="6" lg="3">
        <v-card elevation="0" class="summary-card">
          <v-card-text class="summary-content">
            <div class="summary-top">
              <div class="summary-icon icon-hours">
                <v-icon size="20"> mdi-timer-outline </v-icon>
              </div>

              <span class="summary-tag summary-tag-blue"> WORK HOURS </span>
            </div>

            <div class="summary-value summary-value-blue">
              {{ formattedTotalHours }}
            </div>

            <div class="summary-label">Total Hours</div>

            <div class="summary-description">Recorded working hours</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- =========================================================
         REPORT FILTER
    ========================================================== -->
    <v-card elevation="0" class="filter-card">
      <div class="card-header">
        <div class="card-heading">
          <div class="card-heading-icon">
            <v-icon size="19"> mdi-account-search-outline </v-icon>
          </div>

          <div>
            <div class="section-title">Employee Attendance Report</div>

            <div class="section-subtitle">
              Select an employee and reporting period.
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
          <v-icon start size="14"> mdi-check-circle-outline </v-icon>

          Report Generated
        </v-chip>
      </div>

      <v-divider />

      <!-- =======================================================
           QUICK DATE RANGE
      ======================================================== -->
      <div class="quick-range-bar">
        <div class="quick-range-label">Quick Range</div>

        <v-btn-toggle
          v-model="activeQuickRange"
          color="primary"
          variant="outlined"
          density="compact"
          class="quick-range-toggle"
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

      <!-- =======================================================
           FILTER FIELDS
      ======================================================== -->
      <v-card-text class="filter-content">
        <v-row align="end">
          <!-- Employee -->
          <!-- Employee -->
          <v-col cols="12" md="4">
            <div class="field-label-row">
              <div class="field-label">Employee</div>

              <span> Required </span>
            </div>

            <v-autocomplete
              v-model="selectedEmployeeId"
              :items="employeeOptions"
              item-title="title"
              item-value="value"
              :loading="loadingEmployees"
              placeholder="Search employee by name..."
              prepend-inner-icon="mdi-account-search-outline"
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
              auto-select-first
              no-data-text="No employee found"
              class="filter-field employee-autocomplete"
            >
              <!-- Employee Dropdown Item -->
              <template #item="{ props, item }">
                <v-list-item v-bind="props" class="employee-option">
                  <template #prepend>
                    <div class="employee-option-avatar">
                      {{ getInitials(item.raw.name) }}
                    </div>
                  </template>

                  <template #title>
                    <div class="employee-option-name">
                      {{ item.raw.name }}
                    </div>
                  </template>

                  <template #subtitle>
                    <div class="employee-option-id">
                      Employee ID
                      {{ item.raw.userId }}
                    </div>
                  </template>
                </v-list-item>
              </template>

              <!-- Selected Employee -->
              <template #selection="{ item }">
                <div class="selected-employee">
                  <span>
                    {{ item.raw.name }}
                  </span>

                  <small> ID {{ item.raw.userId }} </small>
                </div>
              </template>
            </v-autocomplete>
          </v-col>

          <!-- Start Date -->
          <v-col cols="12" sm="6" md="3">
            <div class="field-label-row">
              <div class="field-label">Start Date</div>

              <span> Required </span>
            </div>

            <v-date-input
              v-model="dateStart"
              density="comfortable"
              placeholder="Select start date"
              prepend-icon=""
              prepend-inner-icon="mdi-calendar-start-outline"
              variant="outlined"
              hide-details
              class="filter-field"
              @update:model-value="activeQuickRange = null"
            />
          </v-col>

          <!-- End Date -->
          <v-col cols="12" sm="6" md="3">
            <div class="field-label-row">
              <div class="field-label">End Date</div>

              <span> Required </span>
            </div>

            <v-date-input
              v-model="dateEnd"
              density="comfortable"
              placeholder="Select end date"
              prepend-icon=""
              prepend-inner-icon="mdi-calendar-end-outline"
              variant="outlined"
              hide-details
              class="filter-field"
              @update:model-value="activeQuickRange = null"
            />
          </v-col>

          <!-- Generate -->
          <v-col cols="12" md="2">
            <div class="filter-actions">
              <v-btn
                block
                color="primary"
                variant="flat"
                prepend-icon="mdi-file-chart-outline"
                :loading="loading"
                class="generate-button"
                @click="generateReport"
              >
                Generate
              </v-btn>

              <v-btn
                block
                color="grey-darken-1"
                variant="outlined"
                size="small"
                :disabled="
                  !hasGeneratedReport &&
                  !dateStart &&
                  !dateEnd &&
                  !selectedEmployeeId
                "
                class="clear-button"
                @click="clearReport"
              >
                Clear
              </v-btn>
            </div>
          </v-col>
        </v-row>
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
         GENERATED EMPLOYEE INFORMATION
    ========================================================== -->
    <v-card
      v-if="hasGeneratedReport && generatedEmployee"
      elevation="0"
      class="employee-report-card"
    >
      <div class="employee-report-main">
        <div class="employee-profile">
          <div class="employee-avatar">
            {{ getInitials(generatedEmployee.name) }}
          </div>

          <div class="employee-profile-copy">
            <div class="employee-report-eyebrow">
              EMPLOYEE ATTENDANCE REPORT
            </div>

            <div class="employee-report-name">
              {{ generatedEmployee.name }}
            </div>

            <div class="employee-report-id">
              Employee ID
              {{ generatedEmployee.user_id }}
            </div>
          </div>
        </div>

        <div class="employee-report-period">
          <div class="period-label">REPORT PERIOD</div>

          <div class="period-value">
            {{ reportPeriodText }}
          </div>
        </div>

        <div class="employee-mini-stats">
          <div class="mini-stat">
            <span>
              {{ logs.length }}
            </span>

            <small> Records </small>
          </div>

          <div class="mini-stat">
            <span class="text-error">
              {{ totalLateMinutes }}
            </span>

            <small> Late Min. </small>
          </div>

          <div class="mini-stat">
            <span class="text-warning">
              {{ noTimeOutCount }}
            </span>

            <small> No Time Out </small>
          </div>
        </div>
      </div>

      <div class="employee-report-footer">
        <div v-if="generatedAt" class="generated-time">
          <v-icon size="14"> mdi-clock-outline </v-icon>

          Generated
          {{ formatGeneratedTime(generatedAt) }}
        </div>

        <div class="generated-source">
          <v-icon size="14"> mdi-fingerprint </v-icon>

          Biometric Attendance Records
        </div>
      </div>
    </v-card>

    <!-- =========================================================
         ATTENDANCE TABLE
    ========================================================== -->
    <v-card elevation="0" class="report-table-card">
      <!-- Header -->
      <div class="table-toolbar">
        <div class="card-heading">
          <div class="card-heading-icon">
            <v-icon size="19"> mdi-calendar-clock-outline </v-icon>
          </div>

          <div>
            <div class="section-title">Attendance Details</div>

            <div class="section-subtitle">
              Daily attendance records for the selected employee.
            </div>
          </div>
        </div>

        <div class="toolbar-actions">
          <!-- Print -->
          <v-btn
            color="primary"
            variant="outlined"
            prepend-icon="mdi-printer-outline"
            :disabled="!hasGeneratedReport || filteredLogs.length === 0"
            class="print-button"
            @click="printEmployeeReport"
          >
            Print / PDF
          </v-btn>

          <!-- Status -->
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
        </div>
      </div>

      <!-- Results -->
      <div class="results-bar">
        <div class="results-left">
          <div
            class="report-result-status"
            :class="{
              'report-result-status-active': hasGeneratedReport,
            }"
          />

          <span>
            {{
              hasGeneratedReport
                ? generatedEmployee?.name
                : "No employee report generated"
            }}
          </span>

          <template v-if="hasGeneratedReport">
            <span class="results-divider"> • </span>

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

      <!-- Table -->
      <v-data-table
        :items="filteredLogs"
        :headers="headers"
        :loading="loading"
        :sort-by="defaultSort"
        density="comfortable"
        :items-per-page="20"
        class="employee-attendance-table"
      >
        <template #loading>
          <v-skeleton-loader type="table-row@10" />
        </template>

        <!-- Date -->
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

        <!-- Schedule -->
        <template #[`item.schedule`]="{ item }">
          <div v-if="item.shift_start || item.shift_end" class="schedule-cell">
            <div class="table-icon">
              <v-icon size="14"> mdi-calendar-clock-outline </v-icon>
            </div>

            <div>
              <div class="schedule-value">
                {{ formatShiftTime(item.shift_start) }}
                –
                {{ formatShiftTime(item.shift_end) }}
              </div>

              <div v-if="item.shift_name" class="cell-subtitle">
                {{ item.shift_name }}
              </div>
            </div>
          </div>

          <div v-else class="empty-status">
            <v-icon size="14"> mdi-calendar-remove-outline </v-icon>

            No schedule
          </div>
        </template>

        <!-- Time In -->
        <template #[`item.in_time`]="{ item }">
          <div v-if="item.in_time" class="time-cell">
            <div class="table-icon icon-in">
              <v-icon size="14"> mdi-login </v-icon>
            </div>

            <span class="time-in">
              {{ formatTime(item.in_time) }}
            </span>
          </div>

          <span v-else class="empty-value"> — </span>
        </template>

        <!-- Time Out -->
        <template #[`item.out_time`]="{ item }">
          <v-chip
            v-if="hasNoTimeOut(item)"
            size="small"
            color="warning"
            variant="tonal"
            class="status-chip"
          >
            <v-icon start size="13"> mdi-clock-alert-outline </v-icon>

            No Time Out
          </v-chip>

          <div v-else class="time-cell">
            <div class="table-icon icon-out">
              <v-icon size="14"> mdi-logout </v-icon>
            </div>

            <span class="time-out">
              {{ formatTime(item.out_time) }}
            </span>
          </div>
        </template>

        <!-- Lateness -->
        <template #[`item.late_status`]="{ item }">
          <v-chip
            v-if="Number(item.late_minutes ?? 0) > 0"
            size="small"
            color="error"
            variant="tonal"
            class="status-chip"
          >
            <v-icon start size="13"> mdi-clock-alert-outline </v-icon>

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
            <v-icon start size="13"> mdi-check-circle-outline </v-icon>

            On Time
          </v-chip>

          <span v-else class="empty-value"> — </span>
        </template>

        <!-- Early Leave -->
        <template #[`item.early_leave_status`]="{ item }">
          <v-chip
            v-if="item.early_leave_status"
            size="small"
            variant="tonal"
            :color="getEarlyLeaveMeta(item.early_leave_status).color"
            class="status-chip"
          >
            <v-icon start size="13">
              {{ getEarlyLeaveMeta(item.early_leave_status).icon }}
            </v-icon>

            {{ getEarlyLeaveDisplay(item.early_leave_status) }}
          </v-chip>

          <span v-else class="empty-value"> — </span>
        </template>

        <!-- Total Hours -->
        <template #[`item.total_hours`]="{ item }">
          <div
            v-if="item.total_hours !== null && item.total_hours !== undefined"
            class="hours-cell"
          >
            {{ formatNumber(item.total_hours) }}

            <span> hrs </span>
          </div>

          <span v-else class="empty-value"> — </span>
        </template>

        <!-- Empty -->
        <template #no-data>
          <div class="empty-state">
            <div class="empty-icon">
              <v-icon size="35">
                {{
                  hasGeneratedReport
                    ? "mdi-calendar-search-outline"
                    : "mdi-account-search-outline"
                }}
              </v-icon>
            </div>

            <div class="empty-title">
              {{
                hasGeneratedReport
                  ? "No attendance records found"
                  : "Generate an employee report"
              }}
            </div>

            <div class="empty-description">
              {{
                hasGeneratedReport
                  ? "There are no attendance records matching the selected status."
                  : "Select an employee and date range above, then click Generate."
              }}
            </div>

            <v-btn
              v-if="hasGeneratedReport && statusFilter !== 'all'"
              color="primary"
              variant="tonal"
              size="small"
              prepend-icon="mdi-filter-remove-outline"
              class="mt-4"
              @click="statusFilter = 'all'"
            >
              Show All Records
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck

import { printReport } from "~/utils/printReport";

/* ==========================================================================
   TYPES
============================================================================ */

interface UserAccount {
  user_id: number;

  uid?: number | null;

  name?: string | null;
}

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
}

interface GeneratedEmployee {
  user_id: number;
  name: string;
}

/* ==========================================================================
   EMPLOYEE
============================================================================ */

const employees = ref<UserAccount[]>([]);

const loadingEmployees = ref(false);

const selectedEmployeeId = ref<number | null>(null);

const generatedEmployee = ref<GeneratedEmployee | null>(null);

/* ==========================================================================
   DATE
============================================================================ */

const dateStart = ref<Date | null>(null);

const dateEnd = ref<Date | null>(null);

const generatedStartDate = ref<Date | null>(null);

const generatedEndDate = ref<Date | null>(null);

/* ==========================================================================
   REPORT
============================================================================ */

const logs = ref<AttendanceLog[]>([]);

const loading = ref(false);

const errorMessage = ref("");

const hasGeneratedReport = ref(false);

const generatedAt = ref<Date | null>(null);

/* ==========================================================================
   QUICK RANGE
============================================================================ */

const activeQuickRange = ref<"today" | "week" | "month" | null>(null);

/* ==========================================================================
   STATUS FILTER
============================================================================ */

const statusFilter = ref<"all" | "on-time" | "late" | "incomplete">("all");

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
   EMPLOYEE OPTIONS
============================================================================ */

const employeeOptions = computed(() => {
  return [...employees.value]
    .filter((employee) => Number(employee.user_id) > 0)
    .sort((a, b) =>
      String(a.name ?? "").localeCompare(String(b.name ?? ""), "en", {
        sensitivity: "base",
      }),
    )
    .map((employee) => {
      const name = String(employee.name ?? "").trim() || "Unknown Employee";
      return {
        /*
         * v-autocomplete searches
         * this title automatically.
         */
        title: name,
        value: Number(employee.user_id),
        name,
        userId: Number(employee.user_id),
      };
    });
});

/* ==========================================================================
   TABLE
============================================================================ */

const headers = [
  {
    title: "Date",

    key: "log_date",

    sortable: true,

    minWidth: 170,
  },

  {
    title: "Schedule",

    key: "schedule",

    sortable: false,

    minWidth: 170,
  },

  {
    title: "Time In",

    key: "in_time",

    sortable: false,

    width: 135,
  },

  {
    title: "Time Out",

    key: "out_time",

    sortable: false,

    width: 145,
  },

  {
    title: "Lateness",

    key: "late_status",

    sortable: true,

    width: 140,
  },

  {
    title: "Early Leave",

    key: "early_leave_status",

    sortable: true,

    width: 140,
  },

  {
    title: "Total Hours",

    key: "total_hours",

    sortable: true,

    width: 115,
  },
];

const defaultSort = ref([
  {
    key: "log_date",

    order: "desc" as const,
  },
]);

/* ==========================================================================
   LOAD EMPLOYEES
============================================================================ */

const loadEmployees = async () => {
  loadingEmployees.value = true;

  try {
    const result = await $fetch<UserAccount[]>("/api/user-accounts/list");

    employees.value = result ?? [];
  } catch (error) {
    console.error("Unable to load employees:", error);

    employees.value = [];

    errorMessage.value = "Unable to load the employee directory.";
  } finally {
    loadingEmployees.value = false;
  }
};

/* ==========================================================================
   HELPERS
============================================================================ */

const hasNoTimeOut = (item: AttendanceLog) => {
  return !item.out_time || item.in_time === item.out_time;
};

const isOnTime = (item: AttendanceLog) => {
  const status = String(item.late_status ?? "")
    .trim()
    .toLowerCase();

  const minutes = Number(item.late_minutes ?? 0);

  return (
    status.includes("on time") || (Boolean(item.late_status) && minutes === 0)
  );
};

/* ==========================================================================
   SUMMARY
============================================================================ */

const onTimeCount = computed(
  () => logs.value.filter((item) => isOnTime(item)).length,
);

const lateCount = computed(
  () => logs.value.filter((item) => Number(item.late_minutes ?? 0) > 0).length,
);

const noTimeOutCount = computed(
  () => logs.value.filter((item) => hasNoTimeOut(item)).length,
);

const totalLateMinutes = computed(() =>
  logs.value.reduce((total, item) => total + Number(item.late_minutes ?? 0), 0),
);

const totalHours = computed(() =>
  logs.value.reduce((total, item) => {
    const value = Number(item.total_hours ?? 0);

    return total + (Number.isFinite(value) ? value : 0);
  }, 0),
);

const formattedTotalHours = computed(() => formatNumber(totalHours.value));

/* ==========================================================================
   FILTER
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
   API DATE
============================================================================ */

const formatSearchDate = (value: Date) => {
  const day = String(value.getDate()).padStart(2, "0");

  const month = String(value.getMonth() + 1).padStart(2, "0");

  const year = value.getFullYear();

  return `${day}/${month}/${year}`;
};

/* ==========================================================================
   GENERATE
============================================================================ */

const generateReport = async () => {
  errorMessage.value = "";

  if (!selectedEmployeeId.value) {
    errorMessage.value = "Please select an employee.";

    return;
  }

  if (!dateStart.value || !dateEnd.value) {
    errorMessage.value = "Please select both the start date and end date.";

    return;
  }

  if (dateStart.value > dateEnd.value) {
    errorMessage.value = "Start date cannot be later than the end date.";

    return;
  }

  loading.value = true;

  try {
    const start = formatSearchDate(dateStart.value);

    const end = formatSearchDate(dateEnd.value);

    const result = await $fetch<AttendanceLog[]>(
      `/api/attendance/search?date_start=${encodeURIComponent(
        start,
      )}&date_end=${encodeURIComponent(end)}`,
    );

    logs.value = (result ?? []).filter(
      (item) => Number(item.user_id) === Number(selectedEmployeeId.value),
    );

    const employee = employees.value.find(
      (item) => Number(item.user_id) === Number(selectedEmployeeId.value),
    );

    generatedEmployee.value = {
      user_id: Number(selectedEmployeeId.value),

      name:
        employee?.name ||
        logs.value[0]?.name ||
        `Employee ${selectedEmployeeId.value}`,
    };

    generatedStartDate.value = new Date(dateStart.value);

    generatedEndDate.value = new Date(dateEnd.value);

    generatedAt.value = new Date();

    statusFilter.value = "all";

    hasGeneratedReport.value = true;
  } catch (error) {
    console.error("Employee attendance report error:", error);

    logs.value = [];

    hasGeneratedReport.value = false;

    generatedEmployee.value = null;

    errorMessage.value = "Unable to generate the employee attendance report.";
  } finally {
    loading.value = false;
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

  /*
   * If an employee is already selected,
   * generate immediately.
   */

  if (selectedEmployeeId.value) {
    await nextTick();

    await generateReport();
  }
};

/* ==========================================================================
   CLEAR
============================================================================ */

const clearReport = () => {
  selectedEmployeeId.value = null;

  dateStart.value = null;

  dateEnd.value = null;

  generatedStartDate.value = null;

  generatedEndDate.value = null;

  generatedEmployee.value = null;

  generatedAt.value = null;

  activeQuickRange.value = null;

  statusFilter.value = "all";

  logs.value = [];

  errorMessage.value = "";

  hasGeneratedReport.value = false;
};

/* ==========================================================================
   REPORT PERIOD
============================================================================ */

const reportPeriodText = computed(() => {
  if (!generatedStartDate.value || !generatedEndDate.value) {
    return "—";
  }

  return `${formatSelectedDate(
    generatedStartDate.value,
  )} – ${formatSelectedDate(generatedEndDate.value)}`;
});

/* ==========================================================================
   DATE PARSER
============================================================================ */

const parseDateValue = (value?: string) => {
  if (!value) {
    return null;
  }

  const clean = String(value).trim();

  const match = clean.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }

  const date = new Date(clean);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

/* ==========================================================================
   DATE FORMATTERS
============================================================================ */

const formatDate = (value?: string) => {
  const date = parseDateValue(value);

  if (!date) {
    return "—";
  }

  return date.toLocaleDateString("en-PH", {
    month: "short",

    day: "2-digit",

    year: "numeric",
  });
};

const getDayName = (value?: string) => {
  const date = parseDateValue(value);

  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-PH", {
    weekday: "long",
  });
};

const getDateDay = (value?: string) => {
  const date = parseDateValue(value);

  return date ? String(date.getDate()).padStart(2, "0") : "--";
};

const getDateMonth = (value?: string) => {
  const date = parseDateValue(value);

  if (!date) {
    return "---";
  }

  return date
    .toLocaleDateString("en-PH", {
      month: "short",
    })
    .toUpperCase();
};

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
   TIME
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

const formatGeneratedTime = (value: Date) => {
  return value.toLocaleTimeString("en-PH", {
    hour: "2-digit",

    minute: "2-digit",

    hour12: true,
  });
};

/* ==========================================================================
   NUMBERS
============================================================================ */

const formatNumber = (value: number | string | null | undefined) => {
  const number = Number(value ?? 0);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toLocaleString("en-PH", {
    minimumFractionDigits: 0,

    maximumFractionDigits: 2,
  });
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
   PRINT / PDF
============================================================================ */

const printEmployeeReport = () => {
  if (!generatedEmployee.value || filteredLogs.value.length === 0) {
    return;
  }

  const records = filteredLogs.value;

  const printedOnTime = records.filter((item) => isOnTime(item)).length;

  const printedLate = records.filter(
    (item) => Number(item.late_minutes ?? 0) > 0,
  ).length;

  const printedHours = records.reduce((total, item) => {
    const hours = Number(item.total_hours ?? 0);

    return total + (Number.isFinite(hours) ? hours : 0);
  }, 0);

  printReport({
    title: "Employee Attendance Report",

    subtitle: "Individual biometric attendance record",

    employeeName: generatedEmployee.value.name,

    employeeId: generatedEmployee.value.user_id,

    period: reportPeriodText.value,

    orientation: "portrait",

    note:
      statusFilter.value !== "all"
        ? `This printed report is filtered by: ${
            statusFilterOptions.find(
              (item) => item.value === statusFilter.value,
            )?.title ?? statusFilter.value
          }.`
        : undefined,

    metrics: [
      {
        label: "Attendance Days",

        value: records.length,
      },

      {
        label: "On Time",

        value: printedOnTime,
      },

      {
        label: "Late",

        value: printedLate,
      },

      {
        label: "Total Hours",

        value: `${formatNumber(printedHours)} hrs`,
      },
    ],

    columns: [
      {
        key: "date",

        label: "Date",
      },

      {
        key: "schedule",

        label: "Schedule",
      },

      {
        key: "time_in",

        label: "Time In",
      },

      {
        key: "time_out",

        label: "Time Out",
      },

      {
        key: "lateness",

        label: "Lateness",
      },

      // {
      //   key: "early_leave",

      //   label: "Early Leave",
      // },

      {
        key: "hours",

        label: "Hours",

        align: "right",
      },
    ],

    rows: records.map((item) => {
      const lateMinutes = Number(item.late_minutes ?? 0);

      const day = getDayName(item.log_date);

      return {
        date: day
          ? `${formatDate(item.log_date)} (${day})`
          : formatDate(item.log_date),

        schedule:
          item.shift_start || item.shift_end
            ? `${formatShiftTime(item.shift_start)} - ${formatShiftTime(
                item.shift_end,
              )}`
            : "No schedule",

        time_in: formatTime(item.in_time),

        time_out: hasNoTimeOut(item)
          ? "No Time Out"
          : formatTime(item.out_time),

        lateness:
          lateMinutes > 0
            ? `${lateMinutes} min Late`
            : isOnTime(item)
              ? "On Time"
              : "—",

        early_leave: getEarlyLeaveDisplay(item.early_leave_status),

        hours:
          item.total_hours !== null && item.total_hours !== undefined
            ? `${formatNumber(item.total_hours)} hrs`
            : "—",
      };
    }),
  });
};

/* ==========================================================================
   LIFECYCLE
============================================================================ */

onMounted(async () => {
  await loadEmployees();
});
</script>

<style scoped>
/* ==========================================================================
   COMPONENT
============================================================================ */

.employee-attendance-report {
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

  border: 1px solid #e5e9e6;

  border-radius: 13px;

  background: #ffffff;

  cursor: pointer;

  box-shadow: 0 3px 12px rgba(15, 23, 42, 0.022);

  transition:
    transform 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.summary-card:hover {
  transform: translateY(-2px);

  border-color: #d7e7db;

  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
}

.summary-card-active {
  border-color: rgba(22, 163, 74, 0.33);

  background: linear-gradient(145deg, #f8fcf9, #ffffff);

  box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.045);
}

.summary-content {
  padding: 17px !important;
}

.summary-top {
  display: flex;

  align-items: center;

  justify-content: space-between;
}

.summary-icon {
  width: 39px;

  height: 39px;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 10px;
}

.icon-records {
  background: #edf9f1;

  color: #15803d;
}

.icon-on-time {
  background: #effbf3;

  color: #16a34a;
}

.icon-late {
  background: #fff5f5;

  color: #dc2626;
}

.icon-hours {
  background: #eff6ff;

  color: #2563eb;
}

.summary-tag {
  color: #9ca3af;

  font-size: 0.51rem;

  font-weight: 750;

  letter-spacing: 0.07em;
}

.summary-tag-blue {
  color: #2563eb;
}

.summary-value {
  margin-top: 13px;

  color: #1f2937;

  font-size: 1.75rem;

  font-weight: 780;

  line-height: 1;
}

.summary-value-blue {
  color: #2563eb;
}

.summary-label {
  margin-top: 8px;

  color: #374151;

  font-size: 0.71rem;

  font-weight: 680;
}

.summary-description {
  margin-top: 3px;

  color: #9ca3af;

  font-size: 0.62rem;
}

/* ==========================================================================
   CARDS
============================================================================ */

.filter-card,
.employee-report-card,
.report-table-card {
  overflow: hidden;

  border: 1px solid #e5e9e6;

  border-radius: 13px;

  background: #ffffff;

  box-shadow: 0 3px 14px rgba(15, 23, 42, 0.02);
}

.filter-card,
.employee-report-card {
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

  justify-content: space-between;

  gap: 16px;

  padding: 14px 17px;
}

.card-heading {
  display: flex;

  align-items: center;

  gap: 9px;
}

.card-heading-icon {
  width: 37px;

  height: 37px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-shrink: 0;

  border: 1px solid #dceee1;

  border-radius: 9px;

  background: #eff9f2;

  color: #15803d;
}

.section-title {
  color: #1f2937;

  font-size: 0.89rem;

  font-weight: 720;
}

.section-subtitle {
  margin-top: 2px;

  color: #9ca3af;

  font-size: 0.63rem;
}

.generated-chip {
  font-size: 0.58rem;
}

/* ==========================================================================
   QUICK RANGE
============================================================================ */

.quick-range-bar {
  display: flex;

  align-items: center;

  gap: 11px;

  padding: 9px 17px;

  background: #fafbfa;
}

.quick-range-label {
  color: #8e969f;

  font-size: 0.61rem;

  font-weight: 650;
}

.quick-range-toggle {
  overflow: hidden;

  border-radius: 8px;
}

:deep(.quick-range-toggle .v-btn) {
  min-height: 29px;

  padding-inline: 11px;

  text-transform: none;

  font-size: 0.61rem;

  letter-spacing: 0;
}

/* ==========================================================================
   FILTER
============================================================================ */

.filter-content {
  padding: 17px !important;
}

.field-label-row {
  display: flex;

  align-items: center;

  justify-content: space-between;

  margin-bottom: 7px;
}

.field-label {
  color: #4b5563;

  font-size: 0.67rem;

  font-weight: 650;
}

.field-label-row > span {
  color: #a3aab2;

  font-size: 0.52rem;

  text-transform: uppercase;
}

:deep(.filter-field .v-field) {
  border-radius: 9px;
}

.filter-actions {
  display: flex;

  flex-direction: column;

  gap: 6px;
}

.generate-button,
.clear-button,
.print-button {
  text-transform: none;

  font-size: 0.64rem;

  font-weight: 650;

  letter-spacing: 0;
}

/* ==========================================================================
   EMPLOYEE AUTOCOMPLETE
============================================================================ */

:deep(.employee-autocomplete .v-field) {
  border-radius: 9px;
}

.employee-option {
  min-height: 58px;
}

.employee-option-avatar {
  width: 34px;

  height: 34px;

  display: flex;

  align-items: center;

  justify-content: center;

  margin-right: 10px;

  border: 1px solid #d7eddd;

  border-radius: 9px;

  background: #ebf8ef;

  color: #15803d;

  font-size: 0.61rem;

  font-weight: 760;
}

.employee-option-name {
  color: #1f2937;

  font-size: 0.72rem;

  font-weight: 680;
}

.employee-option-id {
  margin-top: 2px;

  color: #9ca3af;

  font-size: 0.56rem;
}

.selected-employee {
  display: flex;

  align-items: center;

  gap: 6px;

  min-width: 0;
}

.selected-employee > span {
  overflow: hidden;

  color: #374151;

  font-size: 0.7rem;

  font-weight: 650;

  text-overflow: ellipsis;

  white-space: nowrap;
}

.selected-employee > small {
  flex-shrink: 0;

  color: #9ca3af;

  font-size: 0.55rem;
}

/* ==========================================================================
   ERROR
============================================================================ */

.report-alert {
  margin-bottom: 16px;
}

/* ==========================================================================
   EMPLOYEE REPORT HEADER
============================================================================ */

.employee-report-main {
  display: grid;

  grid-template-columns:
    minmax(260px, 1.5fr)
    minmax(210px, 1fr)
    auto;

  align-items: center;

  gap: 20px;

  padding: 18px;
}

.employee-profile {
  display: flex;

  align-items: center;

  gap: 11px;
}

.employee-avatar {
  width: 52px;

  height: 52px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-shrink: 0;

  border: 1px solid #d6eadc;

  border-radius: 13px;

  background: #eaf7ee;

  color: #15803d;

  font-size: 0.78rem;

  font-weight: 800;
}

.employee-profile-copy {
  min-width: 0;
}

.employee-report-eyebrow {
  color: #15803d;

  font-size: 0.5rem;

  font-weight: 750;

  letter-spacing: 0.08em;
}

.employee-report-name {
  margin-top: 3px;

  overflow: hidden;

  color: #1f2937;

  font-size: 0.92rem;

  font-weight: 720;

  text-overflow: ellipsis;

  white-space: nowrap;
}

.employee-report-id {
  margin-top: 3px;

  color: #9ca3af;

  font-size: 0.58rem;
}

.employee-report-period {
  padding-left: 18px;

  border-left: 1px solid #e8ebe9;
}

.period-label {
  color: #9ca3af;

  font-size: 0.5rem;

  font-weight: 720;

  letter-spacing: 0.07em;
}

.period-value {
  margin-top: 4px;

  color: #4b5563;

  font-size: 0.65rem;

  font-weight: 650;
}

.employee-mini-stats {
  display: flex;

  gap: 8px;
}

.mini-stat {
  min-width: 65px;

  padding: 8px 9px;

  border: 1px solid #e8ebe9;

  border-radius: 8px;

  background: #fafbfa;

  text-align: center;
}

.mini-stat span {
  display: block;

  color: #374151;

  font-size: 0.8rem;

  font-weight: 750;
}

.mini-stat small {
  display: block;

  margin-top: 2px;

  color: #9ca3af;

  font-size: 0.47rem;
}

.employee-report-footer {
  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 12px;

  padding: 8px 18px;

  border-top: 1px solid #eef0ef;

  background: #fafbfa;

  color: #929aa4;

  font-size: 0.55rem;
}

.generated-time,
.generated-source {
  display: flex;

  align-items: center;

  gap: 5px;
}

/* ==========================================================================
   TOOLBAR
============================================================================ */

.toolbar-actions {
  display: flex;

  align-items: center;

  gap: 8px;
}

.status-filter {
  width: 170px;
}

:deep(.status-filter .v-field) {
  border-radius: 9px;
}

/* ==========================================================================
   RESULTS BAR
============================================================================ */

.results-bar {
  min-height: 38px;

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 12px;

  padding: 8px 17px;

  border-top: 1px solid #f0f2f1;

  background: #fafbfa;

  color: #929aa4;

  font-size: 0.58rem;
}

.results-left {
  display: flex;

  align-items: center;

  gap: 6px;
}

.report-result-status {
  width: 6px;

  height: 6px;

  border-radius: 50%;

  background: #c5cbd0;
}

.report-result-status-active {
  background: #22c55e;

  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.1);
}

.results-divider {
  color: #c4c9ce;
}

.results-right strong {
  color: #4b5563;
}

/* ==========================================================================
   TABLE
============================================================================ */

:deep(.employee-attendance-table .v-table__wrapper) {
  overflow-x: auto;
}

:deep(.employee-attendance-table thead th) {
  height: 47px !important;

  padding-left: 10px !important;

  padding-right: 10px !important;

  border-bottom: 1px solid #e8ebe9 !important;

  background: #fafbfa !important;

  color: #667085 !important;

  font-size: 0.62rem !important;

  font-weight: 720 !important;

  letter-spacing: 0.035em;

  text-transform: uppercase;

  white-space: nowrap;
}

:deep(.employee-attendance-table tbody td) {
  height: 63px !important;

  padding-left: 10px !important;

  padding-right: 10px !important;

  border-bottom: 1px solid #f0f2f1 !important;

  color: #374151;

  font-size: 0.7rem;

  white-space: nowrap;
}

:deep(.employee-attendance-table tbody tr:hover) {
  background: #f8fbf9 !important;
}

/* ==========================================================================
   DATE
============================================================================ */

.date-cell {
  display: flex;

  align-items: center;

  gap: 8px;
}

.date-calendar {
  width: 36px;

  height: 39px;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  flex-shrink: 0;

  border: 1px solid #dfe7e2;

  border-radius: 8px;

  background: #f6faf7;
}

.date-calendar span {
  color: #374151;

  font-size: 0.68rem;

  font-weight: 760;

  line-height: 1;
}

.date-calendar small {
  margin-top: 3px;

  color: #15803d;

  font-size: 0.44rem;

  font-weight: 750;
}

.date-primary {
  color: #374151;

  font-size: 0.64rem;

  font-weight: 640;
}

.date-secondary {
  margin-top: 2px;

  color: #9ca3af;

  font-size: 0.53rem;
}

/* ==========================================================================
   TABLE CELLS
============================================================================ */

.schedule-cell,
.time-cell {
  display: flex;

  align-items: center;

  gap: 7px;
}

.table-icon {
  width: 27px;

  height: 27px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-shrink: 0;

  border-radius: 7px;

  background: #f1f3f2;

  color: #6b7280;
}

.icon-in {
  background: #e9f8ee;

  color: #15803d;
}

.icon-out {
  background: #eff6ff;

  color: #2563eb;
}

.schedule-value {
  color: #4b5563;

  font-size: 0.61rem;

  font-weight: 640;
}

.cell-subtitle {
  margin-top: 2px;

  color: #9ca3af;

  font-size: 0.51rem;
}

.time-in {
  color: #15803d;

  font-size: 0.63rem;

  font-weight: 650;
}

.time-out {
  color: #2563eb;

  font-size: 0.63rem;

  font-weight: 650;
}

.empty-status {
  display: inline-flex;

  align-items: center;

  gap: 4px;

  color: #a7afb7;

  font-size: 0.56rem;
}

.status-chip {
  font-size: 0.56rem;
}

.hours-cell {
  color: #374151;

  font-size: 0.68rem;

  font-weight: 730;
}

.hours-cell span {
  margin-left: 2px;

  color: #9ca3af;

  font-size: 0.51rem;

  font-weight: 500;
}

.empty-value {
  color: #c1c6cc;
}

/* ==========================================================================
   EMPTY
============================================================================ */

.empty-state {
  padding: 58px 20px;

  text-align: center;
}

.empty-icon {
  width: 62px;

  height: 62px;

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

  font-size: 0.88rem;

  font-weight: 700;
}

.empty-description {
  max-width: 390px;

  margin: 5px auto 0;

  color: #9ca3af;

  font-size: 0.65rem;

  line-height: 1.5;
}

/* ==========================================================================
   TABLET
============================================================================ */

@media (max-width: 1050px) {
  .employee-report-main {
    grid-template-columns: 1fr 1fr;
  }

  .employee-mini-stats {
    grid-column: 1 / -1;
  }
}

@media (max-width: 960px) {
  .card-header,
  .table-toolbar {
    align-items: stretch;

    flex-direction: column;
  }

  .toolbar-actions {
    width: 100%;
  }

  .status-filter {
    flex: 1;

    width: auto;
  }

  .employee-report-main {
    grid-template-columns: 1fr;
  }

  .employee-report-period {
    padding-left: 0;

    padding-top: 12px;

    border-left: 0;

    border-top: 1px solid #e8ebe9;
  }
}

/* ==========================================================================
   MOBILE
============================================================================ */

@media (max-width: 600px) {
  .quick-range-bar {
    align-items: flex-start;

    flex-direction: column;
  }

  .quick-range-toggle {
    width: 100%;
  }

  :deep(.quick-range-toggle .v-btn) {
    flex: 1;
  }

  .employee-mini-stats {
    display: grid;

    grid-template-columns: repeat(3, 1fr);

    width: 100%;
  }

  .mini-stat {
    min-width: 0;
  }

  .employee-report-footer {
    align-items: flex-start;

    flex-direction: column;
  }

  .toolbar-actions {
    align-items: stretch;

    flex-direction: column;
  }

  .print-button,
  .status-filter {
    width: 100%;
  }

  .results-bar {
    align-items: flex-start;

    flex-direction: column;
  }
}

/* ==========================================================================
   REDUCED MOTION
============================================================================ */

@media (prefers-reduced-motion: reduce) {
  .summary-card {
    transition: none;
  }
}
</style>
