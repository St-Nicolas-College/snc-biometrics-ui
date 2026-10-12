<template>
  <div class="user-profile-page">
    <!-- =========================================================
         PAGE HEADER
    ========================================================== -->
    <div class="page-header mb-6">
      <div class="d-flex align-center ga-3">
        <v-btn icon variant="tonal" size="small" to="/users">
          <v-icon> mdi-arrow-left </v-icon>

          <v-tooltip activator="parent" location="bottom">
            Back to Users
          </v-tooltip>
        </v-btn>

        <div>
          <div class="d-flex align-center ga-2 mb-1">
            <v-icon color="primary" size="28">
              mdi-account-circle-outline
            </v-icon>

            <h1 class="page-title">User Profile</h1>
          </div>

          <p class="page-subtitle">
            Manage user information, weekly schedule and attendance history.
          </p>
        </div>
      </div>

      <v-btn
        color="primary"
        variant="tonal"
        prepend-icon="mdi-refresh"
        :loading="refreshing"
        @click="refreshAll"
      >
        Refresh
      </v-btn>
    </div>

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
         PROFILE CARD
    ========================================================== -->
    <v-card elevation="0" class="profile-card mb-5">
      <v-skeleton-loader v-if="loadingUser" type="article" />

      <template v-else>
        <div class="profile-content">
          <!-- User Identity -->
          <div class="profile-identity">
            <v-avatar size="76" color="green-lighten-5" class="profile-avatar">
              <span class="profile-initials">
                {{ getInitials(userDetails?.name) }}
              </span>
            </v-avatar>

            <div class="profile-main">
              <div class="profile-name">
                {{ userDetails?.name || "Unknown User" }}
              </div>

              <div class="profile-meta">
                <v-chip size="small" variant="tonal" color="primary">
                  <v-icon start size="14"> mdi-identifier </v-icon>

                  User ID {{ userDetails?.user_id || "—" }}
                </v-chip>

                <v-chip
                  size="small"
                  variant="tonal"
                  :color="getRoleColor(userDetails?.role)"
                >
                  <v-icon start size="14">
                    {{
                      String(userDetails?.role) === "14"
                        ? "mdi-shield-account-outline"
                        : "mdi-account-outline"
                    }}
                  </v-icon>

                  {{ formatRole(userDetails?.role) }}
                </v-chip>
              </div>
            </div>

            <v-btn
              color="primary"
              variant="tonal"
              prepend-icon="mdi-pencil-outline"
              class="edit-profile-button"
              @click="showEditUserDialog"
            >
              Edit Profile
            </v-btn>
          </div>

          <v-divider class="my-5" />

          <!-- Information -->
          <v-row>
            <v-col cols="12" sm="6" md="3">
              <div class="info-block">
                <div class="info-icon">
                  <v-icon size="18"> mdi-card-account-details-outline </v-icon>
                </div>

                <div>
                  <div class="info-label">Card Number</div>

                  <div class="info-value">
                    {{
                      hasCard(userDetails?.card_no)
                        ? userDetails?.card_no
                        : "Not assigned"
                    }}
                  </div>
                </div>
              </div>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <div class="info-block">
                <div class="info-icon">
                  <v-icon size="18"> mdi-office-building-outline </v-icon>
                </div>

                <div>
                  <div class="info-label">Department</div>

                  <div class="info-value">
                    {{ userDetails?.department || "Not assigned" }}
                  </div>
                </div>
              </div>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <div class="info-block">
                <div class="info-icon">
                  <v-icon size="18"> mdi-calendar-clock-outline </v-icon>
                </div>

                <div>
                  <div class="info-label">Assigned Shifts</div>

                  <div class="info-value">
                    {{ shiftList.length }}
                  </div>
                </div>
              </div>
            </v-col>

            <v-col cols="12" sm="6" md="3">
              <div class="info-block">
                <div class="info-icon">
                  <v-icon size="18"> mdi-calendar-check-outline </v-icon>
                </div>

                <div>
                  <div class="info-label">Attendance Records</div>

                  <div class="info-value">
                    {{ userAttendanceLogs.length }}
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </div>
      </template>
    </v-card>

    <!-- =========================================================
         SHIFT MANAGEMENT
    ========================================================== -->
    <v-row class="mb-5">
      <!-- =======================================================
           SHIFT FORM
      ======================================================== -->
      <v-col cols="12" lg="4">
        <v-card elevation="0" class="content-card fill-height">
          <div class="card-header">
            <div>
              <div class="section-title">
                {{ isUpdate ? "Edit Shift" : "Assign Shift" }}
              </div>

              <div class="section-subtitle">
                Configure the user's weekly work schedule.
              </div>
            </div>

            <div class="card-header-icon">
              <v-icon> mdi-calendar-edit-outline </v-icon>
            </div>
          </div>

          <v-divider />

          <v-card-text class="pa-5">
            <v-form ref="createShiftForm" v-model="shiftValid" lazy-validation>
              <!-- Day -->
              <div class="field-label">Day</div>

              <v-select
                v-model="shiftName"
                :items="weekdays"
                :rules="rules.shiftName"
                placeholder="Select day"
                prepend-inner-icon="mdi-calendar-outline"
                variant="outlined"
                density="comfortable"
                class="mb-4"
              />

              <!-- =====================================================
     SHIFT START
