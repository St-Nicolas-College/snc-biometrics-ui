<template>
  <div class="user-profile-page">
    <!-- =========================================================
         PAGE HEADER
    ========================================================== -->
    <div class="page-header">
      <div class="page-heading">
        <v-btn
          icon
          variant="tonal"
          size="small"
          color="primary"
          to="/users"
          class="back-button"
        >
          <v-icon> mdi-arrow-left </v-icon>

          <v-tooltip activator="parent" location="bottom">
            Back to Users
          </v-tooltip>
        </v-btn>

        <div class="page-heading-icon">
          <v-icon size="23"> mdi-account-circle-outline </v-icon>
        </div>

        <div>
          <h1 class="page-title">User Profile</h1>

          <p class="page-subtitle">
            Manage biometric information, work schedule and attendance history.
          </p>
        </div>
      </div>

      <div class="header-actions">
        <div v-if="lastUpdated" class="updated-status">
          <v-icon size="15"> mdi-clock-outline </v-icon>

          Updated
          {{ formatLastUpdated(lastUpdated) }}
        </div>

        <v-btn
          color="primary"
          variant="tonal"
          prepend-icon="mdi-refresh"
          :loading="refreshing"
          class="refresh-button"
          @click="refreshAll"
        >
          Refresh
        </v-btn>
      </div>
    </div>

    <!-- =========================================================
         ERROR
    ========================================================== -->
    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      density="comfortable"
      closable
      class="mb-5"
      @click:close="errorMessage = ''"
    >
      {{ errorMessage }}
    </v-alert>

    <!-- =========================================================
         PROFILE HERO
    ========================================================== -->
    <v-card elevation="0" class="profile-hero mb-5">
      <v-skeleton-loader v-if="loadingUser" type="article" />

      <template v-else>
        <div class="profile-decoration profile-decoration-one" />
        <div class="profile-decoration profile-decoration-two" />

        <div class="profile-hero-content">
          <!-- Identity -->
          <div class="profile-identity">
            <div class="profile-avatar">
              {{ getInitials(userDetails?.name) }}

              <div class="biometric-badge">
                <v-icon size="14"> mdi-fingerprint </v-icon>
              </div>
            </div>

            <div class="profile-main">
              <div class="profile-eyebrow">BIOMETRIC USER PROFILE</div>

              <div class="profile-name">
                {{ userDetails?.name || "Unknown User" }}
              </div>

              <div class="profile-meta">
                <div class="profile-meta-item">
                  <v-icon size="15"> mdi-identifier </v-icon>

                  User ID
                  {{ userDetails?.user_id || "—" }}
                </div>

                <div
                  v-if="
                    userDetails?.uid !== undefined && userDetails?.uid !== null
                  "
                  class="profile-meta-item"
                >
                  <v-icon size="15"> mdi-fingerprint </v-icon>

                  Device UID
                  {{ userDetails?.uid }}
                </div>

                <div class="profile-meta-item">
                  <v-icon size="15">
                    {{ getRoleIcon(userDetails?.role) }}
                  </v-icon>

                  {{ formatRole(userDetails?.role) }}
                </div>
              </div>
            </div>

            <v-btn
              color="white"
              variant="flat"
              prepend-icon="mdi-pencil-outline"
              class="edit-profile-button"
              @click="showEditUserDialog"
            >
              Edit Profile
            </v-btn>
          </div>

          <!-- Information -->
          <div class="profile-information">
            <!-- Card -->
            <div class="profile-info-item">
              <div class="profile-info-icon">
                <v-icon size="19"> mdi-card-account-details-outline </v-icon>
              </div>

              <div>
                <div class="profile-info-label">Card Number</div>

                <div class="profile-info-value">
                  {{
                    hasCard(userDetails?.card_no)
                      ? userDetails?.card_no
                      : "Not assigned"
                  }}
                </div>
              </div>

              <v-chip
                size="x-small"
                variant="flat"
                :color="hasCard(userDetails?.card_no) ? 'success' : 'warning'"
                class="info-status-chip"
              >
                {{ hasCard(userDetails?.card_no) ? "Assigned" : "Missing" }}
              </v-chip>
            </div>

            <!-- Department -->
            <div class="profile-info-item">
              <div class="profile-info-icon">
                <v-icon size="19"> mdi-office-building-outline </v-icon>
              </div>

              <div>
                <div class="profile-info-label">Department</div>

                <div class="profile-info-value">
                  {{ userDetails?.department || "Not assigned" }}
                </div>
              </div>
            </div>

            <!-- Shifts -->
            <div class="profile-info-item">
              <div class="profile-info-icon">
                <v-icon size="19"> mdi-calendar-clock-outline </v-icon>
              </div>

              <div>
                <div class="profile-info-label">Assigned Shifts</div>

                <div class="profile-info-value">
                  {{ shiftList.length }}
                  {{ shiftList.length === 1 ? "day" : "days" }}
                </div>
              </div>
            </div>

            <!-- Attendance -->
            <div class="profile-info-item">
              <div class="profile-info-icon">
                <v-icon size="19"> mdi-calendar-check-outline </v-icon>
              </div>

              <div>
                <div class="profile-info-label">Attendance Records</div>

                <div class="profile-info-value">
                  {{ userAttendanceLogs.length }}
                  records
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </v-card>

    <!-- =========================================================
         ATTENDANCE SUMMARY
    ========================================================== -->
    <v-row class="summary-row">
      <!-- Total -->
      <v-col cols="12" sm="6" lg="3">
        <v-card
          elevation="0"
          class="summary-card"
          :class="{
            'summary-card-selected': attendanceFilter === 'all',
          }"
          @click="attendanceFilter = 'all'"
        >
          <v-card-text class="summary-content">
            <div class="summary-top">
              <div class="summary-icon icon-records">
                <v-icon size="21"> mdi-calendar-check-outline </v-icon>
              </div>

              <span class="summary-tag"> TOTAL </span>
            </div>

            <div class="summary-value">
              {{ userAttendanceLogs.length }}
            </div>

            <div class="summary-label">Attendance Records</div>

            <div class="summary-description">Available employee records</div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- On Time -->
      <v-col cols="12" sm="6" lg="3">
        <v-card
          elevation="0"
          class="summary-card"
          :class="{
            'summary-card-selected': attendanceFilter === 'on-time',
          }"
          @click="attendanceFilter = 'on-time'"
        >
          <v-card-text class="summary-content">
            <div class="summary-top">
              <div class="summary-icon icon-on-time">
                <v-icon size="21"> mdi-check-circle-outline </v-icon>
              </div>

              <span class="summary-tag text-success"> ON TIME </span>
            </div>

            <div class="summary-value text-success">
              {{ onTimeRecordCount }}
            </div>

            <div class="summary-label">On Time</div>

            <div class="summary-description">Arrived within schedule</div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Late -->
      <v-col cols="12" sm="6" lg="3">
        <v-card
          elevation="0"
          class="summary-card"
          :class="{
            'summary-card-selected': attendanceFilter === 'late',
          }"
          @click="attendanceFilter = 'late'"
        >
          <v-card-text class="summary-content">
            <div class="summary-top">
              <div class="summary-icon icon-late">
                <v-icon size="21"> mdi-clock-alert-outline </v-icon>
              </div>

              <span class="summary-tag text-error"> LATE </span>
            </div>

            <div class="summary-value text-error">
              {{ lateRecordCount }}
            </div>

            <div class="summary-label">Late Records</div>

            <div class="summary-description">Attendance with lateness</div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- No Time Out -->
      <v-col cols="12" sm="6" lg="3">
        <v-card
          elevation="0"
          class="summary-card"
          :class="{
            'summary-card-selected': attendanceFilter === 'incomplete',
          }"
          @click="attendanceFilter = 'incomplete'"
        >
          <v-card-text class="summary-content">
            <div class="summary-top">
              <div class="summary-icon icon-incomplete">
                <v-icon size="21"> mdi-clock-alert-outline </v-icon>
              </div>

              <span class="summary-tag text-warning"> REVIEW </span>
            </div>

            <div class="summary-value text-warning">
              {{ noTimeOutRecordCount }}
            </div>

            <div class="summary-label">No Time Out</div>

            <div class="summary-description">Records requiring review</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- =========================================================
         SHIFT MANAGEMENT
    ========================================================== -->
    <v-row class="schedule-section">
      <!-- =======================================================
           SHIFT FORM
      ======================================================== -->
      <v-col cols="12" lg="4">
        <v-card elevation="0" class="content-card shift-form-card fill-height">
          <div class="card-header">
            <div class="card-heading">
              <div class="card-heading-icon">
                <v-icon size="20">
                  {{
                    isUpdate
                      ? "mdi-calendar-edit-outline"
                      : "mdi-calendar-plus-outline"
                  }}
                </v-icon>
              </div>

              <div>
                <div class="section-title">
                  {{ isUpdate ? "Edit Shift" : "Assign Shift" }}
                </div>

                <div class="section-subtitle">
                  Configure the weekly work schedule.
                </div>
              </div>
            </div>

            <v-chip
              v-if="isUpdate"
              size="small"
              variant="tonal"
              color="warning"
            >
              Editing
            </v-chip>
          </div>

          <v-divider />

          <v-card-text class="shift-form-content">
            <v-form ref="createShiftForm" v-model="shiftValid" lazy-validation>
              <!-- Day -->
              <div class="field-group">
                <div class="field-label">Day</div>

                <v-select
                  v-model="shiftName"
                  :items="weekdays"
                  :rules="rules.shiftName"
                  placeholder="Select working day"
                  prepend-inner-icon="mdi-calendar-outline"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                  class="form-input"
                />
              </div>

              <!-- Start -->
              <div class="field-group">
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
                      prepend-inner-icon="mdi-clock-start"
                      append-inner-icon="mdi-chevron-down"
                      readonly
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                      class="form-input"
                    />
                  </template>

                  <v-card elevation="8" class="time-picker-card">
                    <v-time-picker
                      v-model="timeIn"
                      format="24hr"
                      use-seconds
                      title="Select Shift Start"
                    />

                    <div class="time-picker-actions">
                      <v-btn
                        variant="text"
                        color="primary"
                        @click="menuIn = false"
                      >
                        Done
                      </v-btn>
                    </div>
                  </v-card>
                </v-menu>
              </div>

              <!-- End -->
              <div class="field-group">
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
                      prepend-inner-icon="mdi-clock-end"
                      append-inner-icon="mdi-chevron-down"
                      readonly
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                      class="form-input"
                    />
                  </template>

                  <v-card elevation="8" class="time-picker-card">
                    <v-time-picker
                      v-model="timeOut"
                      format="24hr"
                      use-seconds
                      title="Select Shift End"
                    />

                    <div class="time-picker-actions">
                      <v-btn
                        variant="text"
                        color="primary"
                        @click="menuOut = false"
                      >
                        Done
                      </v-btn>
                    </div>
                  </v-card>
                </v-menu>
              </div>

              <!-- Grace -->
              <div class="field-group">
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
                  hide-details="auto"
                  class="form-input"
                />
              </div>

              <!-- Form Preview -->
              <div v-if="shiftName || timeIn || timeOut" class="shift-preview">
                <div class="shift-preview-label">Schedule Preview</div>

                <div class="shift-preview-row">
                  <v-icon size="17"> mdi-calendar-clock-outline </v-icon>

                  <div>
                    <div class="shift-preview-day">
                      {{ shiftName || "Select day" }}
                    </div>

                    <div class="shift-preview-time">
                      {{ formatShiftTime(timeIn) }}
                      –
                      {{ formatShiftTime(timeOut) }}
                    </div>
                  </div>
                </div>

                <div class="shift-preview-grace">
                  <v-icon size="14"> mdi-timer-outline </v-icon>

                  {{ gracePeriod || 0 }} minute grace period
                </div>
              </div>

              <!-- Actions -->
              <div v-if="!isUpdate" class="shift-actions">
                <v-btn
                  block
                  color="primary"
                  variant="flat"
                  prepend-icon="mdi-content-save-outline"
                  :loading="savingShift"
                  class="primary-action"
                  @click="addShift"
                >
                  Save Shift
                </v-btn>
              </div>

              <div v-else class="shift-form-actions">
                <v-btn
                  color="primary"
                  variant="flat"
                  prepend-icon="mdi-content-save-outline"
                  :loading="savingShift"
                  @click="updateShift"
                >
                  Update Shift
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
            <div class="card-heading">
              <div class="card-heading-icon">
                <v-icon size="20"> mdi-calendar-week-outline </v-icon>
              </div>

              <div>
                <div class="section-title">Weekly Schedule</div>

                <div class="section-subtitle">
                  Assigned work schedule for this biometric user.
                </div>
              </div>
            </div>

            <v-chip size="small" variant="tonal" color="primary">
              <v-icon start size="14"> mdi-calendar-check-outline </v-icon>

              {{ shiftList.length }}
              {{ shiftList.length === 1 ? "Shift" : "Shifts" }}
            </v-chip>
          </div>

          <v-divider />

          <!-- Weekly Visual -->
          <div
            v-if="!loadingShifts && shiftList.length"
            class="weekly-overview"
          >
            <div
              v-for="day in weekdays"
              :key="day"
              class="weekday-card"
              :class="{
                'weekday-active': getShiftForDay(day),
              }"
            >
              <div class="weekday-name">
                {{ shortDay(day) }}
              </div>

              <template v-if="getShiftForDay(day)">
                <div class="weekday-status-dot" />

                <div class="weekday-time">
                  {{ formatShiftTime(getShiftForDay(day)?.shift_start) }}
                </div>

                <div class="weekday-time-end">
                  {{ formatShiftTime(getShiftForDay(day)?.shift_end) }}
                </div>
              </template>

              <template v-else>
                <div class="weekday-off-icon">
                  <v-icon size="15"> mdi-minus </v-icon>
                </div>

                <div class="weekday-off">Off</div>
              </template>
            </div>
          </div>

          <v-divider v-if="!loadingShifts && shiftList.length" />

          <v-data-table
            :headers="shiftHeaders"
            :items="sortedShiftList"
            :loading="loadingShifts"
            density="comfortable"
            :items-per-page="-1"
            hide-default-footer
            class="compact-table"
          >
            <!-- Day -->
            <template #[`item.shift_name`]="{ item }">
              <div class="shift-day-cell">
                <div class="shift-day-icon">
                  {{ shortDay(item.shift_name) }}
                </div>

                <div>
                  <div class="shift-day-name">
                    {{ item.shift_name }}
                  </div>

                  <div class="shift-day-subtitle">Working day</div>
                </div>
              </div>
            </template>

            <!-- Schedule -->
            <template #[`item.schedule`]="{ item }">
              <div class="schedule-cell">
                <div class="schedule-time-icon">
                  <v-icon size="15"> mdi-clock-outline </v-icon>
                </div>

                <div>
                  <div class="schedule-primary">
                    {{ formatShiftTime(item.shift_start) }}
                    –
                    {{ formatShiftTime(item.shift_end) }}
                  </div>

                  <div class="schedule-secondary">
                    {{ calculateShiftDuration(item) }}
                  </div>
                </div>
              </div>
            </template>

            <!-- Grace -->
            <template #[`item.grace_period_minutes`]="{ item }">
              <v-chip
                size="small"
                variant="tonal"
                color="blue-grey"
                class="small-chip"
              >
                <v-icon start size="13"> mdi-timer-outline </v-icon>

                {{ item.grace_period_minutes ?? 0 }}
                min
              </v-chip>
            </template>

            <!-- Action -->
            <template #[`item.actions`]="{ item }">
              <v-btn
                icon
                size="small"
                variant="tonal"
                color="primary"
                @click="editShift(item)"
              >
                <v-icon size="17"> mdi-pencil-outline </v-icon>

                <v-tooltip activator="parent" location="bottom">
                  Edit {{ item.shift_name }} Shift
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
                  Use the form to assign this employee's weekly schedule.
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
    <v-card elevation="0" class="content-card attendance-card">
      <div class="attendance-header">
        <div class="card-heading">
          <div class="card-heading-icon">
            <v-icon size="20"> mdi-history </v-icon>
          </div>

          <div>
            <div class="section-title">Attendance History</div>

            <div class="section-subtitle">
              Attendance records for
              {{ userDetails?.name || "this user" }}.
            </div>
          </div>
        </div>

        <div class="attendance-toolbar">
          <v-select
            v-model="attendanceFilter"
            :items="attendanceFilterOptions"
            item-title="title"
            item-value="value"
            density="compact"
            variant="outlined"
            hide-details
            prepend-inner-icon="mdi-filter-outline"
            class="attendance-filter"
          />
        </div>
      </div>

      <!-- Attendance Status Bar -->
      <div class="attendance-results-bar">
        <div>
          Showing

          <strong>
            {{ filteredAttendanceLogs.length }}
          </strong>

          of

          <strong>
            {{ userAttendanceLogs.length }}
          </strong>

          records
        </div>

        <div class="attendance-result-badges">
          <span class="result-badge result-good">
            <span />
            {{ onTimeRecordCount }} On Time
          </span>

          <span class="result-badge result-late">
            <span />
            {{ lateRecordCount }} Late
          </span>

          <span class="result-badge result-warning">
            <span />
            {{ noTimeOutRecordCount }} Incomplete
          </span>
        </div>
      </div>

      <v-divider />

      <v-data-table
        :headers="attendanceHeaders"
        :items="filteredAttendanceLogs"
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
          <div class="date-cell">
            <div class="date-calendar-icon">
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
          <div
            v-if="item.shift_start || item.shift_end"
            class="history-schedule"
          >
            <v-icon size="15"> mdi-clock-outline </v-icon>

            <span>
              {{ formatShiftTime(item.shift_start) }}
              –
              {{ formatShiftTime(item.shift_end) }}
            </span>
          </div>

          <span v-else class="empty-value"> — </span>
        </template>

        <!-- Time In -->
        <template #[`item.in_time`]="{ item }">
          <div v-if="item.in_time" class="attendance-time">
            <div class="attendance-time-icon time-in-icon">
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
            variant="tonal"
            color="warning"
            class="small-chip"
          >
            <v-icon start size="13"> mdi-clock-alert-outline </v-icon>

            No Time Out
          </v-chip>

          <div v-else class="attendance-time">
            <div class="attendance-time-icon time-out-icon">
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
            variant="tonal"
            color="error"
            class="small-chip"
          >
            <v-icon start size="13"> mdi-clock-alert-outline </v-icon>

            {{ item.late_minutes }} min
          </v-chip>

          <v-chip
            v-else-if="item.late_status"
            size="small"
            variant="tonal"
            color="success"
            class="small-chip"
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
            class="small-chip"
          >
            <v-icon start size="13">
              {{ getEarlyLeaveMeta(item.early_leave_status).icon }}
            </v-icon>

            {{ getEarlyLeaveDisplay(item.early_leave_status) }}
          </v-chip>

          <span v-else class="empty-value"> — </span>
        </template>

        <!-- Hours -->
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

            <div class="empty-title">No attendance records found</div>

            <div class="empty-description">
              Try selecting another attendance status.
            </div>

            <v-btn
              v-if="attendanceFilter !== 'all'"
              variant="tonal"
              color="primary"
              size="small"
              prepend-icon="mdi-filter-remove-outline"
              class="mt-4"
              @click="attendanceFilter = 'all'"
            >
              Show All Records
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- =========================================================
         EDIT USER DIALOG
    ========================================================== -->
    <v-dialog v-model="editUserDialog" max-width="620" persistent>
      <v-card class="dialog-card">
        <div class="dialog-hero">
          <div class="dialog-avatar">
            {{ getInitials(editName) }}
          </div>

          <div class="dialog-user-info">
            <div class="dialog-eyebrow">BIOMETRIC USER</div>

            <div class="dialog-title">Edit User Profile</div>

            <div class="dialog-subtitle">
              Update employee information and department assignment.
            </div>
          </div>

          <v-btn
            icon
            variant="text"
            color="white"
            size="small"
            :disabled="savingUser"
            @click="closeEditUserDialog"
          >
            <v-icon> mdi-close </v-icon>
          </v-btn>
        </div>

        <v-card-text class="dialog-content">
          <v-form ref="editUserForm" v-model="editValid" lazy-validation>
            <!-- ID -->
            <div class="field-group">
              <div class="field-label">User ID</div>

              <v-text-field
                v-model="editUserId"
                readonly
                prepend-inner-icon="mdi-identifier"
                variant="outlined"
                density="comfortable"
                hide-details
                class="form-input readonly-input"
              />
            </div>

            <!-- Name -->
            <div class="field-group">
              <div class="field-label">Employee Name</div>

              <v-text-field
                v-model="editName"
                placeholder="Enter employee name"
                prepend-inner-icon="mdi-account-outline"
                variant="outlined"
                density="comfortable"
                hide-details
                class="form-input"
              />
            </div>

            <!-- Department -->
            <div class="field-group">
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
                hide-details
                :loading="loadingDepartments"
                class="form-input"
              >
                <template #item="{ props, item }">
                  <v-list-item
                    v-bind="props"
                    :title="item.raw.dept_code"
                    :subtitle="item.raw.department_name || 'Department'"
                  />
                </template>
              </v-select>
            </div>

            <div v-if="selectedDepartment" class="department-preview">
              <div class="department-preview-icon">
                <v-icon size="20"> mdi-office-building-outline </v-icon>
              </div>

              <div>
                <div class="department-preview-code">
                  {{ selectedDepartment.dept_code }}
                </div>

                <div class="department-preview-name">
                  {{
                    selectedDepartment.department_name || "Selected Department"
                  }}
                </div>
              </div>
            </div>

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
// @ts-nocheck

