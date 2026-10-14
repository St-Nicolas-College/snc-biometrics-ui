<template>
  <div class="reports-page">
    <!-- =========================================================
         PAGE HEADER
    ========================================================== -->
    <div class="page-header">
      <div class="page-heading">
        <div class="page-heading-icon">
          <v-icon size="23"> mdi-chart-box-outline </v-icon>
        </div>

        <div>
          <h1 class="page-title">Reports</h1>

          <p class="page-subtitle">
            Generate, review and analyze biometric attendance information.
          </p>
        </div>
      </div>

      <div class="header-actions">
        <div class="report-status">
          <span class="report-status-dot" />

          Reporting Center Ready
        </div>

        <div class="current-date">
          <v-icon size="15"> mdi-calendar-outline </v-icon>

          {{ currentDateLabel }}
        </div>
      </div>
    </div>

    <!-- =========================================================
         REPORT CENTER HERO
    ========================================================== -->
    <section class="reports-hero">
      <div class="hero-decoration hero-decoration-one" />
      <div class="hero-decoration hero-decoration-two" />

      <div class="hero-content">
        <!-- Left -->
        <div class="hero-main">
          <div class="hero-eyebrow">
            <v-icon size="15"> mdi-file-chart-outline </v-icon>

            ATTENDANCE REPORTING CENTER
          </div>

          <h2 class="hero-title">
            Attendance insights
            <br />
            in one workspace.
          </h2>

          <p class="hero-description">
            Review detailed biometric attendance records and analyze employee
            lateness using the available reporting tools.
          </p>

          <div class="hero-features">
            <div class="hero-feature">
              <div class="hero-feature-icon">
                <v-icon size="17"> mdi-fingerprint </v-icon>
              </div>

              <div>
                <div class="hero-feature-label">Data Source</div>

                <div class="hero-feature-value">Biometric Attendance</div>
              </div>
            </div>

            <div class="hero-feature-divider" />

            <div class="hero-feature">
              <div class="hero-feature-icon">
                <v-icon size="17"> mdi-file-document-multiple-outline </v-icon>
              </div>

              <div>
                <div class="hero-feature-label">Reports</div>

                <div class="hero-feature-value">
                  {{ reportCatalog.length }} Available
                </div>
              </div>
            </div>

            <div class="hero-feature-divider" />

            <div class="hero-feature">
              <div class="hero-feature-icon">
                <v-icon size="17"> mdi-calendar-range-outline </v-icon>
              </div>

              <div>
                <div class="hero-feature-label">Filtering</div>

                <div class="hero-feature-value">Date Range</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Active Report -->
        <div class="hero-active-report">
          <div class="active-report-header">
            <div>
              <div class="active-report-label">CURRENT REPORT</div>

              <div class="active-report-caption">Selected reporting module</div>
            </div>

            <div class="active-report-icon" :class="activeReportMeta.iconClass">
              <v-icon size="27">
                {{ activeReportMeta.icon }}
              </v-icon>
            </div>
          </div>

          <div class="active-report-body">
            <div class="active-report-name">
              {{ activeReportMeta.title }}
            </div>

            <div class="active-report-description">
              {{ activeReportMeta.description }}
            </div>
          </div>

          <div class="active-report-footer">
            <div class="active-report-feature">
              <v-icon size="15">
                {{ activeReportMeta.featureIcon }}
              </v-icon>

              {{ activeReportMeta.feature }}
            </div>

            <v-btn
              color="white"
              variant="flat"
              size="small"
              class="open-report-button"
              @click="scrollToReport"
            >
              Open Report

              <v-icon end size="16"> mdi-arrow-down </v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </section>

    <!-- =========================================================
         REPORT SELECTOR
    ========================================================== -->
    <div class="section-heading">
      <div>
        <div class="section-eyebrow">REPORT LIBRARY</div>

        <h3 class="section-heading-title">Choose a report</h3>

        <p class="section-heading-description">
          Select the type of attendance information you want to review.
        </p>
      </div>

      <div class="report-count">
        <v-icon size="15"> mdi-file-document-multiple-outline </v-icon>

        {{ reportCatalog.length }}
        reports available
      </div>
    </div>

    <v-row class="report-selection-row">
      <v-col
        v-for="report in reportCatalog"
        :key="report.value"
        cols="12"
        md="4"
      >
        <v-card
          elevation="0"
          class="report-selector-card"
          :class="{
            'report-selector-active': selectedReport === report.value,
          }"
          @click="selectReport(report.value)"
        >
          <!-- Active Indicator -->
          <div
            v-if="selectedReport === report.value"
            class="selected-indicator"
          >
            <v-icon size="14"> mdi-check </v-icon>

            Selected
          </div>

          <v-card-text class="report-selector-content">
            <div class="selector-icon" :class="report.iconClass">
              <v-icon size="25">
                {{ report.icon }}
              </v-icon>
            </div>

            <div class="selector-main">
              <div class="selector-title">
                {{ report.title }}
              </div>

              <div class="selector-description">
                {{ report.description }}
              </div>

              <div class="selector-features">
                <div
                  v-for="feature in report.features"
                  :key="feature.text"
                  class="selector-feature"
                >
                  <v-icon size="14" :color="report.featureColor">
                    {{ feature.icon }}
                  </v-icon>

                  {{ feature.text }}
                </div>
              </div>
            </div>

            <div class="selector-arrow">
              <v-icon size="20"> mdi-chevron-right </v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- =========================================================
         REPORT WORKSPACE
    ========================================================== -->
    <v-card ref="reportWorkspace" elevation="0" class="report-workspace">
      <!-- =======================================================
           WORKSPACE HEADER
      ======================================================== -->
      <div class="workspace-header">
        <div class="workspace-heading">
          <div class="workspace-icon" :class="activeReportMeta.iconClass">
            <v-icon size="21">
              {{ activeReportMeta.icon }}
            </v-icon>
          </div>

          <div>
            <div class="workspace-eyebrow">ACTIVE REPORT</div>

            <div class="workspace-title">
              {{ activeReportMeta.reportTitle }}
            </div>

            <div class="workspace-subtitle">
              {{ activeReportMeta.workspaceDescription }}
            </div>
          </div>
        </div>

        <div class="workspace-meta">
          <v-chip
            size="small"
            variant="tonal"
            :color="activeReportMeta.color"
            class="workspace-chip"
          >
            <v-icon start size="14">
              {{ activeReportMeta.featureIcon }}
            </v-icon>

            {{ activeReportMeta.feature }}
          </v-chip>
        </div>
      </div>

      <!-- =======================================================
           REPORT GUIDE
      ======================================================== -->
      <div class="report-guide">
        <div class="guide-icon">
          <v-icon size="18"> mdi-information-outline </v-icon>
        </div>

        <div class="guide-content">
          <div class="guide-title">
            {{ activeReportMeta.guideTitle }}
          </div>

          <div class="guide-description">
            {{ activeReportMeta.guideDescription }}
          </div>
        </div>

        <div class="guide-steps">
          <div class="guide-step">
            <span>1</span>
            Select dates
          </div>

          <v-icon size="14" class="guide-arrow"> mdi-chevron-right </v-icon>

          <div class="guide-step">
            <span>2</span>
            Generate
          </div>

          <v-icon size="14" class="guide-arrow"> mdi-chevron-right </v-icon>

          <div class="guide-step">
            <span>3</span>
            Review
          </div>
        </div>
      </div>

      <!-- =======================================================
           REPORT NAVIGATION
      ======================================================== -->
      <div class="report-tabs-wrapper">
        <v-tabs
          v-model="selectedReport"
          color="primary"
          density="comfortable"
          class="report-tabs"
        >
          <v-tab value="attendance" class="report-tab">
            <div class="tab-icon tab-icon-attendance">
              <v-icon size="17"> mdi-calendar-clock-outline </v-icon>
            </div>

            <div class="tab-copy">
              <span> Attendance Logs </span>

              <small> Detailed attendance records </small>
            </div>
          </v-tab>

          <v-tab value="employee" class="report-tab">
            <div class="tab-icon tab-icon-attendance">
              <v-icon size="17"> mdi-account-clock-outline </v-icon>
            </div>

            <div class="tab-copy">
              <span> Employee Attendance </span>

              <small> Individual employee report </small>
            </div>
          </v-tab>

          <v-tab value="late" class="report-tab">
            <div class="tab-icon tab-icon-late">
              <v-icon size="17"> mdi-clock-alert-outline </v-icon>
            </div>

            <div class="tab-copy">
              <span> Summary of Late </span>

              <small> Lateness analysis </small>
            </div>
          </v-tab>
        </v-tabs>
      </div>

      <v-divider />

      <!-- =======================================================
           REPORT CONTENT
      ======================================================== -->
      <div class="report-content">
        <v-window v-model="selectedReport">
          <!-- Attendance Report -->
          <v-window-item value="attendance">
            <div class="report-section">
              <AttendanceLogs />
            </div>
          </v-window-item>

          <v-window-item value="employee">
            <div class="report-section">
              <EmployeeAttendanceReport />
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
//@ts-nocheck
/* ==========================================================================
   TYPES
============================================================================ */

