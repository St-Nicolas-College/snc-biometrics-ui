<template>
  <v-app class="app-shell">
    <!-- =========================================================
         NAVIGATION DRAWER
    ========================================================== -->
    <v-navigation-drawer
      v-model="drawer"
      :temporary="mobile"
      :permanent="!mobile"
      width="270"
      class="app-sidebar"
    >
      <!-- =======================================================
           BRAND
      ======================================================== -->
      <div class="sidebar-brand">
        <div class="brand-logo">
          <v-img
            src="/SNC-Logo.png"
            alt="St. Nicolas College"
            width="48"
            height="48"
            contain
          />
        </div>

        <div class="brand-content">
          <div class="brand-title">St. Nicolas College</div>

          <div class="brand-subtitle">Attendance System</div>
        </div>
      </div>

      <v-divider />

      <!-- =======================================================
           MAIN NAVIGATION
      ======================================================== -->
      <div class="sidebar-section">
        <div class="sidebar-label">MAIN MENU</div>

        <v-list density="comfortable" nav class="sidebar-list">
          <!-- Dashboard -->
          <v-list-item
            to="/"
            :active="isActive('/')"
            rounded="lg"
            class="nav-item"
          >
            <template #prepend>
              <div class="nav-icon">
                <v-icon size="20"> mdi-view-dashboard-outline </v-icon>
              </div>
            </template>

            <v-list-item-title> Dashboard </v-list-item-title>
          </v-list-item>

          <!-- Attendance -->
          <v-list-item
            to="/attendance"
            :active="isActive('/attendance')"
            rounded="lg"
            class="nav-item"
          >
            <template #prepend>
              <div class="nav-icon">
                <v-icon size="20"> mdi-calendar-clock-outline </v-icon>
              </div>
            </template>

            <v-list-item-title> Attendance </v-list-item-title>
          </v-list-item>
        </v-list>
      </div>

      <!-- =======================================================
           MANAGEMENT
      ======================================================== -->
      <div class="sidebar-section">
        <div class="sidebar-label">MANAGEMENT</div>

        <v-list density="comfortable" nav class="sidebar-list">
          <!-- Users -->
          <v-list-item
            to="/users"
            :active="isActive('/users')"
            rounded="lg"
            class="nav-item"
          >
            <template #prepend>
              <div class="nav-icon">
                <v-icon size="20"> mdi-account-group-outline </v-icon>
              </div>
            </template>

            <v-list-item-title> Users </v-list-item-title>
          </v-list-item>

          <!-- Department -->
          <v-list-item
            to="/department"
            :active="isActive('/department')"
            rounded="lg"
            class="nav-item"
          >
            <template #prepend>
              <div class="nav-icon">
                <v-icon size="20"> mdi-office-building-outline </v-icon>
              </div>
            </template>

            <v-list-item-title> Department </v-list-item-title>
          </v-list-item>
        </v-list>
      </div>

      <!-- =======================================================
           REPORTS
      ======================================================== -->
      <div class="sidebar-section">
        <div class="sidebar-label">REPORTS</div>

        <v-list density="comfortable" nav class="sidebar-list">
          <v-list-item
            to="/reports"
            :active="isActive('/reports')"
            rounded="lg"
            class="nav-item"
          >
            <template #prepend>
              <div class="nav-icon">
                <v-icon size="20"> mdi-file-chart-outline </v-icon>
              </div>
            </template>

            <v-list-item-title> Reports </v-list-item-title>
          </v-list-item>
        </v-list>
      </div>

      <!-- =======================================================
           SIDEBAR FOOTER
      ======================================================== -->
      <template #append>
        <div class="sidebar-footer">
          <div class="sidebar-footer-card">
            <div class="d-flex align-center ga-3">
              <div class="footer-icon">
                <v-icon size="20"> mdi-fingerprint </v-icon>
              </div>

              <div>
                <div class="footer-title">Biometric System</div>

                <div class="footer-subtitle">ZKTeco Integration</div>
              </div>
            </div>
          </div>

          <div class="version-text">SNC Attendance System</div>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- =========================================================
         APP BAR
    ========================================================== -->
    <v-app-bar elevation="0" height="64" class="app-header">
      <!-- Drawer Toggle -->
      <v-app-bar-nav-icon
        variant="text"
        class="menu-button"
        @click.stop="drawer = !drawer"
      />

      <!-- Current Page -->
      <div class="header-page-info">
        <div class="header-title">
          {{ pageTitle }}
        </div>

        <div class="header-subtitle d-none d-sm-block">
          SNC Attendance Management
        </div>
      </div>

      <v-spacer />

      <!-- Desktop Header Actions -->
      <div class="header-actions">
        <!-- System Label -->
        <v-chip
          class="d-none d-md-flex"
          size="small"
          variant="tonal"
          color="success"
        >
          <v-icon start size="15"> mdi-shield-check-outline </v-icon>

          Attendance System
        </v-chip>

        <!-- Divider -->
        <div class="header-divider d-none d-sm-block" />

        <!-- College -->
        <div class="header-school d-none d-sm-flex">
          <v-avatar size="34" class="me-2">
            <v-img src="/SNC-Logo.png" alt="SNC" />
          </v-avatar>

          <div>
            <div class="header-school-name">St. Nicolas College</div>

            <div class="header-school-subtitle">Biometrics</div>
          </div>
        </div>
      </div>
    </v-app-bar>

    <!-- =========================================================
         MAIN CONTENT
    ========================================================== -->
    <v-main class="main-area">
      <v-container fluid class="main-container">
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
//@ts-nocheck
import { useDisplay } from "vuetify";

