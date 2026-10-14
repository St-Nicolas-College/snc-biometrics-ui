<template>
  <div class="late-summary-report">
    <!-- =========================================================
         SUMMARY CARDS
    ========================================================== -->
    <v-row class="summary-row">
      <!-- Late Employees -->
      <v-col
        cols="12"
        sm="6"
        lg="3"
      >
        <v-card
          elevation="0"
          class="summary-card"
        >
          <v-card-text class="summary-content">
            <div class="summary-top">
              <div class="summary-icon icon-employees">
                <v-icon size="20">
                  mdi-account-clock-outline
                </v-icon>
              </div>

              <span class="summary-tag">
                EMPLOYEES
              </span>
            </div>

            <div class="summary-value">
              {{ lateEmployeeCount }}
            </div>

            <div class="summary-label">
              Late Employees
            </div>

            <div class="summary-description">
              Employees with recorded lateness
            </div>

            <div class="summary-footer">
              <span>
                {{ summary.length }} records analyzed
              </span>

              <v-icon size="14">
                mdi-account-group-outline
              </v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Total Late -->
      <v-col
        cols="12"
        sm="6"
        lg="3"
      >
        <v-card
          elevation="0"
          class="summary-card"
        >
          <v-card-text class="summary-content">
            <div class="summary-top">
              <div class="summary-icon icon-total">
                <v-icon size="20">
                  mdi-clock-alert-outline
                </v-icon>
              </div>

              <span class="summary-tag text-error">
                ACCUMULATED
              </span>
            </div>

            <div class="summary-value text-error">
              {{ totalLateMinutes }}
            </div>

            <div class="summary-label">
              Total Late Minutes
            </div>

            <div class="summary-description">
              Combined employee lateness
            </div>

            <div class="summary-footer">
              <span>
                {{ totalLateDuration }}
              </span>

              <v-icon size="14">
                mdi-timer-sand
              </v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Average -->
      <v-col
        cols="12"
        sm="6"
        lg="3"
      >
        <v-card
          elevation="0"
          class="summary-card"
        >
          <v-card-text class="summary-content">
            <div class="summary-top">
              <div class="summary-icon icon-average">
                <v-icon size="20">
                  mdi-chart-bell-curve-cumulative
                </v-icon>
              </div>

              <span class="summary-tag text-warning">
                AVERAGE
              </span>
            </div>

            <div class="summary-value text-warning">
              {{ averageLateMinutes }}
            </div>

            <div class="summary-label">
              Average Late
            </div>

            <div class="summary-description">
              Average minutes per late employee
            </div>

            <div class="summary-footer">
              <span>
                Per late employee
              </span>

              <v-icon size="14">
                mdi-chart-line
              </v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Highest -->
      <v-col
        cols="12"
        sm="6"
        lg="3"
      >
        <v-card
          elevation="0"
          class="summary-card"
        >
          <v-card-text class="summary-content">
            <div class="summary-top">
              <div class="summary-icon icon-highest">
                <v-icon size="20">
                  mdi-chart-line-variant
                </v-icon>
              </div>

              <span class="summary-tag summary-tag-purple">
                HIGHEST
              </span>
            </div>

            <div class="summary-value summary-value-purple">
              {{ highestLateMinutes }}
            </div>

            <div class="summary-label">
              Highest Late
            </div>

            <div class="summary-description latest-employee">
              {{
                highestLateEmployee?.employee_name ||
                'No late record'
              }}
            </div>

            <div class="summary-footer">
              <span>
                Maximum recorded minutes
              </span>

              <v-icon size="14">
                mdi-arrow-up-bold-outline
              </v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- =========================================================
         DATE FILTER
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
              Late Summary Period
            </div>

            <div class="section-subtitle">
              Select the attendance period used to calculate employee lateness.
            </div>
          </div>
        </div>

        <v-chip
          v-if="hasGeneratedReport"
          size="small"
          variant="tonal"
          color="success"
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
                @click="searchSummaryOfLate"
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
                  summary.length === 0
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
                LATENESS REPORT PERIOD
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
         LATENESS DISTRIBUTION
    ========================================================== -->
    <v-card
      v-if="hasGeneratedReport"
      elevation="0"
      class="severity-card"
    >
      <div class="severity-header">
        <div class="card-heading">
          <div class="card-heading-icon warning-heading-icon">
            <v-icon size="19">
              mdi-chart-donut
            </v-icon>
          </div>

          <div>
            <div class="section-title">
              Lateness Distribution
            </div>

            <div class="section-subtitle">
              Breakdown of employees based on recorded late minutes.
            </div>
          </div>
        </div>

        <div class="severity-total">
          {{ lateEmployeeCount }}
          late employees
        </div>
      </div>

      <v-divider />

      <div class="severity-grid">
        <!-- Minor -->
        <button
          type="button"
          class="severity-item"
          :class="{
            'severity-selected':
              severityFilter === 'minor'
          }"
          @click="toggleSeverity('minor')"
        >
          <div class="severity-indicator severity-minor" />

          <div class="severity-copy">
            <div class="severity-name">
              Minor
            </div>

            <div class="severity-description">
              1–15 minutes
            </div>
          </div>

          <div class="severity-value">
            {{ minorLateCount }}
          </div>
        </button>

        <!-- Moderate -->
        <button
          type="button"
          class="severity-item"
          :class="{
            'severity-selected':
              severityFilter === 'moderate'
          }"
          @click="toggleSeverity('moderate')"
        >
          <div class="severity-indicator severity-moderate" />

          <div class="severity-copy">
            <div class="severity-name">
              Moderate
            </div>

            <div class="severity-description">
              16–30 minutes
            </div>
          </div>

          <div class="severity-value">
            {{ moderateLateCount }}
          </div>
        </button>

        <!-- High -->
        <button
          type="button"
          class="severity-item"
          :class="{
            'severity-selected':
              severityFilter === 'high'
          }"
          @click="toggleSeverity('high')"
        >
          <div class="severity-indicator severity-high" />

          <div class="severity-copy">
            <div class="severity-name">
              High
            </div>

            <div class="severity-description">
              More than 30 minutes
            </div>
          </div>

          <div class="severity-value">
            {{ highLateCount }}
          </div>
        </button>
      </div>
    </v-card>

    <!-- =========================================================
         TABLE
    ========================================================== -->
    <v-card
      elevation="0"
      class="report-table-card"
    >
      <!-- =======================================================
           TOOLBAR
      ======================================================== -->
      <div class="table-toolbar">
        <div class="card-heading">
          <div class="card-heading-icon">
            <v-icon size="19">
              mdi-account-clock-outline
            </v-icon>
          </div>

          <div>
            <div class="section-title">
              Employee Late Summary
            </div>

            <div class="section-subtitle">
              Consolidated employee lateness for the selected report period.
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
              filteredSummary.length === 0
            "
            class="print-button"
            @click="printLateSummaryReport"
          >
            Print / PDF
          </v-btn>

          <!-- Severity Filter -->
          <v-select
            v-model="severityFilter"
            :items="severityFilterOptions"
            item-title="title"
            item-value="value"
            density="compact"
            variant="outlined"
            hide-details
            prepend-inner-icon="mdi-filter-outline"
            class="severity-filter"
          />

          <!-- Search -->
          <v-text-field
            v-model="search"
            density="compact"
            placeholder="Search employee..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            clearable
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
                ? 'Generated lateness summary'
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
            {{ filteredSummary.length }}
          </strong>

          of

          <strong>
            {{ summary.length }}
          </strong>

          employees
        </div>
      </div>

      <v-divider />

      <!-- =======================================================
           TABLE
      ======================================================== -->
      <v-data-table
        :items="filteredSummary"
        :headers="headers"
        :loading="loading"
        :sort-by="defaultSort"
        density="comfortable"
        :items-per-page="20"
        class="late-summary-table"
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
        <template #[`item.employee_name`]="{ item }">
          <div class="employee-cell">
            <div class="employee-avatar">
              {{ getInitials(item.employee_name) }}
            </div>

            <div class="employee-info">
              <div class="employee-name">
                {{
                  item.employee_name ||
                  'Unknown Employee'
                }}
              </div>

              <div class="employee-subtitle">
                User ID {{ item.user_id }}
              </div>
            </div>
          </div>
        </template>

        <!-- =====================================================
             REPORT PERIOD
        ====================================================== -->
        <template #[`item.cutoff_date`]="{ item }">
          <div class="period-cell">
            <div class="period-icon">
              <v-icon size="15">
                mdi-calendar-range-outline
              </v-icon>
            </div>

            <div class="period-copy">
              <div class="period-main">
                {{ formatDate(item.cutoff_start) }}

                <span>
                  –
                </span>

                {{ formatDate(item.cutoff_end) }}
              </div>

              <div class="period-subtitle">
                Report cutoff period
              </div>
            </div>
          </div>
        </template>

        <!-- =====================================================
             LATE MINUTES
        ====================================================== -->
        <template #[`item.late_minutes`]="{ item }">
          <div class="late-minutes-cell">
            <div
              v-if="
                getMinutes(item.late_minutes) > 0
              "
              class="late-value-row"
            >
              <v-chip
                size="small"
                variant="tonal"
                :color="
                  getLateColor(
                    item.late_minutes
                  )
                "
                class="late-chip"
              >
                <v-icon
                  start
                  size="13"
                >
                  mdi-clock-alert-outline
                </v-icon>

                {{ item.late_minutes }} min
              </v-chip>
            </div>

            <v-chip
              v-else
              size="small"
              variant="tonal"
              color="success"
              class="late-chip"
            >
              <v-icon
                start
                size="13"
              >
                mdi-check-circle-outline
              </v-icon>

              On Time
            </v-chip>

            <div
              v-if="
                getMinutes(item.late_minutes) > 0
              "
              class="late-progress"
            >
              <div
                class="late-progress-value"
                :class="
                  getLateProgressClass(
                    item.late_minutes
                  )
                "
                :style="{
                  width:
                    getLateProgressWidth(
                      item.late_minutes
                    )
                }"
              />
            </div>
          </div>
        </template>

        <!-- =====================================================
             LEVEL
        ====================================================== -->
        <template #[`item.level`]="{ item }">
          <v-chip
            size="small"
            variant="tonal"
            :color="
              getLateLevel(
                item.late_minutes
              ).color
            "
            class="level-chip"
          >
            <v-icon
              start
              size="13"
            >
              {{
                getLateLevel(
                  item.late_minutes
                ).icon
              }}
            </v-icon>

            {{
              getLateLevel(
                item.late_minutes
              ).label
            }}
          </v-chip>
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
                    ? 'mdi-clock-check-outline'
                    : 'mdi-file-chart-outline'
                }}
              </v-icon>
            </div>

            <div class="empty-title">
              {{
                hasGeneratedReport
                  ? 'No late records found'
                  : 'No report generated'
              }}
            </div>

            <div class="empty-description">
              {{
                hasGeneratedReport
                  ? 'Try changing the employee search or late-level filter.'
                  : 'Select a reporting period above, then click Generate Report.'
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

interface LateSummary {
  user_id: number

  employee_name?: string

  cutoff_start?: string
  cutoff_end?: string

  late_minutes?: number | string
}

interface LateSummaryResponse {
  data?: LateSummary[]
}

type SeverityFilter =
  | 'all'
  | 'minor'
  | 'moderate'
  | 'high'
  | 'on-time'

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

const search =
  ref('')

const loading =
  ref(false)

const summary =
  ref<LateSummary[]>([])

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

const severityFilter =
  ref<SeverityFilter>(
    'all'
  )

/* ==========================================================================
   TABLE HEADERS
============================================================================ */

const headers = [
  {
    title:
      'Employee',

    key:
      'employee_name',

    sortable:
      true,

    minWidth:
      260
  },

  {
    title:
      'Report Period',

    key:
      'cutoff_date',

    sortable:
      false,

    minWidth:
      245
  },

  {
    title:
      'Late Minutes',

    key:
      'late_minutes',

    sortable:
      true,

    width:
      200
  },

  {
    title:
      'Late Level',

    key:
      'level',

    sortable:
      false,

    width:
      150
  }
]

/* ==========================================================================
   DEFAULT SORT
============================================================================ */

const defaultSort =
  ref([
    {
      key:
        'late_minutes',

      order:
        'desc' as const
    }
  ])

/* ==========================================================================
   FILTER OPTIONS
============================================================================ */

const severityFilterOptions = [
  {
    title:
      'All Levels',

    value:
      'all'
  },

  {
    title:
      'Minor – 1 to 15 min',

    value:
      'minor'
  },

  {
    title:
      'Moderate – 16 to 30 min',

    value:
      'moderate'
  },

  {
    title:
      'High – Above 30 min',

    value:
      'high'
  },

  {
    title:
      'On Time',

    value:
      'on-time'
  }
]

/* ==========================================================================
   MINUTES
============================================================================ */

const getMinutes =
  (
    value?:
      number |
      string
  ) => {
    const minutes =
      Number(
        value ??
        0
      )

    return Number.isFinite(
      minutes
    )
      ? minutes
      : 0
  }

/* ==========================================================================
   SUMMARY STATISTICS
============================================================================ */

const lateEmployeeCount =
  computed(
    () => {
      return summary.value
        .filter(
          item =>
            getMinutes(
              item.late_minutes
            ) > 0
        )
        .length
    }
  )

const totalLateMinutes =
  computed(
    () => {
      return summary.value
        .reduce(
          (
            total,
            item
          ) => {
            return (
              total +
              getMinutes(
                item.late_minutes
              )
            )
          },
          0
        )
    }
  )

const averageLateMinutes =
  computed(
    () => {
      const lateItems =
        summary.value
          .filter(
            item =>
              getMinutes(
                item.late_minutes
              ) > 0
          )

      if (
        lateItems.length ===
        0
      ) {
        return 0
      }

      const total =
        lateItems.reduce(
          (
            sum,
            item
          ) => {
            return (
              sum +
              getMinutes(
                item.late_minutes
              )
            )
          },
          0
        )

      return Math.round(
        total /
        lateItems.length
      )
    }
  )

const highestLateMinutes =
  computed(
    () => {
      if (
        summary.value.length ===
        0
      ) {
        return 0
      }

      return Math.max(
        ...summary.value.map(
          item =>
            getMinutes(
              item.late_minutes
            )
        )
      )
    }
  )

const highestLateEmployee =
  computed<
    LateSummary |
    null
  >(
    () => {
      if (
        summary.value.length ===
        0
      ) {
        return null
      }

      return [
        ...summary.value
      ].sort(
        (
          a,
          b
        ) => {
          return (
            getMinutes(
              b.late_minutes
            ) -
            getMinutes(
              a.late_minutes
            )
          )
        }
      )[0] ??
        null
    }
  )

const totalLateDuration =
  computed(
    () => {
      const minutes =
        totalLateMinutes.value

      if (
        minutes <= 0
      ) {
        return '0 minutes'
      }

      const hours =
        Math.floor(
          minutes /
          60
        )

      const remainder =
        minutes %
        60

      if (
        hours === 0
      ) {
        return (
          `${remainder} minutes`
        )
      }

      if (
        remainder === 0
      ) {
        return (
          `${hours} ${
            hours === 1
              ? 'hour'
              : 'hours'
          }`
        )
      }

      return (
        `${hours}h ${remainder}m`
      )
    }
  )

/* ==========================================================================
   SEVERITY COUNTS
============================================================================ */

const minorLateCount =
  computed(
    () => {
      return summary.value
        .filter(
          item => {
            const minutes =
              getMinutes(
                item.late_minutes
              )

            return (
              minutes > 0 &&
              minutes <= 15
            )
          }
        )
        .length
    }
  )

const moderateLateCount =
  computed(
    () => {
      return summary.value
        .filter(
          item => {
            const minutes =
              getMinutes(
                item.late_minutes
              )

            return (
              minutes > 15 &&
              minutes <= 30
            )
          }
        )
        .length
    }
  )

const highLateCount =
  computed(
    () => {
      return summary.value
        .filter(
          item =>
            getMinutes(
              item.late_minutes
            ) > 30
        )
        .length
    }
  )

/* ==========================================================================
   LATE LEVEL KEY
============================================================================ */

const getLateLevelKey =
  (
    value?:
      number |
      string
  ): SeverityFilter => {
    const minutes =
      getMinutes(
        value
      )

    if (
      minutes <= 0
    ) {
      return 'on-time'
    }

    if (
      minutes <= 15
    ) {
      return 'minor'
    }

    if (
      minutes <= 30
    ) {
      return 'moderate'
    }

    return 'high'
  }

/* ==========================================================================
   FILTERED SUMMARY
============================================================================ */

const filteredSummary =
  computed(
    () => {
      let result = [
        ...summary.value
      ]

      /* ================================================================
         SEVERITY FILTER
      ================================================================= */

      if (
        severityFilter.value !==
        'all'
      ) {
        result =
          result.filter(
            item =>
              getLateLevelKey(
                item.late_minutes
              ) ===
              severityFilter.value
          )
      }

      /* ================================================================
         EMPLOYEE SEARCH
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
                item.employee_name,
                item.user_id,
                item.cutoff_start,
                item.cutoff_end,
                item.late_minutes,
                getLateLevel(
                  item.late_minutes
                ).label
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
        severityFilter.value !==
          'all'
      )
    }
  )

const resetTableFilters =
  () => {
    search.value =
      ''

    severityFilter.value =
      'all'
  }

/* ==========================================================================
   TOGGLE SEVERITY
============================================================================ */

const toggleSeverity =
  (
    level:
      SeverityFilter
  ) => {
    severityFilter.value =
      severityFilter.value ===
        level
        ? 'all'
        : level
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

const searchSummaryOfLate =
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
          LateSummaryResponse |
          LateSummary[]
        >(
          `/api/attendance/late-summary?start=${encodeURIComponent(
            formattedDateStart
          )}&end=${encodeURIComponent(
            formattedDateEnd
          )}`
        )

      /*
       * Supports:
       *
       * {
       *   data: [...]
       * }
       *
       * and:
       *
       * [...]
       */

      if (
        Array.isArray(
          result
        )
      ) {
        summary.value =
          result
      } else {
        summary.value =
          result?.data ??
          []
      }

      hasGeneratedReport.value =
        true

      generatedAt.value =
        new Date()

      severityFilter.value =
        'all'

      search.value =
        ''

      errorMessage.value =
        ''
    } catch (
      error
    ) {
      console.error(
        'Late summary error:',
        error
      )

      summary.value =
        []

      hasGeneratedReport.value =
        false

      generatedAt.value =
        null

      errorMessage.value =
        'Unable to generate the late summary report.'
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

      const mondayOffset =
        weekday === 0
          ? 6
          : weekday - 1

      startDate.setDate(
        today.getDate() -
          mondayOffset
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

    await searchSummaryOfLate()
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

    search.value =
      ''

    summary.value =
      []

    errorMessage.value =
      ''

    hasGeneratedReport.value =
      false

    generatedAt.value =
      null

    activeQuickRange.value =
      null

    severityFilter.value =
      'all'
  }

/* ==========================================================================
   EMPLOYEE INITIALS
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
   DATE PARSER
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
     * YYYY-MM-DD must be built
     * as a local calendar date.
     */

    const dateOnly =
      cleanValue.match(
        /^(\d{4})-(\d{2})-(\d{2})$/
      )

    if (
      dateOnly
    ) {
      return new Date(
        Number(
          dateOnly[1]
        ),
        Number(
          dateOnly[2]
        ) - 1,
        Number(
          dateOnly[3]
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
   LATE LEVEL
============================================================================ */

const getLateLevel =
  (
    value?:
      number |
      string
  ) => {
    const minutes =
      getMinutes(
        value
      )

    if (
      minutes <= 0
    ) {
      return {
        label:
          'On Time',

        color:
          'success',

        icon:
          'mdi-check-circle-outline'
      }
    }

    if (
      minutes <= 15
    ) {
      return {
        label:
          'Minor',

        color:
          'warning',

        icon:
          'mdi-clock-outline'
      }
    }

    if (
      minutes <= 30
    ) {
      return {
        label:
          'Moderate',

        color:
          'orange',

        icon:
          'mdi-clock-alert-outline'
      }
    }

    return {
      label:
        'High',

      color:
        'error',

      icon:
        'mdi-alert-circle-outline'
    }
  }

/* ==========================================================================
   LATE COLOR
============================================================================ */

const getLateColor =
  (
    value?:
      number |
      string
  ) => {
    return getLateLevel(
      value
    ).color
  }

/* ==========================================================================
   PROGRESS
============================================================================ */

const getLateProgressWidth =
  (
    value?:
      number |
      string
  ) => {
    const minutes =
      getMinutes(
        value
      )

    const highest =
      highestLateMinutes.value

    if (
      minutes <= 0 ||
      highest <= 0
    ) {
      return '0%'
    }

    const percentage =
      Math.min(
        100,
        Math.max(
          5,
          (
            minutes /
            highest
          ) *
          100
        )
      )

    return (
      `${percentage}%`
    )
  }

const getLateProgressClass =
  (
    value?:
      number |
      string
  ) => {
    const level =
      getLateLevelKey(
        value
      )

    if (
      level === 'minor'
    ) {
      return 'progress-minor'
    }

    if (
      level === 'moderate'
    ) {
      return 'progress-moderate'
    }

    if (
      level === 'high'
    ) {
      return 'progress-high'
    }

    return ''
  }

/* ==========================================================================
   PRINT / PDF
============================================================================ */

const printLateSummaryReport =
  () => {
    if (
      !hasGeneratedReport.value ||
      filteredSummary.value.length ===
        0
    ) {
      return
    }

    const records =
      filteredSummary.value

    const lateRecords =
      records.filter(
        item =>
          getMinutes(
            item.late_minutes
          ) > 0
      )

    const totalMinutes =
      lateRecords.reduce(
        (
          total,
          item
        ) => {
          return (
            total +
            getMinutes(
              item.late_minutes
            )
          )
        },
        0
      )

    const averageMinutes =
      lateRecords.length
        ? Math.round(
            totalMinutes /
            lateRecords.length
          )
        : 0

    const highestMinutes =
      lateRecords.length
        ? Math.max(
            ...lateRecords.map(
              item =>
                getMinutes(
                  item.late_minutes
                )
            )
          )
        : 0

    try {
      printReport({
        title:
          'Summary of Late Report',

        subtitle:
          'Consolidated employee lateness analysis',

        period:
          reportPeriodText.value,

        orientation:
          'portrait',

        note:
          hasActiveTableFilters.value
            ? 'This report reflects the currently selected employee search or late-level filter.'
            : undefined,

        metrics: [
          {
            label:
              'Late Employees',

            value:
              lateRecords.length
          },

          {
            label:
              'Total Late',

            value:
              `${totalMinutes} min`
          },

          {
            label:
              'Average Late',

            value:
              `${averageMinutes} min`
          },

          {
            label:
              'Highest Late',

            value:
              `${highestMinutes} min`
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
              'user_id',

            label:
              'User ID',

            align:
              'center'
          },

          {
            key:
              'period',

            label:
              'Report Period'
          },

          {
            key:
              'late_minutes',

            label:
              'Late Minutes',

            align:
              'right'
          },

          {
            key:
              'level',

            label:
              'Late Level',

            align:
              'center'
          }
        ],

        rows:
          records.map(
            item => {
              const minutes =
                getMinutes(
                  item.late_minutes
                )

              return {
                employee:
                  item.employee_name ||
                  'Unknown Employee',

                user_id:
                  item.user_id,

                period:
                  `${
                    formatDate(
                      item.cutoff_start
                    )
                  } - ${
                    formatDate(
                      item.cutoff_end
                    )
                  }`,

                late_minutes:
                  minutes > 0
                    ? `${minutes} min`
                    : '0 min',

                level:
                  getLateLevel(
                    minutes
                  ).label
              }
            }
          )
      })
    } catch (
      error:
        any
    ) {
      console.error(
        'Print late summary error:',
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

.late-summary-report {
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

  box-shadow:
    0 3px 12px
    rgba(
      15,
      23,
      42,
      0.022
    );

  transition:
    transform 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
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

.summary-content {
  padding:
    17px !important;
}

.summary-top {
  display: flex;

  align-items: center;

  justify-content:
    space-between;
}

.summary-icon {
  width: 39px;

  height: 39px;

  display: flex;

  align-items: center;

  justify-content:
    center;

  border-radius: 10px;
}

.icon-employees {
  background:
    #edf9f1;

  color:
    #15803d;
}

.icon-total {
  background:
    #fff5f5;

  color:
    #dc2626;
}

.icon-average {
  background:
    #fff8eb;

  color:
    #d97706;
}

.icon-highest {
  background:
    #f5f3ff;

  color:
    #7c3aed;
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

.summary-tag-purple {
  color:
    #7c3aed;
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

.summary-value-purple {
  color:
    #7c3aed;
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

.latest-employee {
  max-width:
    180px;

  overflow:
    hidden;

  text-overflow:
    ellipsis;

  white-space:
    nowrap;
}

.summary-footer {
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
.severity-card,
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

.filter-card,
.severity-card {
  margin-bottom:
    16px;
}

/* ==========================================================================
   HEADER / TOOLBAR
============================================================================ */

.card-header,
.table-toolbar,
.severity-header {
  min-height:
    70px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    space-between;

  gap:
    16px;

  padding:
    14px 17px;
}

.card-heading {
  display:
    flex;

  align-items:
    center;

  gap:
    9px;
}

.card-heading-icon {
  width:
    37px;

  height:
    37px;

  display:
    flex;

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

.warning-heading-icon {
  border-color:
    #fde8c8;

  background:
    #fff8eb;

  color:
    #d97706;
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
  display:
    flex;

  align-items:
    center;

  gap:
    11px;

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
  display:
    flex;

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
  display:
    flex;

  align-items:
    center;

  gap:
    8px;
}

.generate-button,
.clear-button,
.print-button {
  min-height:
    40px;

  text-transform:
    none;

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
  display:
    flex;

  align-items:
    center;

  justify-content:
    space-between;

  gap:
    16px;

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
  display:
    flex;

  align-items:
    center;

  gap:
    8px;
}

.generated-period-icon {
  width:
    32px;

  height:
    32px;

  display:
    flex;

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
  display:
    flex;

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
  display:
    flex;

  align-items:
    center;

  gap:
    5px;

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
   SEVERITY
============================================================================ */

.severity-total {
  color:
    #9ca3af;

  font-size:
    0.59rem;
}

.severity-grid {
  display:
    grid;

  grid-template-columns:
    repeat(
      3,
      1fr
    );

  gap:
    9px;

  padding:
    14px 17px;
}

.severity-item {
  min-width:
    0;

  display:
    flex;

  align-items:
    center;

  gap:
    9px;

  padding:
    11px 12px;

  border:
    1px solid
    #e9ebe9;

  border-radius:
    10px;

  background:
    #ffffff;

  color:
    inherit;

  cursor:
    pointer;

  font:
    inherit;

  text-align:
    left;

  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}

.severity-item:hover {
  border-color:
    #d8e4db;

  background:
    #fbfcfb;
}

.severity-selected {
  border-color:
    #c9e4d1;

  background:
    #f5faf6;
}

.severity-indicator {
  width:
    9px;

  height:
    34px;

  flex-shrink:
    0;

  border-radius:
    10px;
}

.severity-minor {
  background:
    #f59e0b;
}

.severity-moderate {
  background:
    #f97316;
}

.severity-high {
  background:
    #ef4444;
}

.severity-copy {
  flex:
    1;

  min-width:
    0;
}

.severity-name {
  color:
    #374151;

  font-size:
    0.67rem;

  font-weight:
    680;
}

.severity-description {
  margin-top:
    2px;

  color:
    #9ca3af;

  font-size:
    0.54rem;
}

.severity-value {
  color:
    #1f2937;

  font-size:
    1rem;

  font-weight:
    760;
}

/* ==========================================================================
   TOOLBAR
============================================================================ */

.toolbar-actions {
  display:
    flex;

  align-items:
    center;

  gap:
    8px;
}

.severity-filter {
  width:
    190px;
}

.search-field {
  width:
    235px;
}

:deep(
  .severity-filter
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
   RESULTS
============================================================================ */

.results-bar {
  min-height:
    38px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    space-between;

  gap:
    12px;

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
  display:
    flex;

  align-items:
    center;

  gap:
    6px;
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
  .late-summary-table
  .v-table__wrapper
) {
  overflow-x:
    auto;
}

:deep(
  .late-summary-table
  thead
  th
) {
  height:
    47px !important;

  padding-left:
    12px !important;

  padding-right:
    12px !important;

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
  .late-summary-table
  tbody
  td
) {
  height:
    65px !important;

  padding-left:
    12px !important;

  padding-right:
    12px !important;

  border-bottom:
    1px solid
    #f0f2f1 !important;

  color:
    #374151;

  font-size:
    0.72rem;
}

:deep(
  .late-summary-table
  tbody
  tr
) {
  transition:
    background-color
    0.15s ease;
}

:deep(
  .late-summary-table
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
  display:
    flex;

  align-items:
    center;

  gap:
    9px;
}

.employee-avatar {
  width:
    37px;

  height:
    37px;

  display:
    flex;

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
    220px;

  overflow:
    hidden;

  color:
    #1f2937;

  font-size:
    0.72rem;

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
   PERIOD
============================================================================ */

.period-cell {
  display:
    flex;

  align-items:
    center;

  gap:
    8px;
}

.period-icon {
  width:
    30px;

  height:
    30px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  flex-shrink:
    0;

  border-radius:
    8px;

  background:
    #f1f3f2;

  color:
    #6b7280;
}

.period-copy {
  min-width:
    0;
}

.period-main {
  color:
    #374151;

  font-size:
    0.65rem;

  font-weight:
    640;

  white-space:
    nowrap;
}

.period-main span {
  margin:
    0 3px;

  color:
    #a0a7b0;
}

.period-subtitle {
  margin-top:
    2px;

  color:
    #9ca3af;

  font-size:
    0.53rem;
}

/* ==========================================================================
   LATE MINUTES
============================================================================ */

.late-minutes-cell {
  min-width:
    120px;
}

.late-value-row {
  display:
    flex;

  align-items:
    center;
}

.late-chip,
.level-chip {
  font-size:
    0.57rem;
}

.late-progress {
  overflow:
    hidden;

  width:
    105px;

  height:
    3px;

  margin-top:
    6px;

  border-radius:
    10px;

  background:
    #f1f3f2;
}

.late-progress-value {
  height:
    100%;

  border-radius:
    inherit;

  transition:
    width 0.25s ease;
}

.progress-minor {
  background:
    #f59e0b;
}

.progress-moderate {
  background:
    #f97316;
}

.progress-high {
  background:
    #ef4444;
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

  display:
    flex;

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
  .table-toolbar,
  .severity-header {
    align-items:
      stretch;

    flex-direction:
      column;
  }

  .severity-grid {
    grid-template-columns:
      1fr;
  }

  .toolbar-actions {
    width:
      100%;

    flex-wrap:
      wrap;
  }

  .severity-filter {
    width:
      190px;
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
  .summary-footer {
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
  .severity-filter,
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

  .period-main {
    white-space:
      normal;
  }
}

/* ==========================================================================
   REDUCED MOTION
============================================================================ */

@media (
  prefers-reduced-motion:
  reduce
) {
  .summary-card,
  .severity-item,
  .late-progress-value {
    transition:
      none;
  }
}
</style>