type ReportType = "attendance" | "employee" | "late";

interface ReportFeature {
  icon: string;
  text: string;
}

interface ReportCatalogItem {
  value: ReportType;
  title: string;
  reportTitle: string;
  description: string;
  workspaceDescription: string;

  icon: string;
  iconClass: string;
  color: string;
  featureColor: string;

  featureIcon: string;
  feature: string;

  guideTitle: string;
  guideDescription: string;

  features: ReportFeature[];
}

/* ==========================================================================
   ACTIVE REPORT
============================================================================ */

const selectedReport = ref<ReportType>("attendance");

/* ==========================================================================
   WORKSPACE REFERENCE
============================================================================ */

const reportWorkspace = ref<any>(null);

/* ==========================================================================
   REPORT CATALOG
============================================================================ */

const reportCatalog: ReportCatalogItem[] = [
  {
    value: "attendance",

    title: "Attendance Logs",

    reportTitle: "Attendance Logs Report",

    description:
      "Generate detailed employee attendance records for a selected date range.",

    workspaceDescription:
      "Review schedules, time in, time out, lateness, early departures and total working hours.",

    icon: "mdi-calendar-clock-outline",

    iconClass: "icon-attendance",

    color: "success",

    featureColor: "success",

    featureIcon: "mdi-table-clock",

    feature: "Detailed Records",

    guideTitle: "Generate an attendance report",

    guideDescription:
      "Choose the attendance period below, generate the report and review individual employee attendance activity.",

    features: [
      {
        icon: "mdi-calendar-range-outline",

        text: "Date-range filtering",
      },

      {
        icon: "mdi-clock-check-outline",

        text: "Time in and time out",
      },

      {
        icon: "mdi-timer-outline",

        text: "Working hours",
      },
    ],
  },

  {
    value: "late",

    title: "Summary of Late",

    reportTitle: "Summary of Late Report",

    description:
      "Analyze employee lateness and identify recurring late attendance.",

    workspaceDescription:
      "Review accumulated late minutes and compare employee lateness within the selected reporting period.",

    icon: "mdi-clock-alert-outline",

    iconClass: "icon-late",

    color: "warning",

    featureColor: "warning",

    featureIcon: "mdi-chart-timeline-variant",

    feature: "Lateness Analysis",

    guideTitle: "Generate a lateness summary",

    guideDescription:
      "Select a reporting period below to identify employees with late attendance and review accumulated late minutes.",

    features: [
      {
        icon: "mdi-clock-alert-outline",

        text: "Late occurrences",
      },

      {
        icon: "mdi-timer-alert-outline",

        text: "Total late minutes",
      },

      {
        icon: "mdi-account-group-outline",

        text: "Employee comparison",
      },
    ],
  },

  {
    value: "employee",

    title: "Employee Attendance",

    reportTitle: "Employee Attendance Report",

    description:
      "Generate a detailed attendance report for a specific employee and date range.",

    workspaceDescription:
      "Review one employee’s daily attendance, schedule, time in, time out, lateness and total working hours.",

    icon: "mdi-account-file-text-outline",

    iconClass: "icon-attendance",

    color: "success",

    featureColor: "success",

    featureIcon: "mdi-account-clock-outline",

    feature: "Per Employee",

    guideTitle: "Generate an employee attendance report",

    guideDescription:
      "Select an employee and reporting period to review that employee’s detailed biometric attendance history.",

    features: [
      {
        icon: "mdi-account-outline",

        text: "Employee selection",
      },

      {
        icon: "mdi-calendar-range-outline",

        text: "Date-range filtering",
      },

      {
        icon: "mdi-printer-outline",

        text: "Printable PDF report",
      },
    ],
  },
];

