<template>
  <div class="reports-page">
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
            mdi-chart-box-outline
          </v-icon>

          <h1 class="page-title">
            Reports
          </h1>
        </div>

        <p class="page-subtitle">
          Generate and review attendance reports from biometric records.
        </p>
      </div>
    </div>

    <!-- =========================================================
         REPORT OVERVIEW
    ========================================================== -->
    <v-row class="mb-5">
      <!-- Attendance Logs -->
      <v-col
        cols="12"
        sm="6"
        lg="4"
      >
        <v-card
          elevation="0"
          class="report-summary-card"
          :class="{
            'active-report-card':
              selectedReport === 'attendance'
          }"
          @click="selectedReport = 'attendance'"
        >
          <v-card-text>
            <div class="d-flex align-center ga-4">
              <div class="report-summary-icon icon-primary">
                <v-icon size="24">
                  mdi-calendar-clock-outline
                </v-icon>
              </div>

              <div>
                <div class="report-summary-title">
                  Attendance Logs
                </div>

                <div class="report-summary-description">
                  Generate detailed employee attendance records.
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Late Summary -->
      <v-col
        cols="12"
        sm="6"
        lg="4"
      >
        <v-card
          elevation="0"
          class="report-summary-card"
          :class="{
            'active-report-card':
              selectedReport === 'late'
          }"
          @click="selectedReport = 'late'"
        >
          <v-card-text>
            <div class="d-flex align-center ga-4">
              <div class="report-summary-icon icon-warning">
                <v-icon size="24">
                  mdi-clock-alert-outline
                </v-icon>
              </div>

              <div>
                <div class="report-summary-title">
                  Summary of Late
                </div>

                <div class="report-summary-description">
                  Review employee lateness and late occurrences.
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Report Center -->
      <v-col
        cols="12"
        sm="6"
        lg="4"
      >
        <v-card
          elevation="0"
          class="report-summary-card information-card"
        >
          <v-card-text>
            <div class="d-flex align-center ga-4">
              <div class="report-summary-icon icon-info">
                <v-icon size="24">
                  mdi-file-chart-outline
                </v-icon>
              </div>

              <div>
                <div class="report-summary-title">
                  Report Center
                </div>

                <div class="report-summary-description">
                  Attendance information ready for review and reporting.
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- =========================================================
         MAIN REPORT CARD
    ========================================================== -->
    <v-card
      elevation="0"
      class="report-card"
    >
      <!-- Report Header -->
      <div class="report-card-header">
        <div class="d-flex align-center ga-3">
          <div
            class="report-header-icon"
            :class="
              selectedReport === 'attendance'
                ? 'header-icon-primary'
                : 'header-icon-warning'
            "
          >
            <v-icon>
              {{
                selectedReport === 'attendance'
                  ? 'mdi-calendar-clock-outline'
                  : 'mdi-clock-alert-outline'
              }}
            </v-icon>
          </div>

          <div>
            <div class="section-title">
              {{
                selectedReport === 'attendance'
                  ? 'Attendance Logs Report'
                  : 'Summary of Late Report'
              }}
            </div>

            <div class="section-subtitle">
              {{
                selectedReport === 'attendance'
                  ? 'Generate detailed attendance records based on your selected criteria.'
                  : 'Generate a summary of employee late attendance.'
              }}
            </div>
          </div>
        </div>
      </div>

      <v-divider />

      <!-- =======================================================
           REPORT TABS
      ======================================================== -->
      <div class="report-tabs-wrapper">
        <v-tabs
          v-model="selectedReport"
          color="primary"
          density="comfortable"
          class="report-tabs"
        >
          <v-tab
            value="attendance"
            class="text-none"
          >
            <v-icon
              start
              size="18"
            >
              mdi-calendar-clock-outline
            </v-icon>

            Attendance Logs
          </v-tab>

          <v-tab
            value="late"
            class="text-none"
          >
            <v-icon
              start
              size="18"
            >
              mdi-clock-alert-outline
            </v-icon>

            Summary of Late
          </v-tab>
        </v-tabs>
      </div>

      <v-divider />

      <!-- =======================================================
           REPORT CONTENT
      ======================================================== -->
      <div class="report-content">
        <v-window
          v-model="selectedReport"
        >
          <!-- Attendance Report -->
          <v-window-item value="attendance">
            <div class="report-section">
              <AttendanceLogs />
            </div>
          </v-window-item>

          <!-- Late Summary -->
          <v-window-item value="late">
            <div class="report-section">
              <SummaryOfLate />
            </div>
          </v-window-item>
        </v-window>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