/* ==========================================================================
   TYPES
============================================================================ */

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

/* ==========================================================================
   ROUTE
============================================================================ */

const route = useRoute();

const routeUserId = computed(() => String(route.params.id ?? ""));

/* ==========================================================================
   STATE
============================================================================ */

const loadingUser = ref(true);

const loadingShifts = ref(true);

const loadingAttendance = ref(true);

const loadingDepartments = ref(false);

const refreshing = ref(false);

const savingShift = ref(false);

const savingUser = ref(false);

const errorMessage = ref("");

const lastUpdated = ref<Date | null>(null);

/* ==========================================================================
   USER
============================================================================ */

const userDetails = ref<UserDetails>({});

/* ==========================================================================
   SHIFTS
============================================================================ */

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

/* ==========================================================================
   ATTENDANCE
============================================================================ */

const userAttendanceLogs = ref<AttendanceLog[]>([]);

const attendanceFilter = ref<"all" | "on-time" | "late" | "incomplete">("all");

const attendanceFilterOptions = [
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
   EDIT USER
============================================================================ */

const editUserDialog = ref(false);

const editUserForm = ref<any>(null);

const editValid = ref(false);

const editUserId = ref<number | null>(null);

const editName = ref("");

const selectedDepartment = ref<Department | null>(null);

const departmentList = ref<Department[]>([]);

/* ==========================================================================
   SNACKBAR
============================================================================ */

const snackbar = ref(false);

const snackbarText = ref("");

const snackbarColor = ref("success");

const snackbarIcon = ref("mdi-check-circle");

/* ==========================================================================
   VALIDATION
============================================================================ */

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

/* ==========================================================================
   TABLE HEADERS
============================================================================ */

const shiftHeaders = [
  {
    title: "Day",

    key: "shift_name",

    sortable: true,

    width: 170,
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

const attendanceHeaders = [
  {
    title: "Date",

    key: "log_date",

    sortable: true,

    minWidth: 175,
  },

  {
    title: "Schedule",

    key: "schedule",

    sortable: false,

    width: 165,
  },

  {
    title: "Time In",

    key: "in_time",

    sortable: false,

    width: 145,
  },

  {
    title: "Time Out",

    key: "out_time",

    sortable: false,

    width: 150,
  },

  {
    title: "Lateness",

    key: "late_status",

    sortable: true,

    width: 130,
  },

  {
    title: "Early Leave",

    key: "early_leave_status",

    sortable: true,

    width: 135,
  },

  {
    title: "Total Hours",

    key: "total_hours",

    sortable: true,

    width: 115,
  },
];

const attendanceSort = ref([
  {
    key: "log_date",

    order: "desc" as const,
  },
]);

/* ==========================================================================
   ATTENDANCE COMPUTED
============================================================================ */

const lateRecordCount = computed(
  () =>
    userAttendanceLogs.value.filter(
      (item) => Number(item.late_minutes ?? 0) > 0,
    ).length,
);

const noTimeOutRecordCount = computed(
  () => userAttendanceLogs.value.filter((item) => hasNoTimeOut(item)).length,
);

const onTimeRecordCount = computed(
  () => userAttendanceLogs.value.filter((item) => isOnTime(item)).length,
);

const filteredAttendanceLogs = computed(() => {
  switch (attendanceFilter.value) {
    case "on-time":
      return userAttendanceLogs.value.filter((item) => isOnTime(item));

    case "late":
      return userAttendanceLogs.value.filter(
        (item) => Number(item.late_minutes ?? 0) > 0,
      );

    case "incomplete":
      return userAttendanceLogs.value.filter((item) => hasNoTimeOut(item));

    default:
      return userAttendanceLogs.value;
  }
});

/* ==========================================================================
   SORTED SHIFTS
============================================================================ */

const sortedShiftList = computed(() => {
  return [...shiftList.value].sort((a, b) => {
    return (
      Number(a.weekday ?? getWeekdayNumber(a.shift_name) ?? 99) -
      Number(b.weekday ?? getWeekdayNumber(b.shift_name) ?? 99)
    );
  });
});

/* ==========================================================================
   SNACKBAR
============================================================================ */

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

/* ==========================================================================
   LOAD USER
============================================================================ */

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

/* ==========================================================================
   LOAD SHIFTS
============================================================================ */

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

/* ==========================================================================
   LOAD ATTENDANCE
============================================================================ */

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

/* ==========================================================================
   REFRESH
============================================================================ */

const refreshAll = async () => {
  refreshing.value = true;

  try {
    await Promise.all([initialize(), getShift(), getUserAttendanceLogs()]);

    lastUpdated.value = new Date();
  } finally {
    refreshing.value = false;
  }
};

/* ==========================================================================
   WEEKDAY
============================================================================ */

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

const shortDay = (day?: string) => {
  if (!day) {
    return "—";
  }

  return day.substring(0, 3).toUpperCase();
};

const getShiftForDay = (day: string) => {
  return shiftList.value.find((item) => item.shift_name === day);
};

/* ==========================================================================
   SHIFT PAYLOAD
============================================================================ */

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

/* ==========================================================================
   ADD SHIFT
============================================================================ */

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

/* ==========================================================================
   EDIT SHIFT
============================================================================ */

const editShift = (item: ShiftItem) => {
  isUpdate.value = true;

  documentID.value = item.documentId ?? "";

  shiftName.value = item.shift_name ?? null;

  timeIn.value = item.shift_start ?? "";

  timeOut.value = item.shift_end ?? "";

  gracePeriod.value = Number(item.grace_period_minutes ?? 15);

  window?.scrollTo({
    top: 0,

    behavior: "smooth",
  });
};

/* ==========================================================================
   UPDATE SHIFT
============================================================================ */

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

/* ==========================================================================
   RESET SHIFT
============================================================================ */

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

/* ==========================================================================
   DEPARTMENTS
============================================================================ */

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

/* ==========================================================================
   EDIT USER
============================================================================ */

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

/* ==========================================================================
   UPDATE USER
============================================================================ */

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

/* ==========================================================================
   CARD
============================================================================ */

const hasCard = (card?: string | number | null) => {
  if (card === null || card === undefined) {
    return false;
  }

  const value = String(card).trim();

  return value !== "" && value !== "0";
};

/* ==========================================================================
   ROLE
============================================================================ */

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
      .replace(/[\_-]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  return `Role ${value}`;
};

const getRoleIcon = (role?: string | number | null) => {
  const value = String(role ?? "")
    .trim()
    .toLowerCase();

  if (value === "14" || value.includes("admin")) {
    return "mdi-shield-account-outline";
  }

  return "mdi-account-outline";
};

/* ==========================================================================
   INITIALS
============================================================================ */

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

/* ==========================================================================
   ATTENDANCE HELPERS
============================================================================ */

const hasNoTimeOut = (item: AttendanceLog) => {
  return !item.out_time || item.in_time === item.out_time;
};

const isOnTime = (item: AttendanceLog) => {
  return Number(item.late_minutes ?? 0) <= 0 && Boolean(item.late_status);
};

/* ==========================================================================
   DATE
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

  if (!date) {
    return "--";
  }

  return String(date.getDate()).padStart(2, "0");
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
   SHIFT DURATION
============================================================================ */

const calculateShiftDuration = (item: ShiftItem) => {
  if (!item.shift_start || !item.shift_end) {
    return "Duration unavailable";
  }

  const parse = (value: string) => {
    const match = value.match(/^(\d{1,2}):(\d{2})/);

    if (!match) {
      return null;
    }

    return Number(match[1]) * 60 + Number(match[2]);
  };

  const start = parse(item.shift_start);

  const end = parse(item.shift_end);

  if (start === null || end === null) {
    return "Duration unavailable";
  }

  let minutes = end - start;

  if (minutes < 0) {
    minutes += 24 * 60;
  }

  const hours = Math.floor(minutes / 60);

  const remainder = minutes % 60;

  if (remainder === 0) {
    return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  }

  return `${hours}h ${remainder}m`;
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
  await Promise.all([initialize(), getShift(), getUserAttendanceLogs()]);

  lastUpdated.value = new Date();
});
</script>

<style scoped>
/* ==========================================================================
   PAGE
============================================================================ */

.user-profile-page {
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
  gap: 10px;
}

.back-button {
  flex-shrink: 0;
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.updated-status {
  min-height: 34px;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 11px;
  border: 1px solid #e5e7eb;
  border-radius: 9px;
  background: #ffffff;
  color: #6b7280;
  font-size: 0.65rem;
  font-weight: 600;
}

.refresh-button,
.edit-profile-button {
  text-transform: none;
  letter-spacing: 0;
}

/* ==========================================================================
   PROFILE HERO
============================================================================ */

.profile-hero {
  position: relative;
  overflow: hidden;
  border: none;
  border-radius: 18px;
  background: linear-gradient(135deg, #14532d 0%, #15803d 52%, #16a34a 100%);
  color: #ffffff;
  box-shadow: 0 12px 30px rgba(20, 83, 45, 0.12);
}

.profile-hero-content {
  position: relative;
  z-index: 2;
  padding: 28px;
}

.profile-decoration {
  position: absolute;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 50%;
}

.profile-decoration-one {
  width: 420px;
  height: 420px;
  right: -180px;
  top: -270px;
}

.profile-decoration-two {
  width: 520px;
  height: 520px;
  right: -340px;
  bottom: -390px;
}

.profile-identity {
  display: flex;
  align-items: center;
  gap: 17px;
}

.profile-avatar {
  position: relative;
  width: 82px;
  height: 82px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 0.24);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.14);
  color: #ffffff;
  font-size: 1.2rem;
  font-weight: 800;
  backdrop-filter: blur(10px);
}

.biometric-badge {
  position: absolute;
  right: -5px;
  bottom: -5px;
  width: 29px;
  height: 29px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #15803d;
  border-radius: 9px;
  background: #ffffff;
  color: #15803d;
}

.profile-main {
  flex: 1;
  min-width: 0;
}

.profile-eyebrow {
  margin-bottom: 4px;
  color: rgba(220, 252, 231, 0.7);
  font-size: 0.58rem;
  font-weight: 750;
  letter-spacing: 0.13em;
}

.profile-name {
  overflow: hidden;
  color: #ffffff;
  font-size: 1.55rem;
  font-weight: 780;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 10px;
}

.profile-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 8px;
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.61rem;
}

.edit-profile-button {
  flex-shrink: 0;
  color: #15803d !important;
  font-size: 0.68rem;
  font-weight: 700;
}

/* ==========================================================================
   PROFILE INFORMATION
============================================================================ */

.profile-information {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 25px;
  padding-top: 22px;
  border-top: 1px solid rgba(255, 255, 255, 0.13);
}

.profile-info-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
}

