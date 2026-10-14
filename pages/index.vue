<template>
  <div class="attendance-dashboard">
    <!-- =========================================================
         PAGE HEADER
    ========================================================== -->
    <div class="dashboard-header">
      <div class="header-content">
        <div class="header-title-row">
          <div class="header-icon">
            <v-icon size="23"> mdi-view-dashboard-outline </v-icon>
          </div>

          <div>
            <h1 class="page-title">Live Attendance</h1>

            <p class="page-subtitle">
              Real-time biometric attendance monitoring and employee activity.
            </p>
          </div>
        </div>
      </div>

      <div class="header-actions">
        <!-- Connection -->
        <div
          class="connection-pill"
          :class="{
            'connection-online': realtimeConnected,
            'connection-offline': !realtimeConnected,
          }"
        >
          <span
            class="connection-dot"
            :class="{
              'dot-online': realtimeConnected,
            }"
          />

          <span>
            {{ realtimeConnected ? "Live Connection" : "Disconnected" }}
          </span>
        </div>

        <!-- Updated -->
        <div v-if="lastUpdated" class="updated-pill">
          <v-icon size="15"> mdi-clock-outline </v-icon>

          Updated
          {{ formatLastUpdated(lastUpdated) }}
        </div>
      </div>
    </div>

    <!-- =========================================================
         LIVE BIOMETRIC HERO
    ========================================================== -->
    <section class="live-hero mb-5">
      <!-- Decoration -->
      <div class="hero-decoration hero-decoration-one" />
      <div class="hero-decoration hero-decoration-two" />

      <div class="hero-grid">
        <!-- =====================================================
             SYSTEM STATUS
        ====================================================== -->
        <div class="hero-main">
          <div class="hero-eyebrow">
            <span class="hero-live-dot" />

            LIVE BIOMETRIC MONITORING
          </div>

          <h2 class="hero-title">
            Attendance activity
            <br />
            as it happens.
          </h2>

          <p class="hero-description">
            Biometric punches are synchronized automatically and reflected on
            this dashboard in real time.
          </p>

          <div class="hero-meta">
            <div class="hero-meta-item">
              <v-icon size="17"> mdi-calendar-today-outline </v-icon>

              <div>
                <span class="hero-meta-label"> Today </span>

                <span class="hero-meta-value">
                  {{ todayDateLabel }}
                </span>
              </div>
            </div>

            <div class="hero-meta-divider" />

            <div class="hero-meta-item">
              <v-icon size="17"> mdi-clock-outline </v-icon>

              <div>
                <span class="hero-meta-label"> Local Time </span>

                <span class="hero-meta-value">
                  {{ currentTime }}
                </span>
              </div>
            </div>

            <div class="hero-meta-divider" />

            <div class="hero-meta-item">
              <v-icon size="17"> mdi-fingerprint </v-icon>

              <div>
                <span class="hero-meta-label"> Integration </span>

                <span class="hero-meta-value"> ZKTeco </span>
              </div>
            </div>
          </div>
        </div>

        <!-- =====================================================
             LATEST PUNCH
        ====================================================== -->
        <div class="latest-punch-panel">
          <div class="latest-panel-header">
            <div>
              <div class="latest-panel-label">LATEST BIOMETRIC PUNCH</div>

              <div class="latest-panel-subtitle">
                Most recent attendance activity
              </div>
            </div>

            <div class="live-scanner">
              <v-icon size="28"> mdi-fingerprint </v-icon>

              <div class="scanner-line" />
            </div>
          </div>

          <template v-if="latestAttendance">
            <div class="latest-person">
              <div class="latest-avatar">
                {{ getInitials(latestAttendance.name) }}
              </div>

              <div class="latest-person-info">
                <div class="latest-name">
                  {{ latestAttendance.name || "Unknown Employee" }}
                </div>

                <div class="latest-id">
                  Employee ID
                  {{ latestAttendance.user_id }}
                </div>
              </div>

              <v-chip
                size="small"
                variant="flat"
                class="latest-status-chip"
                :color="getStatusMeta(latestAttendance.status).color"
              >
                <v-icon start size="15">
                  {{ getStatusMeta(latestAttendance.status).icon }}
                </v-icon>

                {{ latestAttendance.status || "UNKNOWN" }}
              </v-chip>
            </div>

            <div class="latest-time-block">
              <div class="latest-time-label">Punch Time</div>

              <div class="latest-time-value">
                {{ formatTime(latestAttendance.last_punch) }}
              </div>

              <div class="latest-date-value">
                {{ formatDate(latestAttendance.log_date) }}
                <span v-if="latestAttendance.day">
                  · {{ latestAttendance.day }}
                </span>
              </div>
            </div>
          </template>

          <div v-else class="latest-empty">
            <v-icon size="34" class="mb-2"> mdi-fingerprint-off </v-icon>

            <div>Waiting for biometric punches</div>
          </div>
        </div>
      </div>
    </section>

    <!-- =========================================================
         SUMMARY CARDS
    ========================================================== -->
    <v-row class="dashboard-stats mb-5">
      <!-- Attendance Today -->
      <v-col cols="12" sm="6" lg="3">
        <v-card elevation="0" class="stat-card">
          <v-card-text class="stat-card-content">
            <div class="stat-top">
              <div class="stat-icon stat-icon-attendance">
                <v-icon size="22"> mdi-account-check-outline </v-icon>
              </div>

              <div class="stat-badge">TODAY</div>
            </div>

            <div class="stat-value">
              {{ todayLogs.length }}
            </div>

            <div class="stat-label">Attendance Today</div>

            <div class="stat-description">
              Employees with biometric activity
            </div>

            <div class="stat-progress">
              <div
                class="stat-progress-bar stat-progress-green"
                :style="{
                  width: attendanceActivityWidth,
                }"
              />
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Currently In -->
      <v-col cols="12" sm="6" lg="3">
        <v-card elevation="0" class="stat-card">
          <v-card-text class="stat-card-content">
            <div class="stat-top">
              <div class="stat-icon stat-icon-inside">
                <v-icon size="22"> mdi-login </v-icon>
              </div>

              <div class="stat-live-label">
                <span class="mini-live-dot" />
                LIVE
              </div>
            </div>

            <div class="stat-value text-success">
              {{ clockedInCount }}
            </div>

            <div class="stat-label">Currently In</div>

            <div class="stat-description">Employees currently on campus</div>

            <div class="stat-progress">
              <div
                class="stat-progress-bar stat-progress-green"
                :style="{
                  width: currentlyInWidth,
                }"
              />
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Clocked Out -->
      <v-col cols="12" sm="6" lg="3">
        <v-card elevation="0" class="stat-card">
          <v-card-text class="stat-card-content">
            <div class="stat-top">
              <div class="stat-icon stat-icon-out">
                <v-icon size="22"> mdi-logout </v-icon>
              </div>

              <div class="stat-badge">COMPLETED</div>
            </div>

            <div class="stat-value stat-value-blue">
              {{ clockedOutCount }}
            </div>

            <div class="stat-label">Clocked Out</div>

            <div class="stat-description">Completed attendance today</div>

            <div class="stat-progress">
              <div
                class="stat-progress-bar stat-progress-blue"
                :style="{
                  width: clockedOutWidth,
                }"
              />
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Punches Today -->
      <v-col cols="12" sm="6" lg="3">
        <v-card elevation="0" class="stat-card">
          <v-card-text class="stat-card-content">
            <div class="stat-top">
              <div class="stat-icon stat-icon-punch">
                <v-icon size="22"> mdi-fingerprint </v-icon>
              </div>

              <div class="stat-badge">PUNCHES</div>
            </div>

            <div class="stat-value stat-value-orange">
              {{ todayPunchCount }}
            </div>

            <div class="stat-label">Biometric Punches</div>

            <div class="stat-description">Total punch activity today</div>

            <div class="stat-progress">
              <div
                class="stat-progress-bar stat-progress-orange"
                :style="{
                  width: punchActivityWidth,
                }"
              />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- =========================================================
         LIVE ACTIVITY CARD
    ========================================================== -->
    <v-card elevation="0" class="attendance-card">
      <!-- =======================================================
           CARD HEADER
      ======================================================== -->
      <div class="table-toolbar">
        <div class="table-heading">
          <div class="table-heading-icon">
            <v-icon size="20"> mdi-pulse </v-icon>
          </div>

          <div>
            <div class="section-title">Live Attendance Feed</div>

            <div class="section-subtitle">
              Latest biometric activity appears automatically.
            </div>
          </div>
        </div>

        <div class="toolbar-actions">
          <v-btn
            variant="tonal"
            color="primary"
            size="small"
            :loading="refreshing"
            prepend-icon="mdi-refresh"
            class="refresh-button"
            @click="fetchAttendance()"
          >
            Refresh
          </v-btn>

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
           FILTER BAR
      ======================================================== -->
      <div class="filter-bar">
        <div class="filter-left">
          <span class="filter-label"> Show </span>

          <v-btn-toggle
            v-model="activeFilter"
            mandatory
            density="compact"
            color="primary"
            variant="outlined"
            class="filter-toggle"
          >
            <v-btn value="all" size="small"> All </v-btn>

            <v-btn value="today" size="small">
              Today
              <span class="filter-count">
                {{ todayLogs.length }}
              </span>
            </v-btn>

            <v-btn value="in" size="small">
              Currently In
              <span class="filter-count">
                {{ clockedInCount }}
              </span>
            </v-btn>
          </v-btn-toggle>
        </div>

        <div class="filter-summary">
          <v-icon size="15" class="me-1"> mdi-database-outline </v-icon>

          {{ filteredLogs.length }}
          {{ filteredLogs.length === 1 ? "record" : "records" }}
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
        closable
        density="comfortable"
        class="ma-4"
        @click:close="errorMessage = ''"
      >
        {{ errorMessage }}
      </v-alert>

      <!-- =======================================================
           TABLE
      ======================================================== -->
      <v-data-table
        :items="filteredLogs"
        :headers="headers"
        :search="search"
        :loading="loading"
        :sort-by="defaultSort"
        density="comfortable"
        :items-per-page="15"
        class="attendance-table"
      >
        <!-- Loading -->
        <template #loading>
          <v-skeleton-loader type="table-row@8" />
        </template>

        <!-- Employee -->
        <template #[`item.name`]="{ item }">
          <div class="employee-cell">
            <div class="employee-avatar">
              {{ getInitials(item.name) }}
            </div>

            <div class="employee-information">
              <div class="employee-name">
                {{ item.name || "Unknown Employee" }}
              </div>

              <div class="employee-secondary">ID {{ item.user_id }}</div>
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
              {{ item.day || "" }}
            </div>
          </div>
        </template>

        <!-- Latest Punch -->
        <template #[`item.last_punch`]="{ item }">
          <div class="punch-cell">
            <div
              class="punch-icon"
              :class="{
                'latest-punch-icon': isLatestAttendance(item),
              }"
            >
              <v-icon size="16"> mdi-clock-outline </v-icon>
            </div>

            <div>
              <div class="last-punch-time">
                {{ formatTime(item.last_punch) }}
              </div>

              <div v-if="isLatestAttendance(item)" class="latest-indicator">
                <span class="latest-indicator-dot" />
                Latest
              </div>
            </div>
          </div>
        </template>

        <!-- Status -->
        <template #[`item.status`]="{ item }">
          <v-chip
            size="small"
            variant="tonal"
            :color="getStatusMeta(item.status).color"
            class="status-chip"
          >
            <v-icon start size="15">
              {{ getStatusMeta(item.status).icon }}
            </v-icon>

            {{ item.status || "UNKNOWN" }}
          </v-chip>
        </template>

        <!-- Time In -->
        <template #[`item.in_time`]="{ item }">
          <div v-if="item.in_time" class="time-cell">
            <v-icon size="14" color="success"> mdi-login </v-icon>

            {{ formatTime(item.in_time) }}
          </div>

          <span v-else class="empty-value"> — </span>
        </template>

        <!-- Time Out -->
        <template #[`item.out_time`]="{ item }">
          <v-chip
            v-if="isClockedIn(item)"
            size="small"
            color="success"
            variant="tonal"
            class="currently-in-chip"
          >
            <span class="current-status-dot" />

            Currently In
          </v-chip>

          <div v-else-if="item.out_time" class="time-cell">
            <v-icon size="14" color="primary"> mdi-logout </v-icon>

            {{ formatTime(item.out_time) }}
          </div>

          <span v-else class="empty-value"> — </span>
        </template>

        <!-- Punches -->
        <template #[`item.entries`]="{ item }">
          <div class="punch-count">
            <v-icon size="15"> mdi-fingerprint </v-icon>

            {{ item.entries ?? 0 }}
          </div>
        </template>

        <!-- Total Hours -->
        <template #[`item.total_hours`]="{ item }">
          <div
            v-if="item.total_hours !== null && item.total_hours !== undefined"
            class="hours-value"
          >
            {{ item.total_hours }}

            <span class="hours-label"> hrs </span>
          </div>

          <span v-else class="empty-value"> — </span>
        </template>

        <!-- Empty -->
        <template #no-data>
          <div class="empty-state">
            <div class="empty-icon">
              <v-icon size="35"> mdi-fingerprint-off </v-icon>
            </div>

            <div class="empty-title">No attendance activity</div>

            <div class="empty-description">
              New biometric punches will appear here automatically.
            </div>
          </div>
        </template>

        <!-- Footer -->
        <template #bottom>
          <div class="table-footer">
            <div class="table-footer-status">
              <span
                class="footer-live-dot"
                :class="{
                  'footer-live-active': realtimeConnected,
                }"
              />

              {{
                realtimeConnected
                  ? "Listening for biometric punches"
                  : "Real-time connection unavailable"
              }}
            </div>

            <v-data-table-footer />
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
  day?: string;
  in_time?: string;
  out_time?: string;
  last_punch?: string;
  entries?: number;
  punch_status?: number | null;
  verify_type?: number | null;
  total_hours?: string | number | null;
  status?: string;
}