/*
|--------------------------------------------------------------------------
| Route
|--------------------------------------------------------------------------
*/

const route = useRoute();

/*
|--------------------------------------------------------------------------
| Display
|--------------------------------------------------------------------------
*/

const { mobile } = useDisplay();

/*
|--------------------------------------------------------------------------
| Drawer
|--------------------------------------------------------------------------
*/

const drawer = ref(true);

/*
 * Automatically close the navigation
 * drawer on mobile devices.
 */
watch(
  mobile,
  (value) => {
    drawer.value = !value;
  },
  {
    immediate: true,
  },
);

/*
|--------------------------------------------------------------------------
| Active Navigation
|--------------------------------------------------------------------------
*/

const isActive = (path: string) => {
  /*
   * Dashboard must only be active
   * when the exact route is "/".
   */
  if (path === "/") {
    return route.path === "/";
  }

  return route.path === path || route.path.startsWith(`${path}/`);
};

/*
|--------------------------------------------------------------------------
| Page Title
|--------------------------------------------------------------------------
*/

const pageTitle = computed(() => {
  if (route.path === "/") {
    return "Dashboard";
  }

  if (route.path.startsWith("/attendance")) {
    return "Attendance";
  }

  if (route.path.startsWith("/users")) {
    return "Users";
  }

  if (route.path.startsWith("/department")) {
    return "Departments";
  }

  if (route.path.startsWith("/reports")) {
    return "Reports";
  }

  return "SNC Attendance System";
});
</script>

<style scoped>
/* =========================================================
   APPLICATION
========================================================= */

.app-shell {
  background: #f7f8fa;
}

/* =========================================================
   SIDEBAR
========================================================= */

.app-sidebar {
  border-right: 1px solid #e8eaed !important;
  background: #ffffff !important;
}

:deep(.app-sidebar .v-navigation-drawer__content) {
  display: flex;
  flex-direction: column;
}

/* =========================================================
   BRAND
========================================================= */

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 82px;
  padding: 16px 18px;
}

.brand-logo {
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-content {
  min-width: 0;
}

.brand-title {
  font-size: 0.92rem;
  font-weight: 750;
  line-height: 1.25;
  color: #1f2937;
}

.brand-subtitle {
  margin-top: 3px;
  font-size: 0.72rem;
  color: #8a919c;
}

/* =========================================================
   SIDEBAR SECTION
========================================================= */

.sidebar-section {
  padding: 15px 12px 0;
}

.sidebar-label {
  padding: 0 12px 7px;
  color: #a0a7b2;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.09em;
}

.sidebar-list {
  padding: 0 !important;
}

/* =========================================================
   NAVIGATION
========================================================= */

.nav-item {
  min-height: 46px !important;
  margin-bottom: 4px;
  color: #5f6671;
  font-size: 0.86rem;
  font-weight: 550;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.nav-item:hover {
  background: #f5f8f6;
  color: #15803d;
}

:deep(.nav-item.v-list-item--active) {
  background: #ecfdf3 !important;
  color: #15803d !important;
}

:deep(.nav-item.v-list-item--active::before) {
  opacity: 0 !important;
}

:deep(.nav-item.v-list-item--active .v-list-item-title) {
  font-weight: 700;
}

.nav-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;

  display: flex;
  align-items: center;
  justify-content: center;

  color: #8b939e;
}

.nav-item:hover .nav-icon {
  color: #15803d;
}

:deep(.nav-item.v-list-item--active .nav-icon) {
  background: #dff7e8;
  color: #15803d;
}

/* =========================================================
   SIDEBAR FOOTER
========================================================= */

.sidebar-footer {
  padding: 14px;
}

.sidebar-footer-card {
  padding: 12px;
  border: 1px solid #edf0ee;
  border-radius: 12px;
  background: #f9fbfa;
}

.footer-icon {
  width: 36px;
  height: 36px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 10px;

  background: #e7f8ed;
  color: #15803d;
}

.footer-title {
  font-size: 0.76rem;
  font-weight: 700;
  color: #374151;
}

.footer-subtitle {
  margin-top: 2px;
  font-size: 0.66rem;
  color: #9ca3af;
}

.version-text {
  margin-top: 12px;
  text-align: center;

  color: #b0b6bf;

  font-size: 0.65rem;
}

/* =========================================================
   APP HEADER
========================================================= */

.app-header {
  border-bottom: 1px solid #e8eaed !important;
  background: rgba(255, 255, 255, 0.97) !important;
  backdrop-filter: blur(10px);
}

.menu-button {
  margin-left: 4px;
}

.header-page-info {
  margin-left: 6px;
}

.header-title {
  color: #1f2937;
  font-size: 0.95rem;
  font-weight: 700;
}

.header-subtitle {
  margin-top: 1px;
  color: #9ca3af;
  font-size: 0.68rem;
}

.header-actions {
  display: flex;
  align-items: center;
  padding-right: 14px;
}

.header-divider {
  width: 1px;
  height: 30px;
  margin: 0 16px;
  background: #e6e8eb;
}

.header-school {
  align-items: center;
}

.header-school-name {
  color: #374151;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1.2;
}

.header-school-subtitle {
  margin-top: 2px;
  color: #9ca3af;
  font-size: 0.65rem;
}

/* =========================================================
   MAIN CONTENT
========================================================= */

.main-area {
  background: #f7f8fa;
}

.main-container {
  padding: 0 !important;
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 960px) {
  .sidebar-brand {
    min-height: 72px;
  }
}

@media (max-width: 600px) {
  .header-actions {
    padding-right: 6px;
  }

  .header-title {
    font-size: 0.88rem;
  }
}
</style>