====================================================== -->
              <div class="field-label">Shift Start</div>

              <v-menu
                v-model="menuIn"
                :close-on-content-click="false"
                location="bottom"
                transition="scale-transition"
              >
                <template #activator="{ props }">
                  <v-text-field
                    v-model="timeIn"
                    v-bind="props"
                    :rules="rules.timeIn"
                    placeholder="Select start time"
                    prepend-inner-icon="mdi-clock-time-four-outline"
                    append-inner-icon="mdi-chevron-down"
                    readonly
                    variant="outlined"
                    density="comfortable"
                    class="mb-4"
                  />
                </template>

                <v-time-picker
                  v-model="timeIn"
                  format="24hr"
                  use-seconds
                  title="Select Shift Start"
                />
              </v-menu>

              <!-- =====================================================
     SHIFT END
====================================================== -->
              <div class="field-label">Shift End</div>

              <v-menu
                v-model="menuOut"
                :close-on-content-click="false"
                location="bottom"
                transition="scale-transition"
              >
                <template #activator="{ props }">
                  <v-text-field
                    v-model="timeOut"
                    v-bind="props"
                    :rules="rules.timeOut"
                    placeholder="Select end time"
                    prepend-inner-icon="mdi-clock-time-four-outline"
                    append-inner-icon="mdi-chevron-down"
                    readonly
                    variant="outlined"
                    density="comfortable"
                    class="mb-4"
                  />
                </template>

                <v-time-picker
                  v-model="timeOut"
                  format="24hr"
                  use-seconds
                  title="Select Shift End"
                />
              </v-menu>

              <!-- Grace Period -->
              <div class="field-label">Grace Period</div>

              <v-text-field
                v-model.number="gracePeriod"
                type="number"
                min="0"
                :rules="rules.gracePeriod"
                suffix="minutes"
                prepend-inner-icon="mdi-timer-outline"
                variant="outlined"
                density="comfortable"
              />

              <!-- Actions -->
              <div v-if="!isUpdate" class="mt-4">
                <v-btn
                  block
                  color="primary"
                  variant="flat"
                  prepend-icon="mdi-content-save-outline"
                  :loading="savingShift"
                  @click="addShift"
                >
                  Save Shift
                </v-btn>
              </div>

              <div v-else class="shift-form-actions mt-4">
                <v-btn
                  color="primary"
                  variant="flat"
                  prepend-icon="mdi-content-save-outline"
                  :loading="savingShift"
                  @click="updateShift"
                >
                  Update
                </v-btn>

                <v-btn
                  color="grey-darken-1"
                  variant="outlined"
                  prepend-icon="mdi-close"
                  :disabled="savingShift"
                  @click="cancelShift"
                >
                  Cancel
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- =======================================================
           WEEKLY SCHEDULE
      ======================================================== -->
      <v-col cols="12" lg="8">
        <v-card elevation="0" class="content-card fill-height">
          <div class="card-header">
            <div>
              <div class="section-title">Weekly Schedule</div>

              <div class="section-subtitle">
                Assigned shift schedule for this user.
              </div>
            </div>

            <v-chip size="small" variant="tonal" color="primary">
              {{ shiftList.length }}
              {{ shiftList.length === 1 ? "Shift" : "Shifts" }}
            </v-chip>
          </div>

          <v-divider />

          <v-data-table
            :headers="shiftHeaders"
            :items="shiftList"
            :loading="loadingShifts"
            density="comfortable"
            :items-per-page="10"
            class="compact-table"
          >
            <!-- Day -->
            <template #[`item.shift_name`]="{ item }">
              <v-chip size="small" variant="tonal" color="blue-grey">
                <v-icon start size="14"> mdi-calendar-outline </v-icon>

                {{ item.shift_name }}
              </v-chip>
            </template>

            <!-- Schedule -->
            <template #[`item.schedule`]="{ item }">
              <div class="schedule-value">
                <v-icon size="15" class="me-1"> mdi-clock-outline </v-icon>

                {{ formatShiftTime(item.shift_start) }}

                <span class="schedule-divider"> – </span>

                {{ formatShiftTime(item.shift_end) }}
              </div>
            </template>

            <!-- Grace -->
            <template #[`item.grace_period_minutes`]="{ item }">
              <v-chip size="small" variant="outlined" color="grey-darken-1">
                {{ item.grace_period_minutes ?? 0 }} min
              </v-chip>
            </template>

            <!-- Action -->
            <template #[`item.actions`]="{ item }">
              <v-btn
                icon
                size="small"
                variant="text"
                color="primary"
                @click="editShift(item)"
              >
                <v-icon size="18"> mdi-pencil-outline </v-icon>

                <v-tooltip activator="parent" location="bottom">
                  Edit Shift
                </v-tooltip>
              </v-btn>
            </template>

            <!-- Empty -->
            <template #no-data>
              <div class="empty-state small-empty">
                <div class="empty-icon">
                  <v-icon size="32"> mdi-calendar-blank-outline </v-icon>
                </div>

                <div class="empty-title">No shift assigned</div>

                <div class="empty-description">
                  Use the form to assign a weekly shift.
                </div>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- =========================================================
         ATTENDANCE HISTORY
    ========================================================== -->
    <v-card elevation="0" class="content-card">
      <div class="card-header">
        <div>
          <div class="section-title">Attendance History</div>

          <div class="section-subtitle">
            Attendance records for
            {{ userDetails?.name || "this user" }}.
          </div>
        </div>

        <div class="d-flex align-center ga-2">
          <v-chip size="small" variant="tonal" color="success">
            <v-icon start size="14"> mdi-calendar-check-outline </v-icon>

            {{ userAttendanceLogs.length }} Records
          </v-chip>

          <v-chip
            v-if="lateRecordCount > 0"
            size="small"
            variant="tonal"
            color="error"
          >
            {{ lateRecordCount }} Late
          </v-chip>
        </div>
      </div>

      <v-divider />

      <v-data-table
        :headers="attendanceHeaders"
        :items="userAttendanceLogs"
        :loading="loadingAttendance"
        :sort-by="attendanceSort"
        density="comfortable"
        :items-per-page="15"
        class="attendance-history-table"
      >
        <template #loading>
          <v-skeleton-loader type="table-row@10" />
        </template>

        <!-- Date -->
        <template #[`item.log_date`]="{ item }">
          <div>
            <div class="date-primary">
              {{ formatDate(item.log_date) }}
            </div>

            <div class="date-secondary">
              {{ getDayName(item.log_date) }}
            </div>
          </div>
        </template>

        <!-- Schedule -->
        <template #[`item.schedule`]="{ item }">
          <div v-if="item.shift_start || item.shift_end" class="schedule-value">
            <v-icon size="15" class="me-1"> mdi-clock-outline </v-icon>

            {{ formatShiftTime(item.shift_start) }}

            <span class="schedule-divider"> – </span>

            {{ formatShiftTime(item.shift_end) }}
          </div>

          <span v-else class="empty-value"> — </span>
        </template>

        <!-- Time In -->
        <template #[`item.in_time`]="{ item }">
          <div v-if="item.in_time" class="attendance-time time-in">
            <v-icon size="16" class="me-1"> mdi-login </v-icon>

            {{ formatTime(item.in_time) }}
          </div>

          <span v-else class="empty-value"> — </span>
        </template>

        <!-- Time Out -->
        <template #[`item.out_time`]="{ item }">
          <v-chip
            v-if="hasNoTimeOut(item)"
            size="small"
            variant="tonal"
            color="warning"
          >
            <v-icon start size="14"> mdi-clock-alert-outline </v-icon>

            No Time Out
          </v-chip>

          <div v-else class="attendance-time time-out">
            <v-icon size="16" class="me-1"> mdi-logout </v-icon>

            {{ formatTime(item.out_time) }}
          </div>
        </template>

        <!-- Lateness -->
        <template #[`item.late_status`]="{ item }">
          <v-chip
            v-if="Number(item.late_minutes ?? 0) > 0"
            size="small"
            variant="tonal"
            color="error"
          >
            <v-icon start size="14"> mdi-clock-alert-outline </v-icon>

            {{ item.late_minutes }} min Late
          </v-chip>

          <v-chip
            v-else-if="item.late_status"
            size="small"
            variant="tonal"
            color="success"
          >
            <v-icon start size="14"> mdi-check-circle-outline </v-icon>

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
          >
            <v-icon start size="14">
              {{ getEarlyLeaveMeta(item.early_leave_status).icon }}
            </v-icon>

            {{ item.early_leave_status }}
          </v-chip>

          <span v-else class="empty-value"> — </span>
        </template>

        <!-- Total Hours -->
        <template #[`item.total_hours`]="{ item }">
          <div
            v-if="item.total_hours !== null && item.total_hours !== undefined"
            class="total-hours"
          >
            {{ item.total_hours }}

            <span> hrs </span>
          </div>

          <span v-else class="empty-value"> — </span>
        </template>

        <!-- Empty -->
        <template #no-data>
          <div class="empty-state">
            <div class="empty-icon">
              <v-icon size="34"> mdi-calendar-search-outline </v-icon>
            </div>

            <div class="empty-title">No attendance history</div>

            <div class="empty-description">
              Attendance records for this user will appear here.
            </div>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- =========================================================
         EDIT USER DIALOG
    ========================================================== -->
    <v-dialog v-model="editUserDialog" max-width="600" persistent>
      <v-card class="dialog-card">
        <div class="dialog-header">
          <div class="d-flex align-center ga-3">
            <div class="dialog-icon">
              <v-icon> mdi-account-edit-outline </v-icon>
            </div>

            <div>
              <div class="dialog-title">Edit User Profile</div>

              <div class="dialog-subtitle">
                Update the user's basic information.
              </div>
            </div>
          </div>

          <v-btn
            icon
            variant="text"
            size="small"
            :disabled="savingUser"
            @click="closeEditUserDialog"
          >
            <v-icon> mdi-close </v-icon>
          </v-btn>
        </div>

        <v-divider />

        <v-card-text class="pa-6">
          <v-form ref="editUserForm" v-model="editValid" lazy-validation>
            <!-- User ID -->
            <div class="field-label">User ID</div>

            <v-text-field
              v-model="editUserId"
              readonly
              prepend-inner-icon="mdi-identifier"
              variant="outlined"
              density="comfortable"
              class="mb-4"
            />

            <!-- Name -->
            <div class="field-label">Name</div>

            <v-text-field
              v-model="editName"
              placeholder="Enter employee name"
              prepend-inner-icon="mdi-account-outline"
              variant="outlined"
              density="comfortable"
              class="mb-4"
            />

            <!-- Department -->
            <div class="field-label">Department</div>

            <v-select
              v-model="selectedDepartment"
              :items="departmentList"
              item-title="dept_code"
              return-object
              placeholder="Select department"
              prepend-inner-icon="mdi-office-building-outline"
              variant="outlined"
              density="comfortable"
              :loading="loadingDepartments"
            />

            <div class="dialog-actions">
              <v-btn
                variant="outlined"
                color="grey-darken-1"
                :disabled="savingUser"
                @click="closeEditUserDialog"
              >
                Cancel
              </v-btn>

              <v-btn
                color="primary"
                variant="flat"
                prepend-icon="mdi-content-save-outline"
                :loading="savingUser"
                @click="updateUserDetails"
              >
                Save Changes
              </v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- =========================================================
         SNACKBAR
    ========================================================== -->
    <v-snackbar
      v-model="snackbar"
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
        <v-btn icon size="small" @click="snackbar = false">
          <v-icon> mdi-close </v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