/* ==========================================================================
   STATE
============================================================================ */

const logs = ref<AttendanceLog[]>([]);

const loading = ref(true);

const refreshing = ref(false);

const search = ref("");

const errorMessage = ref("");

const realtimeConnected = ref(false);

const lastUpdated = ref<Date | null>(null);

const activeFilter = ref<"all" | "today" | "in">("all");

/* ==========================================================================
   LIVE CLOCK
============================================================================ */

const now = ref(new Date());

let clockTimer: ReturnType<typeof setInterval> | null = null;

const currentTime = computed(() => {
  return now.value.toLocaleTimeString("en-PH", {
    hour: "2-digit",

    minute: "2-digit",

    second: "2-digit",

    hour12: true,
  });
});

const todayDateLabel = computed(() => {
  return now.value.toLocaleDateString("en-PH", {
    weekday: "long",

    month: "long",

    day: "numeric",

    year: "numeric",
  });
});

/* ==========================================================================
   DEFAULT SORT
============================================================================ */

const defaultSort = ref([
  {
    key: "last_punch",

    order: "desc" as const,
  },
]);

/* ==========================================================================
   SSE
============================================================================ */

let eventSource: EventSource | null = null;

let refreshTimer: ReturnType<typeof setTimeout> | null = null;

/* ==========================================================================
   TABLE HEADERS
============================================================================ */