/* ==========================================================================
   ACTIVE META
============================================================================ */

const activeReportMeta = computed<ReportCatalogItem>(() => {
  return (
    reportCatalog.find((report) => report.value === selectedReport.value) ??
    reportCatalog[0]
  );
});

/* ==========================================================================
   DATE
============================================================================ */

const currentDateLabel = computed(() => {
  return new Date().toLocaleDateString("en-PH", {
    month: "short",

    day: "2-digit",

    year: "numeric",
  });
});

/* ==========================================================================
   SELECT REPORT
============================================================================ */

const selectReport = (report: ReportType) => {
  selectedReport.value = report;

  /*
   * Small delay allows the active
   * report UI to update first.
   */
  nextTick(() => {
    scrollToReport();
  });
};

/* ==========================================================================
   SCROLL TO REPORT
============================================================================ */

const scrollToReport = () => {
  if (import.meta.server) {
    return;
  }

  /*
   * Vuetify component ref exposes
   * the root element through $el.
   */
  const target = reportWorkspace.value?.$el ?? reportWorkspace.value;

  target?.scrollIntoView?.({
    behavior: "smooth",

    block: "start",
  });
};
</script>

<style scoped>
/* ==========================================================================
   PAGE
============================================================================ */

.reports-page {
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.report-status,
.current-date {
  min-height: 34px;

  display: flex;
  align-items: center;
  gap: 7px;

  padding: 7px 11px;

  border-radius: 9px;

  font-size: 0.65rem;
  font-weight: 600;
}

.report-status {
  border: 1px solid #cdebd7;

  background: #effaf2;
  color: #15803d;
}

.report-status-dot {
  width: 7px;
  height: 7px;

  border-radius: 50%;

  background: #22c55e;

  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.1);
}