//@ts-nocheck

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

interface UserDetails {
  user_id?: number;
  uid?: number;
  name?: string;
  department?: string | null;
  department_id?: number | null;
  department_docid?: string | null;
  card_no?: string | number | null;
  role?: string | number | null;
}

interface ShiftItem {
  id?: number;
  documentId?: string;

  user_id?: number;

  shift_name?: string;
  shift_start?: string;
  shift_end?: string;

  grace_period_minutes?: number;
  weekday?: number;
}

interface AttendanceLog {
  user_id?: number;

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

interface Department {
  id?: number;
  documentId?: string;

  dept_code: string;

  department_name?: string;
}

/*
|--------------------------------------------------------------------------
| Route
|--------------------------------------------------------------------------
*/

const route = useRoute();

const routeUserId = computed(() => String(route.params.id ?? ""));

/*
|--------------------------------------------------------------------------
| State
|--------------------------------------------------------------------------
*/

const loadingUser = ref(true);

const loadingShifts = ref(true);

const loadingAttendance = ref(true);

const loadingDepartments = ref(false);

const refreshing = ref(false);

const savingShift = ref(false);

const savingUser = ref(false);

const errorMessage = ref("");

/*
|--------------------------------------------------------------------------
| User
|--------------------------------------------------------------------------
*/

const userDetails = ref<UserDetails>({});

/*
|--------------------------------------------------------------------------
| Shifts
|--------------------------------------------------------------------------
*/

const shiftList = ref<ShiftItem[]>([]);

const createShiftForm = ref<any>(null);

const shiftValid = ref(false);

const isUpdate = ref(false);

const documentID = ref("");

const shiftName = ref<string | null>(null);

const timeIn = ref("");

const timeOut = ref("");

const menuIn = ref(false);

const menuOut = ref(false);

const gracePeriod = ref<number>(15);

const weekdays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/*
|--------------------------------------------------------------------------
| Attendance
|--------------------------------------------------------------------------
*/

const userAttendanceLogs = ref<AttendanceLog[]>([]);

/*
|--------------------------------------------------------------------------
| Edit User
|--------------------------------------------------------------------------
*/

const editUserDialog = ref(false);

const editUserForm = ref<any>(null);

const editValid = ref(false);

const editUserId = ref<number | null>(null);

const editName = ref("");

const selectedDepartment = ref<Department | null>(null);

const departmentList = ref<Department[]>([]);

/*
|--------------------------------------------------------------------------
| Snackbar
|--------------------------------------------------------------------------
*/

const snackbar = ref(false);

const snackbarText = ref("");

const snackbarColor = ref("success");

const snackbarIcon = ref("mdi-check-circle");

/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/

const rules = {
  shiftName: [(value: string | null) => !!value || "Day is required"],

  timeIn: [(value: string) => !!value || "Shift start is required"],

  timeOut: [(value: string) => !!value || "Shift end is required"],

  gracePeriod: [
    (value: number) =>
      (value !== null && value !== undefined && Number(value) >= 0) ||
      "Grace period is required",
  ],
};

/*
|--------------------------------------------------------------------------
| Shift Table
|--------------------------------------------------------------------------
*/

const shiftHeaders = [
  {
    title: "Day",
    key: "shift_name",
    sortable: true,
    width: 150,
  },

  {
    title: "Schedule",
    key: "schedule",
    sortable: false,
  },

  {
    title: "Grace Period",
    key: "grace_period_minutes",
    sortable: false,
    width: 150,
  },

  {
    title: "",
    key: "actions",
    sortable: false,
    align: "center" as const,
    width: 80,
  },
];

/*
|--------------------------------------------------------------------------
| Attendance Table
|--------------------------------------------------------------------------
*/

const attendanceHeaders = [
  {
    title: "Date",
    key: "log_date",
    sortable: true,
    width: 140,
  },

  {
    title: "Schedule",
    key: "schedule",
    sortable: false,
    width: 170,
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
    width: 120,
  },
];

const attendanceSort = ref([
  {
    key: "log_date",
    order: "desc" as const,
  },
]);

/*
|--------------------------------------------------------------------------
| Computed
|--------------------------------------------------------------------------
*/

const lateRecordCount = computed(
  () =>
    userAttendanceLogs.value.filter(
      (item) => Number(item.late_minutes ?? 0) > 0,
    ).length,
);

/*
|--------------------------------------------------------------------------
| Snackbar Helper
|--------------------------------------------------------------------------
*/

const showSnackbar = (
  message: string,
  color = "success",
  icon = "mdi-check-circle",
) => {
  snackbarText.value = message;

  snackbarColor.value = color;

  snackbarIcon.value = icon;

  snackbar.value = true;
};

/*
|--------------------------------------------------------------------------
| Load User
|--------------------------------------------------------------------------
*/

const initialize = async () => {
  loadingUser.value = true;

  try {
    const result = await $fetch<UserDetails[]>(
      `/api/user-accounts/${routeUserId.value}`,
    );

    const user = result?.[0];

    if (!user) {
      throw new Error("User not found.");
    }

    userDetails.value = user;

    errorMessage.value = "";
  } catch (error) {
    console.error("Failed to fetch user:", error);

    errorMessage.value = "Unable to load user details.";
  } finally {
    loadingUser.value = false;
  }
};

/*
|--------------------------------------------------------------------------
| Load Shifts
|--------------------------------------------------------------------------
*/

const getShift = async () => {
  loadingShifts.value = true;

  try {
    const result = await $fetch<ShiftItem[]>(
      `/api/shift-type/list/${routeUserId.value}`,
    );

    shiftList.value = result ?? [];
  } catch (error) {
    console.error("Failed to fetch shifts:", error);

    shiftList.value = [];
  } finally {
    loadingShifts.value = false;
  }
};

/*
|--------------------------------------------------------------------------
| Load Attendance
|--------------------------------------------------------------------------
*/

const getUserAttendanceLogs = async () => {
  loadingAttendance.value = true;

  try {
    const result = await $fetch<AttendanceLog[]>(
      `/api/attendance/user/${routeUserId.value}`,
    );

    userAttendanceLogs.value = result ?? [];
  } catch (error) {
    console.error("Failed to fetch attendance:", error);

    userAttendanceLogs.value = [];
  } finally {
    loadingAttendance.value = false;
  }
};

/*
|--------------------------------------------------------------------------
| Refresh Everything
|--------------------------------------------------------------------------
*/

const refreshAll = async () => {
  refreshing.value = true;

  try {
    await Promise.all([initialize(), getShift(), getUserAttendanceLogs()]);
  } finally {
    refreshing.value = false;
  }
};

/*
|--------------------------------------------------------------------------
| Weekday Number
|--------------------------------------------------------------------------
|
| PostgreSQL EXTRACT(DOW):
|
| Sunday    = 0
| Monday    = 1
| Tuesday   = 2
| Wednesday = 3
| Thursday  = 4
| Friday    = 5
| Saturday  = 6
|
*/

const getWeekdayNumber = (day?: string | null) => {
  const map: Record<string, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  if (!day) {
    return null;
  }

  return map[day] ?? null;
};

/*
|--------------------------------------------------------------------------
| Build Shift Payload
|--------------------------------------------------------------------------
*/

const buildShiftPayload = () => {
  return {
    user_id: userDetails.value.user_id,

    shift_name: shiftName.value,

    shift_start: timeIn.value,

    shift_end: timeOut.value,

    grace_period: Number(gracePeriod.value),

    weekday: getWeekdayNumber(shiftName.value),

    is_active: true,
  };
};

/*
|--------------------------------------------------------------------------
| Add Shift
|--------------------------------------------------------------------------
*/

const addShift = async () => {
  const validation = await createShiftForm.value?.validate();

  if (!validation?.valid) {
    return;
  }

  if (!userDetails.value.user_id) {
    showSnackbar(
      "Unable to determine the user ID.",
      "error",
      "mdi-alert-circle",
    );

    return;
  }

  savingShift.value = true;

  try {
    const response = await $fetch<any>("/api/shift-type/create", {
      method: "POST",
      body: buildShiftPayload(),
    });

    if (response?.status === "fail") {
      showSnackbar(
        response.message ?? "Unable to create shift.",
        "warning",
        "mdi-alert",
      );

      return;
    }

    showSnackbar("Shift created successfully.");

    resetShiftForm();

    await getShift();
  } catch (error) {
    console.error("Create shift error:", error);

    showSnackbar("Unable to create shift.", "error", "mdi-alert-circle");
  } finally {
    savingShift.value = false;
  }
};

/*
|--------------------------------------------------------------------------
| Edit Shift
|--------------------------------------------------------------------------
*/

const editShift = (item: ShiftItem) => {
  isUpdate.value = true;

  documentID.value = item.documentId ?? "";

  shiftName.value = item.shift_name ?? null;

  timeIn.value = item.shift_start ?? "";

  timeOut.value = item.shift_end ?? "";

  gracePeriod.value = Number(item.grace_period_minutes ?? 15);
};

/*
|--------------------------------------------------------------------------
| Update Shift
|--------------------------------------------------------------------------
*/

const updateShift = async () => {
  const validation = await createShiftForm.value?.validate();

  if (!validation?.valid) {
    return;
  }

  if (!documentID.value) {
    showSnackbar(
      "Unable to determine the shift record.",
      "error",
      "mdi-alert-circle",
    );

    return;
  }

  savingShift.value = true;

  try {
    const response = await $fetch<any>(
      `/api/shift-type/update/${documentID.value}`,
      {
        method: "PUT",
        body: buildShiftPayload(),
      },
    );

    if (response?.status === "fail") {
      showSnackbar(
        response.message ?? "Unable to update shift.",
        "warning",
        "mdi-alert",
      );

      return;
    }

    showSnackbar(`${shiftName.value} shift updated successfully.`);

    resetShiftForm();

    await getShift();
  } catch (error) {
    console.error("Update shift error:", error);

    showSnackbar("Unable to update shift.", "error", "mdi-alert-circle");
  } finally {
    savingShift.value = false;
  }
};

/*
|--------------------------------------------------------------------------
| Cancel / Reset Shift
|--------------------------------------------------------------------------
*/

const resetShiftForm = () => {
  isUpdate.value = false;

  documentID.value = "";

  shiftName.value = null;

  timeIn.value = "";

  timeOut.value = "";

  gracePeriod.value = 15;

  createShiftForm.value?.resetValidation();
};

const cancelShift = () => {
  resetShiftForm();
};

/*
|--------------------------------------------------------------------------
| Departments
|--------------------------------------------------------------------------
*/

const getDepartmentList = async () => {
  loadingDepartments.value = true;

  try {
    const result = await $fetch<Department[]>("/api/department/list");

    departmentList.value = result ?? [];
  } catch (error) {
    console.error("Failed to fetch departments:", error);

    departmentList.value = [];
  } finally {
    loadingDepartments.value = false;
  }
};

/*
|--------------------------------------------------------------------------
| Edit User Dialog
|--------------------------------------------------------------------------
*/

const showEditUserDialog = async () => {
  editUserDialog.value = true;

  editUserId.value = userDetails.value.user_id ?? null;

  editName.value = userDetails.value.name ?? "";

  await getDepartmentList();

  const currentDepartment = departmentList.value.find(
    (item) => item.dept_code === userDetails.value.department,
  );

  selectedDepartment.value = currentDepartment ?? null;
};

const closeEditUserDialog = () => {
  editUserDialog.value = false;

  selectedDepartment.value = null;
};

/*
|--------------------------------------------------------------------------
| Update User
|--------------------------------------------------------------------------
*/

const updateUserDetails = async () => {
  const validation = await editUserForm.value?.validate();

  if (validation && !validation.valid) {
    return;
  }

  if (!editUserId.value) {
    return;
  }

  savingUser.value = true;

  try {
    const selected = selectedDepartment.value;

    const payload = {
      user_id: editUserId.value,

      name: editName.value,

      department: selected?.dept_code ?? userDetails.value.department ?? null,

      department_docid:
        selected?.documentId ?? userDetails.value.department_docid ?? null,

      department_id: selected?.id ?? userDetails.value.department_id ?? null,
    };

    await $fetch(`/api/user-accounts/update/${editUserId.value}`, {
      method: "PUT",
      body: payload,
    });

    showSnackbar("User details updated successfully.");

    editUserDialog.value = false;

    await initialize();
  } catch (error) {
    console.error("Update user error:", error);

    showSnackbar("Unable to update user details.", "error", "mdi-alert-circle");
  } finally {
    savingUser.value = false;
  }
};

/*
|--------------------------------------------------------------------------
| Card Number
|--------------------------------------------------------------------------
*/

const hasCard = (card?: string | number | null) => {
  if (card === null || card === undefined) {
    return false;
  }

  const value = String(card).trim();

  return value !== "" && value !== "0";
};

/*
|--------------------------------------------------------------------------
| Role
|--------------------------------------------------------------------------
*/

const formatRole = (role?: string | number | null) => {
  if (role === null || role === undefined || String(role).trim() === "") {
    return "User";
  }

  const value = String(role).trim();

  if (value === "0") {
    return "User";
  }

  if (value === "14") {
    return "Administrator";
  }

  if (!/^\d+$/.test(value)) {
    return value
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  return `Role ${value}`;
};

const getRoleColor = (role?: string | number | null) => {
  const value = String(role ?? "")
    .trim()
    .toLowerCase();

  if (value === "14" || value.includes("admin")) {
    return "purple";
  }

  if (
    value === "0" ||
    value.includes("user") ||
    value.includes("employee") ||
    value.includes("staff")
  ) {
    return "success";
  }

  return "blue-grey";
};

/*
|--------------------------------------------------------------------------
| Initials
|--------------------------------------------------------------------------
*/

const getInitials = (name?: string | null) => {
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

/*
|--------------------------------------------------------------------------
| No Time Out
|--------------------------------------------------------------------------
*/

const hasNoTimeOut = (item: AttendanceLog) => {
  return !item.out_time || item.in_time === item.out_time;
};

/*
|--------------------------------------------------------------------------
| Date Parser
|--------------------------------------------------------------------------
*/

const parseDateValue = (value?: string) => {
  if (!value) {
    return null;
  }

  /*
   * Preserve date-only values as
   * local calendar dates.
   */
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

/*
|--------------------------------------------------------------------------
| Date
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Attendance Time
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Shift Time
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Early Leave
|--------------------------------------------------------------------------
*/

const getEarlyLeaveMeta = (status?: string) => {
  if (!status) {
    return {
      color: "grey",
      icon: "mdi-minus-circle-outline",
    };
  }

  const value = status.toUpperCase();

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

/*
|--------------------------------------------------------------------------
| Lifecycle
|--------------------------------------------------------------------------
*/

onMounted(async () => {
  await Promise.all([initialize(), getShift(), getUserAttendanceLogs()]);
});
</script>

<style scoped>
/* =========================================================
   PAGE
========================================================= */

.user-profile-page {
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
   CARDS
========================================================= */

.profile-card,
.content-card {
  overflow: hidden;

  border: 1px solid #e7e9ed;
  border-radius: 14px;

  background: #ffffff;
}

/* =========================================================
   PROFILE
========================================================= */

.profile-content {
  padding: 24px;
}

.profile-identity {
  display: flex;
  align-items: center;

  gap: 18px;
}

.profile-avatar {
  flex-shrink: 0;
}

.profile-initials {
  color: #15803d;

  font-size: 1.25rem;
  font-weight: 750;
}

.profile-main {
  flex: 1;

  min-width: 0;
}

.profile-name {
  overflow: hidden;

  color: #1f2937;

  font-size: 1.35rem;
  font-weight: 750;

  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-meta {
  display: flex;
  flex-wrap: wrap;

  gap: 7px;

  margin-top: 8px;
}

.edit-profile-button {
  flex-shrink: 0;

  text-transform: none;
}

/* =========================================================
   PROFILE INFORMATION
========================================================= */

.info-block {
  display: flex;
  align-items: center;

  gap: 11px;
}

.info-icon {
  width: 38px;
  height: 38px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border-radius: 10px;

  background: #f1f8f3;

  color: #15803d;
}

.info-label {
  color: #9ca3af;

  font-size: 0.7rem;
  font-weight: 600;

  text-transform: uppercase;
}

.info-value {
  margin-top: 2px;

  color: #374151;

  font-size: 0.85rem;
  font-weight: 650;
}

/* =========================================================
   CARD HEADER
========================================================= */

.card-header {
  min-height: 76px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 15px;

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

  font-size: 0.78rem;
}

.card-header-icon {
  width: 40px;
  height: 40px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 10px;

  background: #ecfdf5;

  color: #15803d;
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

.shift-form-actions {
  display: flex;

  gap: 10px;
}

.shift-form-actions .v-btn {
  flex: 1;
}

/* =========================================================
   TABLE
========================================================= */

:deep(.compact-table thead th),
:deep(.attendance-history-table thead th) {
  height: 50px !important;

  padding-left: 12px !important;
  padding-right: 12px !important;

  background: #fafafa !important;

  border-bottom: 1px solid #e5e7eb !important;

  color: #4b5563 !important;

  font-size: 0.71rem !important;
  font-weight: 700 !important;

  letter-spacing: 0.02em;

  text-transform: uppercase;

  white-space: nowrap;
}

:deep(.compact-table tbody td),
:deep(.attendance-history-table tbody td) {
  height: 60px !important;

  padding-left: 12px !important;
  padding-right: 12px !important;

  border-bottom: 1px solid #f0f1f3 !important;

  color: #374151;

  font-size: 0.81rem;
}

:deep(.compact-table tbody tr:hover),
:deep(.attendance-history-table tbody tr:hover) {
  background: #f8faf9 !important;
}

/* =========================================================
   SCHEDULE
========================================================= */

.schedule-value {
  display: flex;
  align-items: center;

  color: #4b5563;

  font-size: 0.8rem;
  font-weight: 600;

  white-space: nowrap;
}

.schedule-divider {
  margin: 0 5px;

  color: #9ca3af;
}

/* =========================================================
   ATTENDANCE
========================================================= */

.date-primary {
  color: #374151;

  font-weight: 650;
}

.date-secondary {
  margin-top: 2px;

  color: #9ca3af;

  font-size: 0.68rem;
}

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

.total-hours {
  color: #374151;

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
   EMPTY STATE
========================================================= */

.empty-state {
  padding: 55px 20px;

  text-align: center;
}

.small-empty {
  padding: 45px 20px;
}

.empty-icon {
  width: 64px;
  height: 64px;

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
  margin-top: 4px;

  color: #9ca3af;

  font-size: 0.78rem;
}

/* =========================================================
   DIALOG
========================================================= */

.dialog-card {
  border-radius: 14px !important;
}

.dialog-header {
  min-height: 78px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 16px 20px;
}

.dialog-icon {
  width: 42px;
  height: 42px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 11px;

  background: #ecfdf5;

  color: #15803d;
}

.dialog-title {
  color: #1f2937;

  font-size: 1rem;
  font-weight: 700;
}

.dialog-subtitle {
  margin-top: 2px;

  color: #9ca3af;

  font-size: 0.75rem;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;

  gap: 10px;

  margin-top: 20px;
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 960px) {
  .user-profile-page {
    padding: 16px;
  }

  .page-header {
    align-items: flex-start;
  }

  .profile-identity {
    align-items: flex-start;
  }

  :deep(.attendance-history-table .v-table__wrapper) {
    overflow-x: auto;
  }
}

@media (max-width: 600px) {
  .user-profile-page {
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

  .profile-identity {
    flex-direction: column;
  }

  .profile-name {
    white-space: normal;
  }

  .edit-profile-button {
    width: 100%;
  }

  .shift-form-actions,
  .dialog-actions {
    flex-direction: column;
  }

  .shift-form-actions .v-btn,
  .dialog-actions .v-btn {
    width: 100%;
  }
}
</style>