const headers = [
  {
    title: "Employee",

    key: "name",

    sortable: true,

    minWidth: 220,
  },

  {
    title: "Date",

    key: "log_date",

    sortable: true,

    minWidth: 130,
  },

  {
    title: "Latest Punch",

    key: "last_punch",

    sortable: true,

    minWidth: 155,
  },

  {
    title: "Status",

    key: "status",

    sortable: true,

    minWidth: 145,
  },

  {
    title: "Time In",

    key: "in_time",

    sortable: false,

    minWidth: 140,
  },

  {
    title: "Time Out",

    key: "out_time",

    sortable: false,

    minWidth: 145,
  },

  {
    title: "Punches",

    key: "entries",

    sortable: true,

    align: "center" as const,

    width: 100,
  },

  {
    title: "Total Hours",

    key: "total_hours",

    sortable: false,

    minWidth: 115,
  },
];

/* ==========================================================================
   LATEST ATTENDANCE
============================================================================ */

const latestAttendance = computed<AttendanceLog | null>(() => {
  return logs.value[0] ?? null;
});

/* ==========================================================================
   DATE HELPERS
============================================================================ */

const getLocalDateKey = (date: Date) => {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getLogDateKey = (value?: string) => {
  if (!value) {
    return "";
  }

  const cleanValue = String(value).trim();

  /*
   * If API gives an actual DATE only:
   * 2026-10-14
   *
   * Preserve it directly.
   */
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleanValue)) {
    return cleanValue;
  }

  /*
   * If PostgreSQL/Nitro serialized the
   * date as a timestamp:
   *
   * 2026-10-13T16:00:00.000Z
   *
   * Convert it to local Philippine/browser
   * time first. This becomes 2026-10-14.
   */
  const date = new Date(cleanValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return getLocalDateKey(date);
};