.current-date {
  border: 1px solid #e5e7eb;

  background: #ffffff;
  color: #6b7280;
}

/* ==========================================================================
   HERO
============================================================================ */

.reports-hero {
  position: relative;

  overflow: hidden;

  margin-bottom: 25px;

  border-radius: 18px;

  background: linear-gradient(135deg, #14532d 0%, #15803d 50%, #16a34a 100%);

  box-shadow: 0 12px 32px rgba(20, 83, 45, 0.12);

  color: #ffffff;
}

.hero-content {
  position: relative;
  z-index: 2;

  display: grid;

  grid-template-columns:
    minmax(0, 1.35fr)
    minmax(340px, 0.65fr);

  gap: 30px;

  padding: 31px;
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
  gap: 7px;

  margin-bottom: 13px;

  color: rgba(220, 252, 231, 0.82);

  font-size: 0.61rem;
  font-weight: 760;

  letter-spacing: 0.12em;
}

.hero-title {
  margin: 0;

  color: #ffffff;

  font-size: clamp(2rem, 3vw, 2.9rem);

  font-weight: 800;

  line-height: 1.08;

  letter-spacing: -0.03em;
}

.hero-description {
  max-width: 620px;

  margin: 15px 0 0;

  color: rgba(255, 255, 255, 0.7);

  font-size: 0.82rem;

  line-height: 1.65;
}

/* ==========================================================================
   HERO FEATURES
============================================================================ */

.hero-features {
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  gap: 17px;

  margin-top: 27px;
}

.hero-feature {
  display: flex;
  align-items: center;

  gap: 8px;
}

.hero-feature-icon {
  width: 33px;
  height: 33px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border: 1px solid rgba(255, 255, 255, 0.14);

  border-radius: 9px;

  background: rgba(255, 255, 255, 0.09);

  color: #ffffff;
}

.hero-feature > div:last-child {
  display: flex;
  flex-direction: column;
}

.hero-feature-label {
  color: rgba(255, 255, 255, 0.48);

  font-size: 0.54rem;

  text-transform: uppercase;

  letter-spacing: 0.05em;
}

.hero-feature-value {
  margin-top: 2px;

  color: rgba(255, 255, 255, 0.9);

  font-size: 0.65rem;
  font-weight: 650;
}

.hero-feature-divider {
  width: 1px;
  height: 31px;

  background: rgba(255, 255, 255, 0.14);
}

/* ==========================================================================
   HERO ACTIVE REPORT
============================================================================ */

.hero-active-report {
  align-self: stretch;

  display: flex;
  flex-direction: column;

  padding: 20px;

  border: 1px solid rgba(255, 255, 255, 0.15);

  border-radius: 16px;

  background: rgba(255, 255, 255, 0.1);

  backdrop-filter: blur(12px);
}

.active-report-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  gap: 12px;
}