// import SummaryOfLate from '~/components/SummaryOfLate.vue'

/*
|--------------------------------------------------------------------------
| Active Report
|--------------------------------------------------------------------------
*/

const selectedReport =
  ref<'attendance' | 'late'>(
    'attendance'
  )
</script>

<style scoped>
/* =========================================================
   PAGE
========================================================= */

.reports-page {
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
   REPORT SUMMARY CARDS
========================================================= */

.report-summary-card {
  height: 100%;

  border: 1px solid #e7e9ed;
  border-radius: 14px;

  background: #ffffff;

  cursor: pointer;

  transition:
    transform 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.report-summary-card:hover {
  transform: translateY(-2px);

  border-color: #bbf7d0;

  box-shadow:
    0 8px 24px
    rgba(0, 0, 0, 0.05);
}

.active-report-card {
  border-color: #4caf50;

  background: #f9fffa;
}

.information-card {
  cursor: default;
}

.information-card:hover {
  transform: none;

  border-color: #e7e9ed;

  box-shadow: none;
}

.report-summary-icon {
  width: 48px;
  height: 48px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border-radius: 12px;
}

.icon-primary {
  color: #15803d;
  background: #ecfdf5;
}

.icon-warning {
  color: #d97706;
  background: #fffbeb;
}

.icon-info {
  color: #2563eb;
  background: #eff6ff;
}

.report-summary-title {
  color: #1f2937;

  font-size: 0.95rem;
  font-weight: 700;
}

.report-summary-description {
  margin-top: 3px;

  color: #9ca3af;

  font-size: 0.76rem;
  line-height: 1.4;
}

/* =========================================================
   REPORT CARD
========================================================= */

.report-card {
  overflow: hidden;

  border: 1px solid #e7e9ed;
  border-radius: 14px;

  background: #ffffff;
}

.report-card-header {
  min-height: 82px;

  display: flex;
  align-items: center;

  padding: 16px 20px;
}

.report-header-icon {
  width: 44px;
  height: 44px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border-radius: 11px;
}

.header-icon-primary {
  color: #15803d;
  background: #ecfdf5;
}

.header-icon-warning {
  color: #d97706;
  background: #fffbeb;
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

/* =========================================================
   TABS
========================================================= */

.report-tabs-wrapper {
  padding: 0 12px;

  background: #fafafa;
}

.report-tabs {
  min-height: 52px;
}

:deep(.report-tabs .v-tab) {
  min-width: 170px;

  color: #6b7280;

  font-size: 0.8rem;
  font-weight: 650;
}

:deep(.report-tabs .v-tab--selected) {
  color: #15803d;
}

/* =========================================================
   REPORT CONTENT
========================================================= */

.report-content {
  background: #ffffff;
}

.report-section {
  min-height: 300px;

  padding: 24px;
}

/* =========================================================
   CHILD COMPONENT CLEANUP
========================================================= */

/*
 * These styles help embedded report components
 * blend into the new report container.
 */

:deep(.report-section > div) {
  max-width: 100%;
}

:deep(.report-section .v-card) {
  box-shadow: none !important;
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 960px) {
  .reports-page {
    padding: 16px;
  }

  .report-section {
    padding: 18px;
  }
}

@media (max-width: 600px) {
  .reports-page {
    padding: 10px;
  }

  .page-title {
    font-size: 1.3rem;
  }

  .report-card-header {
    padding: 14px;
  }

  .report-section {
    padding: 12px;
  }

  .report-tabs-wrapper {
    overflow-x: auto;
  }

  :deep(.report-tabs .v-tab) {
    min-width: 150px;
  }
}
</style>