/* ==========================================================================
   TODAY LOGS
============================================================================ */

const todayLogs = computed(() => {
  const today = getLocalDateKey(new Date());

  return logs.value.filter((item) => getLogDateKey(item.log_date) === today);
});

/* ==========================================================================
   CURRENT ATTENDANCE STATE
============================================================================ */

const isClockedIn = (item: AttendanceLog) => {
  const status = String(item.status ?? "")
    .trim()
    .toUpperCase();

  return ["CLOCKED IN", "BREAK IN", "OT IN"].includes(status);
};

/* ==========================================================================
   COUNTS
============================================================================ */

const clockedInCount = computed(
  () => todayLogs.value.filter((item) => isClockedIn(item)).length,
);

const clockedOutCount = computed(
  () =>
    todayLogs.value.filter((item) => {
      const status = String(item.status ?? "")
        .trim()
        .toUpperCase();

      return ["CLOCKED OUT", "BREAK OUT", "OT OUT"].includes(status);
    }).length,
);

const todayPunchCount = computed(() => {
  return todayLogs.value.reduce((total, item) => {
    const entries = Number(item.entries ?? 0);

    return total + (Number.isFinite(entries) ? entries : 0);
  }, 0);
});

/* ==========================================================================
   FILTERED TABLE
============================================================================ */

const filteredLogs = computed(() => {
  if (activeFilter.value === "today") {
    return todayLogs.value;
  }

  if (activeFilter.value === "in") {
    return todayLogs.value.filter((item) => isClockedIn(item));
  }

  return logs.value;
});

/* ==========================================================================
   VISUAL PROGRESS
============================================================================ */

const percentageWidth = (
  value: number,

  total: number,
) => {
  if (!total || total <= 0) {
    return "0%";
  }

  const percentage = Math.min(100, Math.max(0, (value / total) * 100));

  return `${percentage}%`;
};

const attendanceActivityWidth = computed(() => {
  if (!logs.value.length) {
    return "0%";
  }

  return percentageWidth(todayLogs.value.length, logs.value.length);
});

const currentlyInWidth = computed(() =>
  percentageWidth(clockedInCount.value, todayLogs.value.length),
);

const clockedOutWidth = computed(() =>
  percentageWidth(clockedOutCount.value, todayLogs.value.length),
);

const punchActivityWidth = computed(() => {
  /*
   * Visual activity indicator only.
   * Keeps the progress bar bounded.
   */
  const baseline = Math.max(todayLogs.value.length * 2, 1);

  return percentageWidth(todayPunchCount.value, baseline);
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
    const data = await $fetch<AttendanceLog[]>("/api/attendance");

    logs.value = (data ?? []).sort((a, b) => {
      const timeA = a.last_punch ? new Date(a.last_punch).getTime() : 0;

      const timeB = b.last_punch ? new Date(b.last_punch).getTime() : 0;

      return timeB - timeA;
    });

    lastUpdated.value = new Date();

    errorMessage.value = "";
  } catch (error) {
    console.error("Failed to fetch attendance:", error);

    errorMessage.value = "Unable to load attendance records.";
  } finally {
    loading.value = false;

    refreshing.value = false;
  }
};

/* ==========================================================================
   LATEST ROW
============================================================================ */

const isLatestAttendance = (item: AttendanceLog) => {
  if (!latestAttendance.value) {
    return false;
  }

  return (
    item.user_id === latestAttendance.value.user_id &&
    item.last_punch === latestAttendance.value.last_punch
  );
};

/* ==========================================================================
   STATUS META
============================================================================ */

const getStatusMeta = (status?: string) => {
  switch (String(status ?? "").toUpperCase()) {
    case "CLOCKED IN":
      return {
        color: "success",

        icon: "mdi-login",
      };

    case "CLOCKED OUT":
      return {
        color: "primary",

        icon: "mdi-logout",
      };

    case "BREAK OUT":
      return {
        color: "warning",

        icon: "mdi-coffee-outline",
      };

    case "BREAK IN":
      return {
        color: "success",

        icon: "mdi-coffee",
      };

    case "OT IN":
      return {
        color: "purple",

        icon: "mdi-clock-plus-outline",
      };

    case "OT OUT":
      return {
        color: "deep-purple",

        icon: "mdi-clock-minus-outline",
      };

    default:
      return {
        color: "grey",

        icon: "mdi-help-circle-outline",
      };
  }
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
   REAL-TIME DEBOUNCE
============================================================================ */

const scheduleAttendanceRefresh = () => {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
  }

  refreshTimer = setTimeout(async () => {
    await fetchAttendance();

    refreshTimer = null;
  }, 500);
};

/* ==========================================================================
   REAL-TIME EVENT
============================================================================ */

const handleRealtimeEvent = (event: Event) => {
  const message = event as MessageEvent;

  console.log("New attendance event:", message.data);

  scheduleAttendanceRefresh();
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

  eventSource.addEventListener("attendance", handleRealtimeEvent);

  eventSource.onerror = (error) => {
    realtimeConnected.value = false;

    console.warn("Attendance SSE disconnected:", error);
  };
};