.active-report-label {
  color: rgba(255, 255, 255, 0.84);

  font-size: 0.59rem;
  font-weight: 750;

  letter-spacing: 0.09em;
}

.active-report-caption {
  margin-top: 3px;

  color: rgba(255, 255, 255, 0.48);

  font-size: 0.58rem;
}

.active-report-icon {
  width: 48px;
  height: 48px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border: 1px solid rgba(255, 255, 255, 0.14);

  border-radius: 13px;

  background: rgba(255, 255, 255, 0.1);

  color: #ffffff;
}

.active-report-body {
  flex: 1;

  margin-top: 26px;
}

.active-report-name {
  color: #ffffff;

  font-size: 1.18rem;
  font-weight: 760;
}

.active-report-description {
  margin-top: 7px;

  color: rgba(255, 255, 255, 0.61);

  font-size: 0.67rem;

  line-height: 1.55;
}

.active-report-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 10px;

  margin-top: 20px;

  padding-top: 16px;

  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.active-report-feature {
  display: flex;
  align-items: center;
  gap: 5px;

  color: rgba(255, 255, 255, 0.7);

  font-size: 0.6rem;
}

.open-report-button {
  color: #15803d !important;

  text-transform: none;

  font-size: 0.61rem;
  font-weight: 700;

  letter-spacing: 0;
}

/* ==========================================================================
   HERO DECORATION
============================================================================ */

.hero-decoration {
  position: absolute;

  border: 1px solid rgba(255, 255, 255, 0.06);

  border-radius: 50%;

  pointer-events: none;
}

.hero-decoration-one {
  width: 430px;
  height: 430px;

  top: -270px;
  right: -120px;
}

.hero-decoration-two {
  width: 580px;
  height: 580px;

  right: -365px;
  bottom: -410px;
}

/* ==========================================================================
   LIBRARY HEADING
============================================================================ */

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;

  gap: 20px;

  margin-bottom: 12px;
}

.section-eyebrow {
  color: #15803d;

  font-size: 0.56rem;
  font-weight: 750;

  letter-spacing: 0.1em;
}

.section-heading-title {
  margin: 4px 0 0;

  color: #1f2937;

  font-size: 1rem;
  font-weight: 730;
}

.section-heading-description {
  margin: 3px 0 0;

  color: #9ca3af;

  font-size: 0.67rem;
}

.report-count {
  display: flex;
  align-items: center;
  gap: 6px;

  color: #8e969f;

  font-size: 0.62rem;
}

/* ==========================================================================
   REPORT SELECTOR CARDS
============================================================================ */

.report-selection-row {
  margin-bottom: 17px;
}

.report-selector-card {
  position: relative;

  height: 100%;

  overflow: hidden;

  border: 1px solid #e5e9e6;

  border-radius: 15px;

  background: #ffffff;

  cursor: pointer;

  box-shadow: 0 3px 13px rgba(15, 23, 42, 0.025);

  transition:
    transform 0.16s ease,
    border-color 0.16s ease,
    box-shadow 0.16s ease;
}