.profile-info-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.profile-info-label {
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.55rem;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.profile-info-value {
  max-width: 150px;
  margin-top: 2px;
  overflow: hidden;
  color: #ffffff;
  font-size: 0.69rem;
  font-weight: 670;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.info-status-chip {
  position: absolute;
  top: 7px;
  right: 7px;
  font-size: 0.51rem;
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
  border-color: #d7e8dc;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.055);
}

.summary-card-selected {
  border-color: rgba(22, 163, 74, 0.3);
  box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.05);
}

.summary-content {
  padding: 18px !important;
}

.summary-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.summary-icon {
  width: 40px;
  height: 40px;
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

.icon-incomplete {
  background: #fff8eb;
  color: #d97706;
}

.summary-tag {
  color: #9ca3af;
  font-size: 0.53rem;
  font-weight: 750;
  letter-spacing: 0.07em;
}

.summary-value {
  margin-top: 14px;
  color: #1f2937;
  font-size: 1.8rem;
  font-weight: 780;
  line-height: 1;
}

.summary-label {
  margin-top: 8px;
  color: #374151;
  font-size: 0.74rem;
  font-weight: 680;
}

.summary-description {
  margin-top: 3px;
  color: #9ca3af;
  font-size: 0.64rem;
}

/* ==========================================================================
   CONTENT CARDS
============================================================================ */

.content-card {
  overflow: hidden;
  border: 1px solid #e5e9e6;
  border-radius: 15px;
  background: #ffffff;
  box-shadow: 0 4px 17px rgba(15, 23, 42, 0.025);
}

.schedule-section {
  margin-bottom: 16px;
}

.card-header,
.attendance-header {
  min-height: 74px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 15px 19px;
}

.card-heading {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-heading-icon {
  width: 39px;
  height: 39px;
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
  font-size: 0.94rem;
  font-weight: 720;
}

.section-subtitle {
  margin-top: 2px;
  color: #9ca3af;
  font-size: 0.67rem;
}

/* ==========================================================================
   SHIFT FORM
============================================================================ */

.shift-form-card {
  transition: border-color 0.2s ease;
}

.shift-form-content {
  padding: 19px !important;
}

.field-group {
  margin-bottom: 17px;
}

.field-label {
  margin-bottom: 7px;
  color: #4b5563;
  font-size: 0.69rem;
  font-weight: 650;
}

:deep(.form-input .v-field) {
  border-radius: 9px;
}

.readonly-input {
  opacity: 0.8;
}

.shift-preview {
  margin-top: 4px;
  padding: 13px;
  border: 1px solid #dcece1;
  border-radius: 11px;
  background: #f5faf7;
}

.shift-preview-label {
  color: #93a099;
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.shift-preview-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 9px;
  color: #15803d;
}

.shift-preview-day {
  color: #374151;
  font-size: 0.7rem;
  font-weight: 680;
}

.shift-preview-time {
  margin-top: 2px;
  color: #6b7280;
  font-size: 0.63rem;
}

.shift-preview-grace {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 9px;
  padding-top: 8px;
  border-top: 1px solid #e4ece6;
  color: #929a95;
  font-size: 0.59rem;
}

.shift-actions {
  margin-top: 19px;
}

.primary-action {
  min-height: 42px;
}

.shift-form-actions {
  display: flex;
  gap: 9px;
  margin-top: 19px;
}

.shift-form-actions .v-btn {
  flex: 1;
}

.time-picker-card {
  overflow: hidden;
  border-radius: 14px !important;
}

.time-picker-actions {
  display: flex;
  justify-content: flex-end;
  padding: 5px 10px 10px;
}

/* ==========================================================================
   WEEKLY OVERVIEW
============================================================================ */

.weekly-overview {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 7px;
  padding: 15px 17px;
  background: #fbfcfb;
}

.weekday-card {
  min-height: 93px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid #e7eae8;
  border-radius: 10px;
  background: #ffffff;
}

.weekday-active {
  border-color: #cee8d5;
  background: linear-gradient(180deg, #f2fbf5, #ffffff);
}

.weekday-name {
  color: #6b7280;
  font-size: 0.57rem;
  font-weight: 750;
  letter-spacing: 0.05em;
}

.weekday-status-dot {
  width: 6px;
  height: 6px;
  margin: 8px 0 5px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.1);
}

.weekday-time,
.weekday-time-end {
  color: #374151;
  font-size: 0.57rem;
  font-weight: 650;
}

.weekday-time-end {
  margin-top: 2px;
  color: #8c949f;
}

.weekday-off-icon {
  margin: 7px 0 4px;
  color: #c1c6cc;
}

.weekday-off {
  color: #b0b5bb;
  font-size: 0.56rem;
}

/* ==========================================================================
   TABLES
============================================================================ */

:deep(.compact-table thead th),
:deep(.attendance-history-table thead th) {
  height: 47px !important;
  padding-left: 10px !important;
  padding-right: 10px !important;
  border-bottom: 1px solid #e8ebe9 !important;
  background: #fafbfa !important;
  color: #667085 !important;
  font-size: 0.64rem !important;
  font-weight: 720 !important;
  letter-spacing: 0.035em;
  text-transform: uppercase;
  white-space: nowrap;
}

:deep(.compact-table tbody td),
:deep(.attendance-history-table tbody td) {
  height: 62px !important;
  padding-left: 10px !important;
  padding-right: 10px !important;
  border-bottom: 1px solid #f0f2f1 !important;
  color: #374151;
  font-size: 0.74rem;
}

:deep(.compact-table tbody tr:hover),
:deep(.attendance-history-table tbody tr:hover) {
  background: #f8fbf9 !important;
}

/* ==========================================================================
   SHIFT TABLE
============================================================================ */

.shift-day-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.shift-day-icon {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 9px;
  background: #edf8f0;
  color: #15803d;
  font-size: 0.56rem;
  font-weight: 800;
}

.shift-day-name {
  color: #374151;
  font-size: 0.69rem;
  font-weight: 670;
}

.shift-day-subtitle {
  margin-top: 2px;
  color: #9ca3af;
  font-size: 0.55rem;
}

.schedule-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.schedule-time-icon {
  width: 29px;
  height: 29px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #f1f3f2;
  color: #69727d;
}

.schedule-primary {
  color: #4b5563;
  font-size: 0.66rem;
  font-weight: 650;
  white-space: nowrap;
}

.schedule-secondary {
  margin-top: 2px;
  color: #9ca3af;
  font-size: 0.55rem;
}

/* ==========================================================================
   ATTENDANCE HEADER
============================================================================ */

.attendance-toolbar {
  display: flex;
  align-items: center;
}

.attendance-filter {
  width: 180px;
}

:deep(.attendance-filter .v-field) {
  border-radius: 9px;
}

.attendance-results-bar {
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 8px 19px;
  border-top: 1px solid #f0f2f1;
  background: #fafbfa;
  color: #929aa4;
  font-size: 0.61rem;
}

.attendance-results-bar strong {
  color: #4b5563;
}

.attendance-result-badges {
  display: flex;
  align-items: center;
  gap: 11px;
}

.result-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}

.result-badge > span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.result-good > span {
  background: #22c55e;
}

.result-late > span {
  background: #ef4444;
}

.result-warning > span {
  background: #f59e0b;
}

/* ==========================================================================
   ATTENDANCE CELLS
============================================================================ */

.date-cell {
  display: flex;
  align-items: center;
  gap: 9px;
}

.date-calendar-icon {
  width: 38px;
  height: 41px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid #dde7e0;
  border-radius: 8px;
  background: #f6faf7;
}

.date-calendar-icon span {
  color: #374151;
  font-size: 0.72rem;
  font-weight: 750;
  line-height: 1;
}

.date-calendar-icon small {
  margin-top: 3px;
  color: #15803d;
  font-size: 0.47rem;
  font-weight: 750;
}

.date-primary {
  color: #374151;
  font-size: 0.68rem;
  font-weight: 650;
}

.date-secondary {
  margin-top: 2px;
  color: #9ca3af;
  font-size: 0.57rem;
}

.history-schedule {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #56606b;
  font-size: 0.64rem;
  font-weight: 620;
  white-space: nowrap;
}

.attendance-time {
  display: flex;
  align-items: center;
  gap: 6px;
}

.attendance-time-icon {
  width: 27px;
  height: 27px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
}

.time-in-icon {
  background: #eaf8ee;
  color: #15803d;
}

.time-out-icon {
  background: #eff6ff;
  color: #2563eb;
}

.time-in {
  color: #15803d;
  font-size: 0.66rem;
  font-weight: 650;
}

.time-out {
  color: #2563eb;
  font-size: 0.66rem;
  font-weight: 650;
}

.small-chip {
  font-size: 0.58rem;
}

.total-hours {
  color: #374151;
  font-size: 0.72rem;
  font-weight: 720;
  white-space: nowrap;
}

.total-hours span {
  margin-left: 2px;
  color: #9ca3af;
  font-size: 0.56rem;
  font-weight: 500;
}

.empty-value {
  color: #c1c6cc;
}

/* ==========================================================================
   EMPTY
============================================================================ */

.empty-state {
  padding: 55px 20px;
  text-align: center;
}

.small-empty {
  padding: 42px 20px;
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
  margin-top: 4px;
  color: #9ca3af;
  font-size: 0.67rem;
}

/* ==========================================================================
   DIALOG
============================================================================ */

.dialog-card {
  overflow: hidden;
  border-radius: 17px !important;
}

.dialog-hero {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: linear-gradient(135deg, #14532d, #15803d, #16a34a);
}

.dialog-avatar {
  width: 49px;
  height: 49px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.14);
  color: #ffffff;
  font-size: 0.77rem;
  font-weight: 800;
}

.dialog-user-info {
  flex: 1;
}

.dialog-eyebrow {
  color: rgba(220, 252, 231, 0.65);
  font-size: 0.5rem;
  font-weight: 750;
  letter-spacing: 0.1em;
}

.dialog-title {
  margin-top: 2px;
  color: #ffffff;
  font-size: 0.96rem;
  font-weight: 730;
}

.dialog-subtitle {
  margin-top: 2px;
  color: rgba(255, 255, 255, 0.64);
  font-size: 0.63rem;
}

.dialog-content {
  padding: 23px !important;
}

.department-preview {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 11px;
  border: 1px solid #dfeae2;
  border-radius: 10px;
  background: #f7faf8;
}

.department-preview-icon {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: #e6f5ea;
  color: #15803d;
}

.department-preview-code {
  color: #374151;
  font-size: 0.7rem;
  font-weight: 680;
}

.department-preview-name {
  margin-top: 2px;
  color: #9ca3af;
  font-size: 0.59rem;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  margin-top: 22px;
}

/* ==========================================================================
   TABLET
============================================================================ */

@media (max-width: 1100px) {
  .profile-information {
    grid-template-columns: repeat(2, 1fr);
  }

  .weekly-overview {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 960px) {
  .user-profile-page {
    padding: 16px;
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .profile-identity {
    align-items: flex-start;
  }

  .attendance-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .attendance-toolbar {
    width: 100%;
  }

  .attendance-filter {
    width: 100%;
  }

  .attendance-results-bar {
    align-items: flex-start;
    flex-direction: column;
  }

  :deep(.compact-table .v-table__wrapper),
  :deep(.attendance-history-table .v-table__wrapper) {
    overflow-x: auto;
  }
}

/* ==========================================================================
   MOBILE
============================================================================ */

@media (max-width: 600px) {
  .user-profile-page {
    padding: 10px;
  }

  .page-heading {
    align-items: flex-start;
  }

  .page-heading-icon {
    display: none;
  }

  .page-title {
    font-size: 1.2rem;
  }

  .page-subtitle {
    font-size: 0.7rem;
  }

  .header-actions {
    width: 100%;
    align-items: stretch;
    flex-direction: column;
  }

  .updated-status {
    justify-content: center;
  }

  .refresh-button {
    width: 100%;
  }

  .profile-hero-content {
    padding: 20px;
  }

  .profile-identity {
    flex-direction: column;
  }

  .profile-name {
    white-space: normal;
    font-size: 1.3rem;
  }

  .edit-profile-button {
    width: 100%;
  }

  .profile-information {
    grid-template-columns: 1fr;
  }

  .weekly-overview {
    grid-template-columns: repeat(2, 1fr);
  }

  .shift-form-actions,
  .dialog-actions {
    flex-direction: column;
  }

  .shift-form-actions .v-btn,
  .dialog-actions .v-btn {
    width: 100%;
  }

  .attendance-result-badges {
    flex-wrap: wrap;
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