/* ==========================================================================
   FORMAT DATE
============================================================================ */

const formatDate = (value?: string) => {
  if (!value) {
    return "—";
  }

  const cleanValue = String(value).trim();

  /*
   * Plain database date:
   * 2026-10-14
   */
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleanValue)) {
    const [year, month, day] = cleanValue.split("-").map(Number);

    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString("en-PH", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  }

  /*
   * Timestamp returned from API.
   * Convert to browser/local timezone.
   */
  const date = new Date(cleanValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};
/* ==========================================================================
   FORMAT TIME
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
   LIFECYCLE
============================================================================ */

onMounted(async () => {
  clockTimer = setInterval(() => {
    now.value = new Date();
  }, 1000);

  await fetchAttendance(true);

  connectRealtime();
});

onBeforeUnmount(() => {
  if (clockTimer) {
    clearInterval(clockTimer);

    clockTimer = null;
  }

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

.attendance-dashboard {
  min-height: 100%;

  padding: 24px;

  background: #f7f9f8;
}

/* ==========================================================================
   HEADER
============================================================================ */

.dashboard-header {
  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 20px;

  margin-bottom: 22px;
}

.header-title-row {
  display: flex;

  align-items: center;

  gap: 12px;
}

.header-icon {
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

  color: #7b8490;

  font-size: 0.83rem;
}

.header-actions {
  display: flex;

  align-items: center;

  flex-wrap: wrap;

  gap: 8px;
}

/* ==========================================================================
   CONNECTION
============================================================================ */

.connection-pill,
.updated-pill {
  min-height: 34px;

  display: flex;

  align-items: center;

  gap: 7px;

  padding: 7px 11px;

  border-radius: 9px;

  font-size: 0.69rem;

  font-weight: 600;
}

.connection-pill {
  border: 1px solid transparent;
}

.connection-online {
  border-color: #cdebd7;

  background: #effaf2;

  color: #15803d;
}

.connection-offline {
  border-color: #f1d5d5;

  background: #fff5f5;

  color: #dc2626;
}

.connection-dot {
  width: 7px;

  height: 7px;

  border-radius: 50%;

  background: #ef4444;
}

.dot-online {
  background: #22c55e;

  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.12);

  animation: status-pulse 2s infinite;
}

.updated-pill {
  border: 1px solid #e5e7eb;

  background: #ffffff;

  color: #6b7280;
}

/* ==========================================================================
   HERO
============================================================================ */

.live-hero {
  position: relative;

  overflow: hidden;

  border: 1px solid rgba(255, 255, 255, 0.08);

  border-radius: 18px;

  background: linear-gradient(135deg, #14532d 0%, #15803d 48%, #16a34a 100%);

  box-shadow: 0 12px 32px rgba(20, 83, 45, 0.12);

  color: #ffffff;
}

.hero-grid {
  position: relative;

  z-index: 2;

  display: grid;

  grid-template-columns:
    minmax(0, 1.4fr)
    minmax(340px, 0.7fr);

  gap: 30px;

  padding: 32px;
}

.hero-main {
  display: flex;

  flex-direction: column;

  justify-content: center;

  min-height: 230px;
}

.hero-eyebrow {
  display: flex;

  align-items: center;

  gap: 8px;

  margin-bottom: 14px;

  color: rgba(220, 252, 231, 0.84);

  font-size: 0.64rem;

  font-weight: 760;

  letter-spacing: 0.13em;
}

.hero-live-dot {
  width: 7px;

  height: 7px;

  border-radius: 50%;

  background: #86efac;

  box-shadow: 0 0 0 5px rgba(134, 239, 172, 0.1);

  animation: status-pulse 2s infinite;
}

.hero-title {
  margin: 0;

  color: #ffffff;

  font-size: clamp(2rem, 3.2vw, 3.05rem);

  font-weight: 800;

  line-height: 1.07;

  letter-spacing: -0.03em;
}

.hero-description {
  max-width: 620px;

  margin: 16px 0 0;

  color: rgba(255, 255, 255, 0.72);

  font-size: 0.84rem;

  line-height: 1.65;
}

/* ==========================================================================
   HERO META
============================================================================ */

.hero-meta {
  display: flex;

  align-items: center;

  flex-wrap: wrap;

  gap: 18px;

  margin-top: 28px;
}

.hero-meta-item {
  display: flex;

  align-items: center;

  gap: 9px;

  color: rgba(255, 255, 255, 0.9);
}

.hero-meta-item > div {
  display: flex;

  flex-direction: column;
}

.hero-meta-label {
  color: rgba(255, 255, 255, 0.54);

  font-size: 0.57rem;

  text-transform: uppercase;

  letter-spacing: 0.07em;
}

.hero-meta-value {
  margin-top: 2px;

  color: rgba(255, 255, 255, 0.92);

  font-size: 0.67rem;

  font-weight: 650;
}

.hero-meta-divider {
  width: 1px;

  height: 29px;

  background: rgba(255, 255, 255, 0.16);
}

/* ==========================================================================
   HERO DECORATION
============================================================================ */

.hero-decoration {
  position: absolute;

  border: 1px solid rgba(255, 255, 255, 0.07);

  border-radius: 50%;

  pointer-events: none;
}

.hero-decoration-one {
  width: 420px;

  height: 420px;

  top: -260px;

  right: -100px;
}

.hero-decoration-two {
  width: 560px;

  height: 560px;

  right: -340px;

  bottom: -370px;
}

/* ==========================================================================
   LATEST PUNCH PANEL
============================================================================ */

.latest-punch-panel {
  position: relative;

  align-self: stretch;

  padding: 20px;

  border: 1px solid rgba(255, 255, 255, 0.16);

  border-radius: 16px;

  background: rgba(255, 255, 255, 0.11);

  backdrop-filter: blur(12px);

  -webkit-backdrop-filter: blur(12px);

  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.latest-panel-header {
  display: flex;

  align-items: flex-start;

  justify-content: space-between;

  gap: 12px;
}

.latest-panel-label {
  color: rgba(255, 255, 255, 0.86);

  font-size: 0.61rem;

  font-weight: 750;

  letter-spacing: 0.09em;
}

.latest-panel-subtitle {
  margin-top: 3px;

  color: rgba(255, 255, 255, 0.52);

  font-size: 0.61rem;
}

/* ==========================================================================
   SCANNER
============================================================================ */

.live-scanner {
  position: relative;

  overflow: hidden;

  width: 48px;

  height: 48px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-shrink: 0;

  border: 1px solid rgba(255, 255, 255, 0.16);

  border-radius: 13px;

  background: rgba(255, 255, 255, 0.1);

  color: rgba(255, 255, 255, 0.94);
}

.scanner-line {
  position: absolute;

  left: 7px;

  right: 7px;

  height: 1px;

  background: #bbf7d0;

  box-shadow: 0 0 7px #86efac;

  animation: fingerprint-scan 2.3s ease-in-out infinite;
}

/* ==========================================================================
   LATEST PERSON
============================================================================ */

.latest-person {
  display: flex;

  align-items: center;

  gap: 10px;

  margin-top: 28px;
}

.latest-avatar {
  width: 46px;

  height: 46px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-shrink: 0;

  border: 1px solid rgba(255, 255, 255, 0.2);

  border-radius: 13px;

  background: rgba(255, 255, 255, 0.14);

  color: #ffffff;

  font-size: 0.76rem;

  font-weight: 780;
}

.latest-person-info {
  flex: 1;

  min-width: 0;
}

.latest-name {
  overflow: hidden;

  color: #ffffff;

  font-size: 0.82rem;

  font-weight: 700;

  text-overflow: ellipsis;

  white-space: nowrap;
}

.latest-id {
  margin-top: 3px;

  color: rgba(255, 255, 255, 0.55);

  font-size: 0.62rem;
}

.latest-status-chip {
  font-size: 0.59rem;
}

/* ==========================================================================
   LATEST TIME
============================================================================ */

.latest-time-block {
  margin-top: 22px;

  padding-top: 18px;

  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.latest-time-label {
  color: rgba(255, 255, 255, 0.5);

  font-size: 0.58rem;

  text-transform: uppercase;

  letter-spacing: 0.07em;
}

.latest-time-value {
  margin-top: 3px;

  color: #ffffff;

  font-size: 1.55rem;

  font-weight: 780;

  line-height: 1.2;
}

.latest-date-value {
  margin-top: 4px;

  color: rgba(255, 255, 255, 0.61);

  font-size: 0.66rem;
}

.latest-empty {
  min-height: 150px;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  color: rgba(255, 255, 255, 0.6);

  font-size: 0.72rem;

  text-align: center;
}

/* ==========================================================================
   STAT CARDS
============================================================================ */

.stat-card {
  height: 100%;

  overflow: hidden;

  border: 1px solid #e6eae7;

  border-radius: 15px;

  background: #ffffff;

  box-shadow: 0 3px 13px rgba(15, 23, 42, 0.025);

  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    border-color 0.16s ease;
}

.stat-card:hover {
  transform: translateY(-3px);

  border-color: #d8e8dc;

  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.055);
}

.stat-card-content {
  padding: 19px !important;
}

.stat-top {
  display: flex;

  align-items: center;

  justify-content: space-between;

  margin-bottom: 15px;
}

.stat-icon {
  width: 42px;

  height: 42px;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 11px;
}

.stat-icon-attendance,
.stat-icon-inside {
  border: 1px solid #d6eedc;

  background: #edf9f1;

  color: #15803d;
}

.stat-icon-out {
  border: 1px solid #dbeafe;

  background: #eff6ff;

  color: #2563eb;
}

.stat-icon-punch {
  border: 1px solid #ffedd5;

  background: #fff7ed;

  color: #ea580c;
}

.stat-badge {
  color: #9ca3af;

  font-size: 0.56rem;

  font-weight: 740;

  letter-spacing: 0.08em;
}

.stat-live-label {
  display: flex;

  align-items: center;

  gap: 5px;

  color: #16a34a;

  font-size: 0.57rem;

  font-weight: 750;

  letter-spacing: 0.05em;
}

.mini-live-dot {
  width: 6px;

  height: 6px;

  border-radius: 50%;

  background: #22c55e;

  animation: status-pulse 2s infinite;
}

.stat-value {
  color: #1f2937;

  font-size: 1.9rem;

  font-weight: 780;

  line-height: 1;
}

.stat-value-blue {
  color: #2563eb;
}

.stat-value-orange {
  color: #ea580c;
}

.stat-label {
  margin-top: 9px;

  color: #374151;

  font-size: 0.76rem;

  font-weight: 680;
}

.stat-description {
  margin-top: 3px;

  color: #9ca3af;

  font-size: 0.67rem;
}

.stat-progress {
  overflow: hidden;

  height: 4px;

  margin-top: 17px;

  border-radius: 10px;

  background: #f1f3f2;
}

.stat-progress-bar {
  height: 100%;

  min-width: 0;

  border-radius: inherit;

  transition: width 0.3s ease;
}

.stat-progress-green {
  background: linear-gradient(90deg, #16a34a, #4ade80);
}

.stat-progress-blue {
  background: linear-gradient(90deg, #2563eb, #60a5fa);
}

.stat-progress-orange {
  background: linear-gradient(90deg, #ea580c, #fb923c);
}

/* ==========================================================================
   ATTENDANCE CARD
============================================================================ */

.attendance-card {
  overflow: hidden;

  border: 1px solid #e5e9e6;

  border-radius: 16px;

  background: #ffffff;

  box-shadow: 0 4px 18px rgba(15, 23, 42, 0.025);
}

/* ==========================================================================
   TABLE TOOLBAR
============================================================================ */

.table-toolbar {
  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 20px;

  padding: 18px 20px;
}

.table-heading {
  display: flex;

  align-items: center;

  gap: 11px;
}

.table-heading-icon {
  width: 39px;

  height: 39px;

  display: flex;

  align-items: center;

  justify-content: center;

  border: 1px solid #dceee1;

  border-radius: 10px;

  background: #eff9f2;

  color: #15803d;
}

.section-title {
  color: #1f2937;

  font-size: 0.96rem;

  font-weight: 720;
}

.section-subtitle {
  margin-top: 2px;

  color: #9ca3af;

  font-size: 0.69rem;
}

.toolbar-actions {
  display: flex;

  align-items: center;

  gap: 9px;
}

.refresh-button {
  text-transform: none;

  font-size: 0.7rem;

  font-weight: 650;

  letter-spacing: 0;
}

.search-field {
  width: 270px;
}

:deep(.search-field .v-field) {
  border-radius: 9px;
}

/* ==========================================================================
   FILTER BAR
============================================================================ */

.filter-bar {
  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 16px;

  padding: 10px 20px;

  border-top: 1px solid #f1f3f2;

  background: #fbfcfb;
}

.filter-left {
  display: flex;

  align-items: center;

  gap: 11px;
}

.filter-label {
  color: #9ca3af;

  font-size: 0.66rem;

  font-weight: 650;
}

.filter-toggle {
  overflow: hidden;

  border-radius: 8px;
}

:deep(.filter-toggle .v-btn) {
  min-height: 30px;

  padding-inline: 12px;

  text-transform: none;

  font-size: 0.66rem;

  letter-spacing: 0;
}

.filter-count {
  min-width: 19px;

  height: 18px;

  display: inline-flex;

  align-items: center;

  justify-content: center;

  margin-left: 6px;

  padding-inline: 5px;

  border-radius: 20px;

  background: rgba(15, 23, 42, 0.06);

  font-size: 0.58rem;

  font-weight: 700;
}

.filter-summary {
  display: flex;

  align-items: center;

  color: #9ca3af;

  font-size: 0.65rem;
}

/* ==========================================================================
   DATA TABLE
============================================================================ */

:deep(.attendance-table thead th) {
  height: 47px !important;

  border-bottom: 1px solid #e8ebe9 !important;

  background: #fafbfa !important;

  color: #667085 !important;

  font-size: 0.66rem !important;

  font-weight: 720 !important;

  letter-spacing: 0.04em;

  text-transform: uppercase;
}

:deep(.attendance-table tbody td) {
  height: 61px !important;

  border-bottom: 1px solid #f0f2f1 !important;

  color: #374151;

  font-size: 0.77rem;
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
  display: flex;

  align-items: center;

  gap: 10px;
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

  font-size: 0.66rem;

  font-weight: 750;
}

.employee-information {
  min-width: 0;
}

.employee-name {
  max-width: 185px;

  overflow: hidden;

  color: #1f2937;

  font-size: 0.76rem;

  font-weight: 670;

  text-overflow: ellipsis;

  white-space: nowrap;
}

.employee-secondary {
  margin-top: 2px;

  color: #a0a7b0;

  font-size: 0.61rem;
}

/* ==========================================================================
   DATE
============================================================================ */

.date-primary {
  color: #374151;

  font-size: 0.72rem;

  font-weight: 580;
}

.date-secondary {
  margin-top: 2px;

  color: #9ca3af;

  font-size: 0.61rem;
}

/* ==========================================================================
   PUNCH CELL
============================================================================ */

.punch-cell {
  display: flex;

  align-items: center;

  gap: 8px;
}

.punch-icon {
  width: 29px;

  height: 29px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-shrink: 0;

  border-radius: 8px;

  background: #f2f4f3;

  color: #8b949f;
}

.latest-punch-icon {
  background: #e8f8ed;

  color: #16a34a;
}

.last-punch-time {
  color: #374151;

  font-size: 0.72rem;

  font-weight: 650;

  white-space: nowrap;
}

.latest-indicator {
  display: flex;

  align-items: center;

  gap: 4px;

  margin-top: 2px;

  color: #16a34a;

  font-size: 0.56rem;

  font-weight: 650;

  text-transform: uppercase;
}

.latest-indicator-dot {
  width: 5px;

  height: 5px;

  border-radius: 50%;

  background: #22c55e;

  animation: status-pulse 2s infinite;
}

/* ==========================================================================
   STATUS
============================================================================ */

.status-chip {
  font-size: 0.59rem;

  font-weight: 620;
}

/* ==========================================================================
   TIME
============================================================================ */

.time-cell {
  display: inline-flex;

  align-items: center;

  gap: 5px;

  color: #374151;

  font-size: 0.7rem;

  font-weight: 610;

  white-space: nowrap;
}

.empty-value {
  color: #c4c9cf;
}

/* ==========================================================================
   CURRENTLY IN
============================================================================ */

.currently-in-chip {
  font-size: 0.58rem;
}

.current-status-dot {
  width: 6px;

  height: 6px;

  margin-right: 6px;

  border-radius: 50%;

  background: #22c55e;

  animation: status-pulse 2s infinite;
}

/* ==========================================================================
   PUNCH COUNT
============================================================================ */

.punch-count {
  display: inline-flex;

  align-items: center;

  justify-content: center;

  gap: 5px;

  min-width: 43px;

  padding: 5px 7px;

  border: 1px solid #e5e7eb;

  border-radius: 8px;

  background: #fafafa;

  color: #667085;

  font-size: 0.67rem;

  font-weight: 650;
}

/* ==========================================================================
   HOURS
============================================================================ */

.hours-value {
  color: #374151;

  font-size: 0.73rem;

  font-weight: 700;
}

.hours-label {
  margin-left: 2px;

  color: #9ca3af;

  font-size: 0.59rem;

  font-weight: 500;
}

/* ==========================================================================
   EMPTY
============================================================================ */

.empty-state {
  padding: 65px 20px;

  text-align: center;
}

.empty-icon {
  width: 62px;

  height: 62px;

  display: flex;

  align-items: center;

  justify-content: center;

  margin: 0 auto 14px;

  border-radius: 50%;

  background: #f2f6f3;

  color: #a0aaa3;
}

.empty-title {
  color: #374151;

  font-size: 0.91rem;

  font-weight: 700;
}

.empty-description {
  margin-top: 4px;

  color: #9ca3af;

  font-size: 0.71rem;
}

/* ==========================================================================
   TABLE FOOTER
============================================================================ */

.table-footer {
  display: flex;

  align-items: center;

  justify-content: space-between;

  min-height: 57px;

  padding-left: 19px;

  border-top: 1px solid #edf0ee;

  background: #ffffff;
}

.table-footer-status {
  display: flex;

  align-items: center;

  gap: 7px;

  color: #98a1ab;

  font-size: 0.64rem;
}

.footer-live-dot {
  width: 6px;

  height: 6px;

  border-radius: 50%;

  background: #cbd0d5;
}

.footer-live-active {
  background: #22c55e;

  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.1);
}

/* ==========================================================================
   ANIMATIONS
============================================================================ */

@keyframes status-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.45;
  }
}

@keyframes fingerprint-scan {
  0% {
    top: 10px;

    opacity: 0;
  }

  20% {
    opacity: 1;
  }

  50% {
    top: 24px;

    opacity: 1;
  }

  80% {
    opacity: 1;
  }

  100% {
    top: 38px;

    opacity: 0;
  }
}

/* ==========================================================================
   TABLET
============================================================================ */

@media (max-width: 1200px) {
  .hero-grid {
    grid-template-columns:
      1fr
      340px;
  }

  .hero-title {
    font-size: 2.25rem;
  }
}

@media (max-width: 960px) {
  .attendance-dashboard {
    padding: 16px;
  }

  .dashboard-header {
    align-items: flex-start;

    flex-direction: column;

    margin-bottom: 18px;
  }

  .hero-grid {
    grid-template-columns: 1fr;

    padding: 25px;
  }

  .hero-main {
    min-height: auto;
  }

  .latest-punch-panel {
    width: 100%;
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

  .filter-bar {
    align-items: flex-start;

    flex-direction: column;
  }

  .filter-summary {
    width: 100%;

    justify-content: flex-end;
  }

  .table-footer {
    align-items: stretch;

    flex-direction: column;

    gap: 7px;

    padding: 12px;
  }

  :deep(.attendance-table .v-table__wrapper) {
    overflow-x: auto;
  }
}

/* ==========================================================================
   MOBILE
============================================================================ */

@media (max-width: 600px) {
  .attendance-dashboard {
    padding: 10px;
  }

  .header-icon {
    width: 40px;

    height: 40px;
  }

  .page-title {
    font-size: 1.2rem;
  }

  .page-subtitle {
    max-width: 280px;

    font-size: 0.72rem;
  }

  .header-actions {
    width: 100%;
  }

  .connection-pill,
  .updated-pill {
    font-size: 0.61rem;
  }

  .hero-grid {
    padding: 21px;
  }

  .hero-title {
    font-size: 1.85rem;
  }

  .hero-description {
    font-size: 0.74rem;
  }

  .hero-meta {
    gap: 12px;
  }

  .hero-meta-divider {
    display: none;
  }

  .hero-meta-item {
    width: calc(50% - 6px);
  }

  .latest-person {
    flex-wrap: wrap;
  }

  .latest-status-chip {
    margin-left: 56px;
  }

  .latest-time-value {
    font-size: 1.35rem;
  }

  .toolbar-actions {
    flex-direction: column;

    align-items: stretch;
  }

  .search-field {
    width: 100%;
  }

  .filter-left {
    width: 100%;

    align-items: flex-start;

    flex-direction: column;
  }

  .filter-toggle {
    width: 100%;
  }

  :deep(.filter-toggle .v-btn) {
    flex: 1;

    padding-inline: 6px;
  }
}

/* ==========================================================================
   REDUCED MOTION
============================================================================ */

@media (prefers-reduced-motion: reduce) {
  .dot-online,
  .hero-live-dot,
  .mini-live-dot,
  .latest-indicator-dot,
  .current-status-dot,
  .scanner-line {
    animation: none;
  }

  .stat-card {
    transition: none;
  }
}
</style>