.report-selector-card:hover {
  transform: translateY(-3px);

  border-color: #d4e7da;

  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.055);
}

.report-selector-active {
  border-color: rgba(22, 163, 74, 0.38);

  background: linear-gradient(145deg, #f7fcf8, #ffffff);

  box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.05);
}

.selected-indicator {
  position: absolute;

  top: 12px;
  right: 12px;

  display: flex;
  align-items: center;
  gap: 4px;

  padding: 4px 7px;

  border-radius: 6px;

  background: #dcfce7;
  color: #15803d;

  font-size: 0.54rem;
  font-weight: 700;
}

.report-selector-content {
  display: flex;

  align-items: flex-start;

  gap: 14px;

  padding: 20px !important;
}

.selector-icon {
  width: 48px;
  height: 48px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border-radius: 12px;
}

.icon-attendance {
  background: #edf9f1;
  color: #15803d;
}

.icon-late {
  background: #fff8eb;
  color: #d97706;
}

.selector-main {
  flex: 1;

  min-width: 0;
}

.selector-title {
  color: #1f2937;

  font-size: 0.82rem;
  font-weight: 720;
}

.selector-description {
  max-width: 510px;

  margin-top: 5px;

  color: #8e969f;

  font-size: 0.64rem;

  line-height: 1.5;
}

.selector-features {
  display: flex;
  flex-wrap: wrap;

  gap: 12px;

  margin-top: 14px;
}

.selector-feature {
  display: flex;
  align-items: center;

  gap: 4px;

  color: #737c86;

  font-size: 0.58rem;
}

.selector-arrow {
  align-self: center;

  flex-shrink: 0;

  color: #b4bac1;
}

/* ==========================================================================
   WORKSPACE
============================================================================ */

.report-workspace {
  overflow: hidden;

  scroll-margin-top: 90px;

  border: 1px solid #e5e9e6;

  border-radius: 16px;

  background: #ffffff;

  box-shadow: 0 4px 18px rgba(15, 23, 42, 0.025);
}

/* ==========================================================================
   WORKSPACE HEADER
============================================================================ */

.workspace-header {
  min-height: 80px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 16px;

  padding: 16px 20px;
}

.workspace-heading {
  display: flex;
  align-items: center;

  gap: 11px;
}

.workspace-icon {
  width: 42px;
  height: 42px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border-radius: 11px;
}

.workspace-eyebrow {
  color: #9ca3af;

  font-size: 0.53rem;
  font-weight: 750;

  letter-spacing: 0.09em;
}

.workspace-title {
  margin-top: 2px;

  color: #1f2937;

  font-size: 0.93rem;
  font-weight: 720;
}

.workspace-subtitle {
  margin-top: 2px;

  color: #9ca3af;

  font-size: 0.64rem;
}

.workspace-chip {
  font-size: 0.59rem;
}

/* ==========================================================================
   REPORT GUIDE
============================================================================ */

.report-guide {
  display: flex;
  align-items: center;

  gap: 10px;

  margin: 0 20px 15px;

  padding: 11px 13px;

  border: 1px solid #e1ebe4;

  border-radius: 10px;

  background: linear-gradient(90deg, #f6faf7, #fbfcfb);
}

.guide-icon {
  width: 32px;
  height: 32px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border-radius: 8px;

  background: #e4f3e8;
  color: #15803d;
}

.guide-content {
  flex: 1;

  min-width: 0;
}

.guide-title {
  color: #4b5563;

  font-size: 0.66rem;
  font-weight: 680;
}

.guide-description {
  margin-top: 2px;

  color: #929aa4;

  font-size: 0.58rem;

  line-height: 1.45;
}

.guide-steps {
  display: flex;
  align-items: center;

  gap: 6px;

  flex-shrink: 0;
}

.guide-step {
  display: flex;
  align-items: center;

  gap: 5px;

  color: #727b85;

  font-size: 0.56rem;

  white-space: nowrap;
}

.guide-step span {
  width: 19px;
  height: 19px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background: #dcf1e2;
  color: #15803d;

  font-size: 0.51rem;
  font-weight: 750;
}

.guide-arrow {
  color: #c2c7cd;
}

/* ==========================================================================
   REPORT TABS
============================================================================ */

.report-tabs-wrapper {
  padding: 0 14px;

  border-top: 1px solid #f0f2f1;

  background: #fafbfa;
}

.report-tabs {
  min-height: 57px;
}

:deep(.report-tabs .v-tab) {
  min-width: 220px;

  padding-inline: 13px;

  text-transform: none;

  letter-spacing: 0;
}

.report-tab {
  height: 57px !important;
}

:deep(.report-tabs .v-btn__content) {
  justify-content: flex-start;
}

.tab-icon {
  width: 31px;
  height: 31px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  margin-right: 8px;

  border-radius: 8px;
}

.tab-icon-attendance {
  background: #edf8f0;
  color: #15803d;
}

.tab-icon-late {
  background: #fff5df;
  color: #d97706;
}

.tab-copy {
  display: flex;
  flex-direction: column;

  align-items: flex-start;
}

.tab-copy span {
  color: #4b5563;

  font-size: 0.67rem;
  font-weight: 680;
}

.tab-copy small {
  margin-top: 1px;

  color: #a0a7b0;

  font-size: 0.52rem;
  font-weight: 500;
}

:deep(.report-tabs .v-tab--selected .tab-copy span) {
  color: #15803d;
}

/* ==========================================================================
   REPORT CONTENT
============================================================================ */

.report-content {
  background: #ffffff;
}

.report-section {
  min-height: 350px;

  padding: 20px;
}

/*
 * The report components are already complete
 * report modules. These styles make their
 * outer cards blend with the parent workspace.
 */

:deep(.report-section > div) {
  max-width: 100%;
}

:deep(.report-section > div > .v-card:first-child) {
  border-color: transparent !important;

  box-shadow: none !important;
}

/* ==========================================================================
   TABLET
============================================================================ */

@media (max-width: 1100px) {
  .hero-content {
    grid-template-columns:
      1fr
      330px;
  }

  .hero-title {
    font-size: 2.2rem;
  }

  .guide-steps {
    display: none;
  }
}

@media (max-width: 960px) {
  .reports-page {
    padding: 16px;
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }

  .hero-content {
    grid-template-columns: 1fr;

    padding: 24px;
  }

  .hero-main {
    min-height: auto;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .workspace-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .report-guide {
    align-items: flex-start;
  }

  .report-section {
    padding: 16px;
  }
}

/* ==========================================================================
   MOBILE
============================================================================ */

@media (max-width: 600px) {
  .reports-page {
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

  .header-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .report-status,
  .current-date {
    justify-content: center;
  }

  .hero-content {
    padding: 20px;
  }

  .hero-title {
    font-size: 1.75rem;
  }

  .hero-description {
    font-size: 0.72rem;
  }

  .hero-features {
    align-items: flex-start;
    flex-direction: column;

    gap: 10px;
  }

  .hero-feature-divider {
    display: none;
  }

  .hero-active-report {
    padding: 17px;
  }

  .active-report-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .open-report-button {
    width: 100%;
  }

  .report-selector-content {
    padding: 17px !important;
  }

  .selector-features {
    align-items: flex-start;
    flex-direction: column;

    gap: 6px;
  }

  .selector-arrow {
    display: none;
  }

  .selected-indicator {
    top: 8px;
    right: 8px;
  }

  .workspace-header {
    padding: 14px;
  }

  .report-guide {
    margin: 0 14px 13px;
  }

  .report-tabs-wrapper {
    overflow-x: auto;

    padding-inline: 6px;
  }

  :deep(.report-tabs .v-tab) {
    min-width: 185px;
  }

  .report-section {
    padding: 10px;
  }
}

/* ==========================================================================
   REDUCED MOTION
============================================================================ */

@media (prefers-reduced-motion: reduce) {
  .report-selector-card {
    transition: none;
  }
}
</style>
