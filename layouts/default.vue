<template>
  <v-app class="app-shell">
    <!-- =========================================================
         NAVIGATION DRAWER
    ========================================================== -->
    <v-navigation-drawer
      v-model="drawer"
      :temporary="mobile"
      :permanent="!mobile"
      :rail="!mobile && rail"
      :rail-width="84"
      width="292"
      class="app-sidebar"
    >
      <!-- =======================================================
           BRAND
      ======================================================== -->
      <div class="sidebar-brand">
        <div class="brand-logo-wrap">
          <div class="brand-logo-ring">
            <v-img
              src="/SNC-Logo.png"
              alt="St. Nicolas College"
              width="46"
              height="46"
              contain
              class="brand-logo-image"
            />
          </div>
        </div>

        <div v-if="!rail || mobile" class="brand-content">
          <div class="brand-title">St. Nicolas College</div>

          <div class="brand-subtitle">Attendance Management System</div>
        </div>

        <v-spacer v-if="!rail || mobile" />

        <v-btn
          v-if="mobile"
          icon
          variant="text"
          size="small"
          class="drawer-close-btn"
          @click="drawer = false"
        >
          <v-icon size="20"> mdi-close </v-icon>
        </v-btn>
      </div>

      <!-- Brand Accent -->
      <div class="brand-accent-line" />

      <!-- =======================================================
           NAVIGATION
      ======================================================== -->
      <div class="sidebar-navigation">
        <template v-for="section in navigationSections" :key="section.label">
          <div class="sidebar-section">
            <div v-if="!rail || mobile" class="sidebar-label">
              {{ section.label }}
            </div>

            <div v-else class="sidebar-label-rail">
              <span />
            </div>

            <v-list nav density="comfortable" class="sidebar-list">
              <v-list-item
                v-for="item in section.items"
                :key="item.path"
                :to="item.path"
                :active="isActive(item.path)"
                rounded="lg"
                class="nav-item"
                @click="handleNavigation"
              >
                <template #prepend>
                  <div class="nav-icon">
                    <v-icon size="20">
                      {{ item.icon }}
                    </v-icon>
                  </div>
                </template>

                <v-list-item-title v-if="!rail || mobile" class="nav-title">
                  {{ item.title }}
                </v-list-item-title>

                <template v-if="!rail || mobile" #append>
                  <v-icon
                    v-if="isActive(item.path)"
                    size="16"
                    class="active-chevron"
                  >
                    mdi-chevron-right
                  </v-icon>
                </template>

                <v-tooltip
                  v-if="rail && !mobile"
                  activator="parent"
                  location="end"
                  open-delay="350"
                >
                  {{ item.title }}
                </v-tooltip>
              </v-list-item>
            </v-list>
          </div>
        </template>
      </div>

      <!-- =======================================================
           FOOTER
      ======================================================== -->
      <template #append>
        <div class="sidebar-footer">
          <div
            class="system-footer-card"
            :class="{
              'system-footer-rail': rail && !mobile,
            }"
          >
            <div class="system-footer-icon">
              <v-icon size="21"> mdi-fingerprint </v-icon>
            </div>

            <div v-if="!rail || mobile" class="system-footer-content">
              <div class="system-footer-title">Biometric System</div>

              <div class="system-footer-subtitle">ZKTeco Integration</div>
            </div>
          </div>

          <div v-if="!rail || mobile" class="footer-version">
            SNC Attendance

            <span> v{{ appVersion }} </span>
          </div>

          <div v-else class="footer-version-rail">v{{ appVersion }}</div>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- =========================================================
         APP BAR
    ========================================================== -->
    <v-app-bar elevation="0" height="76" class="app-header">
      <!-- Left -->
      <div class="appbar-left">
        <v-btn
          icon
          variant="text"
          size="small"
          class="menu-button"
          @click="toggleNavigation"
        >
          <v-icon size="22">
            {{ mobile ? "mdi-menu" : rail ? "mdi-menu-open" : "mdi-menu" }}
          </v-icon>

          <v-tooltip activator="parent" location="bottom">
            {{
              mobile
                ? "Open navigation"
                : rail
                  ? "Expand sidebar"
                  : "Collapse sidebar"
            }}
          </v-tooltip>
        </v-btn>

        <!-- Current Page -->
        <div class="page-identity">
          <div class="page-icon-wrap">
            <v-icon size="21">
              {{ pageMeta.icon }}
            </v-icon>
          </div>

          <div class="page-text">
            <div class="page-title">
              {{ pageMeta.title }}
            </div>

            <div class="page-subtitle d-none d-sm-block">
              {{ pageMeta.subtitle }}
            </div>
          </div>
        </div>
      </div>

      <v-spacer />

      <!-- Right -->
      <!-- =======================================================
     APP BAR RIGHT
======================================================== -->
      <div class="appbar-right">
        <!-- Biometric System -->
        <v-chip
          class="system-chip d-none d-lg-flex"
          size="small"
          variant="flat"
        >
          <v-icon start size="15"> mdi-shield-check-outline </v-icon>

          Biometric Attendance
        </v-chip>

        <div class="appbar-divider d-none d-sm-block" />

        <!-- =====================================================
       USER ACCOUNT
  ====================================================== -->
        <v-menu
          v-model="accountMenu"
          location="bottom end"
          :close-on-content-click="true"
          offset="10"
        >
          <template #activator="{ props }">
            <button v-bind="props" type="button" class="account-button">
              <!-- Avatar -->
              <div class="account-avatar">
                {{ initials }}
              </div>

              <!-- User Info -->
              <div class="account-info d-none d-sm-block">
                <div class="account-name">
                  {{ authUser?.username || "User" }}
                </div>

                <div class="account-role">
                  {{ roleName }}
                </div>
              </div>

              <v-icon size="17" class="account-chevron d-none d-sm-flex">
                {{ accountMenu ? "mdi-chevron-up" : "mdi-chevron-down" }}
              </v-icon>
            </button>
          </template>

          <!-- ===================================================
         ACCOUNT MENU
    ==================================================== -->
          <v-card width="290" elevation="8" class="account-menu-card">
            <!-- User Header -->
            <div class="account-menu-header">
              <div class="account-menu-avatar">
                {{ initials }}
              </div>

              <div class="account-menu-user">
                <div class="account-menu-name">
                  {{ authUser?.username || "User" }}
                </div>

                <div class="account-menu-email">
                  {{ authUser?.email || "No email" }}
                </div>
              </div>
            </div>

            <!-- Role -->
            <div class="account-role-section">
              <div class="account-role-label">ACCOUNT ROLE</div>

              <v-chip
                size="small"
                variant="tonal"
                color="success"
                class="role-chip"
              >
                <v-icon start size="14"> mdi-shield-account-outline </v-icon>

                {{ roleName }}
              </v-chip>
            </div>

            <v-divider />

            <!-- Menu -->
            <v-list density="comfortable" class="account-menu-list">
              <v-list-item
                rounded="lg"
                class="account-menu-item"
                @click="refreshAccount"
              >
                <template #prepend>
                  <v-icon size="19" color="grey-darken-1">
                    mdi-account-sync-outline
                  </v-icon>
                </template>

                <v-list-item-title> Refresh Account </v-list-item-title>
              </v-list-item>

              <v-list-item
                rounded="lg"
                class="account-menu-item logout-item"
                :disabled="authLoading"
                @click="handleLogout"
              >
                <template #prepend>
                  <v-icon size="19" color="error"> mdi-logout </v-icon>
                </template>

                <v-list-item-title class="text-error">
                  Logout
                </v-list-item-title>
              </v-list-item>
            </v-list>

            <v-divider />

            <!-- Footer -->
            <div class="account-menu-footer">
              <v-icon size="14" class="me-1"> mdi-shield-check-outline </v-icon>

              Secure Strapi Authentication
            </div>
          </v-card>
        </v-menu>
      </div>
    </v-app-bar>

    <!-- =========================================================
         MAIN CONTENT
    ========================================================== -->
    <v-main class="main-area">
      <div class="main-background-accent" />

      <v-container fluid class="main-container">
        <div :key="route.path" class="page-content">
          <slot />
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
//@ts-nocheck
import { useDisplay } from "vuetify";

const route = useRoute();

const config = useRuntimeConfig();

const appVersion = computed(() => {
  return String(config.public.appVersion ?? "1.0.0");
});

const { mobile } = useDisplay();

/*
|--------------------------------------------------------------------------
| Drawer
|--------------------------------------------------------------------------
*/

const drawer = ref(true);

const rail = ref(false);

/*
|--------------------------------------------------------------------------
| Navigation Types
|--------------------------------------------------------------------------
*/

interface NavigationItem {
  title: string;
  path: string;
  icon: string;
}

interface NavigationSection {
  label: string;
  items: NavigationItem[];
}

/*
|--------------------------------------------------------------------------
| Navigation
|--------------------------------------------------------------------------
*/

const navigationSections: NavigationSection[] = [
  {
    label: "MAIN MENU",

    items: [
      {
        title: "Dashboard",
        path: "/",
        icon: "mdi-view-dashboard-outline",
      },

      {
        title: "Attendance",
        path: "/attendance",
        icon: "mdi-calendar-clock-outline",
      },
    ],
  },

  {
    label: "MANAGEMENT",

    items: [
      {
        title: "Users",
        path: "/users",
        icon: "mdi-account-group-outline",
      },

      {
        title: "Departments",
        path: "/department",
        icon: "mdi-office-building-outline",
      },
    ],
  },

  {
    label: "REPORTS",

    items: [
      {
        title: "Reports",
        path: "/reports",
        icon: "mdi-file-chart-outline",
      },
    ],
  },
];

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

const {
  user: authUser,
  loading: authLoading,
  roleName,
  initials,
  fetchUser,
  logout,
} = useAuth();

const accountMenu = ref(false);

/*
|--------------------------------------------------------------------------
| Load Account
|--------------------------------------------------------------------------
*/

const loadAccount = async () => {
  try {
    await fetchUser();
  } catch (error) {
    console.error("Unable to load authenticated user:", error);
  }
};

/*
|--------------------------------------------------------------------------
| Refresh Account
|--------------------------------------------------------------------------
*/

const refreshAccount = async () => {
  accountMenu.value = false;

  await loadAccount();
};

/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/

const handleLogout = async () => {
  accountMenu.value = false;

  try {
    await logout();
  } catch (error) {
    console.error("Logout error:", error);
  }
};

/*
|--------------------------------------------------------------------------
| Responsive Drawer
|--------------------------------------------------------------------------
*/

watch(
  mobile,

  (value) => {
    if (value) {
      drawer.value = false;

      rail.value = false;
    } else {
      drawer.value = true;
    }
  },

  {
    immediate: true,
  },
);

/*
|--------------------------------------------------------------------------
| Toggle
|--------------------------------------------------------------------------
*/

const toggleNavigation = () => {
  if (mobile.value) {
    drawer.value = !drawer.value;
    return;
  }
  rail.value = !rail.value;
};

/*
|--------------------------------------------------------------------------
| Mobile Navigation
|--------------------------------------------------------------------------
*/

const handleNavigation = () => {
  if (mobile.value) {
    drawer.value = false;
  }
};

/*
|--------------------------------------------------------------------------
| Active Route
|--------------------------------------------------------------------------
*/

const isActive = (path: string) => {
  if (path === "/") {
    return route.path === "/";
  }

  return route.path === path || route.path.startsWith(`${path}/`);
};

/*
|--------------------------------------------------------------------------
| Page Metadata
|--------------------------------------------------------------------------
*/

const pageMeta = computed(() => {
  if (route.path === "/") {
    return {
      title: "Dashboard",

      subtitle: "Overview of attendance and biometric activity",

      icon: "mdi-view-dashboard-outline",
    };
  }

  if (route.path.startsWith("/attendance")) {
    return {
      title: "Attendance",

      subtitle: "Monitor daily time records and employee attendance",

      icon: "mdi-calendar-clock-outline",
    };
  }

  if (/^\/users\/[^/]+/.test(route.path)) {
    return {
      title: "User Profile",

      subtitle: "Employee profile, schedule and attendance history",

      icon: "mdi-account-circle-outline",
    };
  }

  if (route.path.startsWith("/users")) {
    return {
      title: "Users",

      subtitle: "Manage biometric users and employee profiles",

      icon: "mdi-account-group-outline",
    };
  }

  if (route.path.startsWith("/department")) {
    return {
      title: "Departments",

      subtitle: "Manage department directory and organization",

      icon: "mdi-office-building-outline",
    };
  }

  if (route.path.startsWith("/reports")) {
    return {
      title: "Reports",

      subtitle: "Generate attendance reports and late summaries",

      icon: "mdi-file-chart-outline",
    };
  }

  return {
    title: "Attendance System",

    subtitle: "St. Nicolas College",

    icon: "mdi-fingerprint",
  };
});

/*
|--------------------------------------------------------------------------
| Route Watcher
|--------------------------------------------------------------------------
*/

watch(
  () => route.path,

  () => {
    if (mobile.value) {
      drawer.value = false;
    }
  },
);

onMounted(async () => {
  /*
   * Middleware already validated
   * authentication, but the layout needs
   * the user information for the AppBar.
   */

  if (!authUser.value) {
    await loadAccount();
  }
});
</script>

<style scoped>
/* =========================================================
   APPLICATION
========================================================= */

.app-shell {
  background: #f7f9f8;
}

/* =========================================================
   NAVIGATION DRAWER
========================================================= */

.app-sidebar {
  position: relative;

  overflow: hidden;

  isolation: isolate;

  border-right: 1px solid #dfe5e1 !important;

  background: #ffffff !important;

  box-shadow: 5px 0 24px rgba(15, 23, 42, 0.045) !important;
}

/*
 * Make Vuetify drawer content transparent
 * so the biometric artwork remains visible.
 */
:deep(.app-sidebar .v-navigation-drawer__content) {
  position: relative;

  z-index: 1;

  display: flex;

  flex-direction: column;

  background: transparent !important;
}

/* =========================================================
   BIOMETRIC DRAWER BACKGROUND
========================================================= */

.app-sidebar::before {
  content: "";

  position: absolute;

  inset: 0;

  z-index: -2;

  /*
   * White overlay + biometric artwork.
   *
   * The overlay is intentionally around
   * 78–84% so the fingerprint remains
   * visible without interfering with text.
   */
  background-image:
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.82) 0%,

      rgba(255, 255, 255, 0.84) 27%,

      rgba(255, 255, 255, 0.79) 52%,

      rgba(249, 252, 250, 0.76) 100%
    ),
    url("/biometric-drawer-bg.png");

  background-repeat: no-repeat, no-repeat;

  /*
   * Height slightly larger than drawer
   * so fingerprint fills the lower area.
   */
  background-size:
    cover,
    auto 108%;

  /*
   * Shift artwork slightly right.
   */
  background-position:
    center,
    56% center;
}

/*
 * Additional ambient green glow.
 */
.app-sidebar::after {
  content: "";

  position: absolute;

  right: -170px;

  bottom: -130px;

  width: 430px;

  height: 430px;

  z-index: -1;

  border-radius: 50%;

  background: radial-gradient(
    circle,
    rgba(22, 163, 74, 0.11) 0%,

    rgba(22, 163, 74, 0.045) 40%,

    transparent 70%
  );

  pointer-events: none;
}

/* =========================================================
   BRAND AREA
========================================================= */

.sidebar-brand {
  min-height: 96px;

  display: flex;

  align-items: center;

  gap: 13px;

  padding: 18px 18px 16px;

  background: rgba(255, 255, 255, 0.72);

  backdrop-filter: blur(10px);

  -webkit-backdrop-filter: blur(10px);
}

.brand-logo-wrap {
  flex-shrink: 0;
}

.brand-logo-ring {
  width: 58px;

  height: 58px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-shrink: 0;

  padding: 4px;

  border: 1px solid #dcefe2;

  border-radius: 15px;

  background: rgba(255, 255, 255, 0.94);

  box-shadow: 0 5px 16px rgba(22, 163, 74, 0.07);
}

.brand-logo-image {
  width: 100%;

  height: 100%;
}

:deep(.brand-logo-image .v-img__img) {
  object-fit: contain !important;
}

.brand-content {
  min-width: 0;
}

.brand-title {
  color: #1f2937;

  font-size: 0.94rem;

  font-weight: 780;

  line-height: 1.25;

  white-space: nowrap;
}

.brand-subtitle {
  margin-top: 4px;

  color: #7d8793;

  font-size: 0.67rem;

  white-space: nowrap;
}

.drawer-close-btn {
  color: #6b7280;
}

/* =========================================================
   BRAND ACCENT
========================================================= */

.brand-accent-line {
  position: relative;

  z-index: 2;

  height: 3px;

  margin: 0 12px;

  border-radius: 20px;

  background: linear-gradient(90deg, #15803d 0%, #22c55e 50%, #86efac 100%);

  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.16);
}

/* =========================================================
   NAVIGATION
========================================================= */

.sidebar-navigation {
  flex: 1;

  padding: 8px 0 18px;

  overflow-y: auto;

  scrollbar-width: thin;

  scrollbar-color: #d8dedb transparent;
}

.sidebar-navigation::-webkit-scrollbar {
  width: 5px;
}

.sidebar-navigation::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-navigation::-webkit-scrollbar-thumb {
  border-radius: 8px;

  background: #d8dedb;
}

/* =========================================================
   SECTION
========================================================= */

.sidebar-section {
  padding: 17px 12px 0;
}

.sidebar-label {
  padding: 0 12px 8px;

  color: #929aa5;

  font-size: 0.62rem;

  font-weight: 750;

  letter-spacing: 0.11em;

  white-space: nowrap;

  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.9);
}

.sidebar-label-rail {
  height: 20px;

  display: flex;

  align-items: center;

  justify-content: center;
}

.sidebar-label-rail span {
  width: 20px;

  height: 1px;

  background: rgba(140, 150, 145, 0.35);
}

.sidebar-list {
  padding: 0 !important;

  background: transparent !important;
}

/* =========================================================
   NAV ITEM
========================================================= */

.nav-item {
  position: relative;

  min-height: 50px !important;

  margin-bottom: 5px;

  border: 1px solid transparent;

  color: #5f6874;

  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;
}

.nav-item:hover {
  transform: translateX(2px);

  border-color: rgba(22, 163, 74, 0.1);

  background: rgba(255, 255, 255, 0.7);

  color: #15803d;

  backdrop-filter: blur(8px);

  -webkit-backdrop-filter: blur(8px);
}

.nav-title {
  font-size: 0.84rem;

  font-weight: 570;
}

/* =========================================================
   NAV ICON
========================================================= */

.nav-icon {
  width: 36px;

  height: 36px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-shrink: 0;

  border-radius: 10px;

  color: #858f9b;

  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.nav-item:hover .nav-icon {
  background: rgba(226, 245, 232, 0.92);

  color: #15803d;
}

/* =========================================================
   ACTIVE NAVIGATION
========================================================= */

:deep(.nav-item.v-list-item--active) {
  border: 1px solid rgba(22, 163, 74, 0.2) !important;

  background: rgba(221, 245, 228, 0.82) !important;

  color: #15803d !important;

  backdrop-filter: blur(10px);

  -webkit-backdrop-filter: blur(10px);

  box-shadow: 0 5px 14px rgba(22, 163, 74, 0.06);
}

:deep(.nav-item.v-list-item--active::before) {
  opacity: 0 !important;
}

:deep(.nav-item.v-list-item--active::after) {
  content: "";

  position: absolute;

  left: -1px;

  top: 10px;

  bottom: 10px;

  width: 4px;

  border-radius: 0 5px 5px 0;

  background: linear-gradient(180deg, #16a34a, #15803d);
}

:deep(.nav-item.v-list-item--active .nav-title) {
  font-weight: 700;
}

:deep(.nav-item.v-list-item--active .nav-icon) {
  background: rgba(216, 242, 225, 0.95);

  color: #15803d;
}

.active-chevron {
  color: #36a55a;
}

/* =========================================================
   RAIL
========================================================= */

:deep(.v-navigation-drawer--rail .sidebar-brand) {
  justify-content: center;

  padding-left: 0;

  padding-right: 0;
}

:deep(.v-navigation-drawer--rail .brand-logo-ring) {
  width: 54px;

  height: 54px;
}

:deep(.v-navigation-drawer--rail .brand-accent-line) {
  margin: 0 20px;
}

:deep(.v-navigation-drawer--rail .nav-item) {
  justify-content: center;

  padding-inline: 12px !important;
}

:deep(.v-navigation-drawer--rail .v-list-item__prepend) {
  margin-inline-end: 0 !important;
}

:deep(.v-navigation-drawer--rail .v-list-item__spacer) {
  width: 0 !important;
}

:deep(.v-navigation-drawer--rail .nav-icon) {
  margin: auto;
}

/* =========================================================
   FOOTER
========================================================= */

.sidebar-footer {
  position: relative;

  z-index: 2;

  padding: 13px;
}

.system-footer-card {
  display: flex;

  align-items: center;

  gap: 11px;

  padding: 12px;

  border: 1px solid rgba(255, 255, 255, 0.82);

  border-radius: 14px;

  background: rgba(255, 255, 255, 0.76);

  backdrop-filter: blur(14px);

  -webkit-backdrop-filter: blur(14px);

  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.07);
}

.system-footer-icon {
  width: 40px;

  height: 40px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-shrink: 0;

  border: 1px solid rgba(22, 163, 74, 0.08);

  border-radius: 11px;

  background: linear-gradient(145deg, #d9f5e2, #eaf9ef);

  color: #15803d;
}

.system-footer-title {
  color: #374151;

  font-size: 0.75rem;

  font-weight: 700;
}

.system-footer-subtitle {
  margin-top: 2px;

  color: #89939e;

  font-size: 0.64rem;
}

.system-footer-rail {
  justify-content: center;

  padding: 8px;
}

.footer-version {
  margin-top: 10px;

  color: #95a09a;

  text-align: center;

  font-size: 0.62rem;
}

.footer-version span {
  margin-left: 4px;

  color: #5f6b65;

  font-weight: 650;
}

.footer-version-rail {
  margin-top: 9px;

  color: #89939e;

  text-align: center;

  font-size: 0.58rem;
}

/* =========================================================
   APP BAR
========================================================= */

.app-header {
  border-bottom: none !important;

  background: linear-gradient(
    135deg,
    #14532d 0%,
    #15803d 52%,
    #16a34a 100%
  ) !important;

  box-shadow: 0 4px 18px rgba(20, 83, 45, 0.16) !important;

  backdrop-filter: blur(16px);
}

/* =========================================================
   APP BAR LEFT
========================================================= */

.appbar-left {
  display: flex;

  align-items: center;

  min-width: 0;
}

.menu-button {
  margin-left: 10px;

  color: rgba(255, 255, 255, 0.92);

  border-radius: 10px;
}

.menu-button:hover {
  background: rgba(255, 255, 255, 0.12);

  color: #ffffff;
}

/* =========================================================
   PAGE IDENTITY
========================================================= */

.page-identity {
  display: flex;

  align-items: center;

  gap: 11px;

  min-width: 0;

  margin-left: 6px;
}

.page-icon-wrap {
  width: 40px;

  height: 40px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-shrink: 0;

  border: 1px solid rgba(255, 255, 255, 0.2);

  border-radius: 11px;

  background: rgba(255, 255, 255, 0.13);

  color: #ffffff;

  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.page-text {
  min-width: 0;
}

.page-title {
  color: #ffffff;

  font-size: 0.98rem;

  font-weight: 750;

  line-height: 1.2;
}

.page-subtitle {
  margin-top: 3px;

  color: rgba(255, 255, 255, 0.72);

  font-size: 0.66rem;

  white-space: nowrap;
}

/* =========================================================
   APP BAR RIGHT
========================================================= */

.appbar-right {
  display: flex;

  align-items: center;

  padding-right: 18px;
}

.system-chip {
  border: 1px solid rgba(255, 255, 255, 0.2);

  background: rgba(255, 255, 255, 0.13) !important;

  color: #ffffff !important;

  font-size: 0.68rem;

  backdrop-filter: blur(8px);
}

.appbar-divider {
  width: 1px;

  height: 32px;

  margin: 0 16px;

  background: rgba(255, 255, 255, 0.2);
}

/* =========================================================
   SCHOOL IDENTITY
========================================================= */

.school-profile {
  display: flex;

  align-items: center;
}

.school-logo {
  width: 42px;

  height: 42px;

  display: flex;

  align-items: center;

  justify-content: center;

  flex-shrink: 0;

  padding: 4px;

  border: 1px solid rgba(255, 255, 255, 0.28);

  border-radius: 12px;

  background: #ffffff;

  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.school-info {
  margin-left: 9px;
}

.school-name {
  color: #ffffff;

  font-size: 0.75rem;

  font-weight: 700;

  line-height: 1.2;

  white-space: nowrap;
}

.school-subtitle {
  margin-top: 2px;

  color: rgba(255, 255, 255, 0.7);

  font-size: 0.62rem;

  white-space: nowrap;
}

/* =========================================================
   MAIN
========================================================= */

.main-area {
  position: relative;

  min-height: 100vh;

  overflow: hidden;

  background: #f7f9f8;
}

.main-background-accent {
  position: absolute;

  top: -190px;

  right: -150px;

  width: 470px;

  height: 470px;

  border-radius: 50%;

  background: radial-gradient(
    circle,
    rgba(34, 197, 94, 0.06),
    rgba(34, 197, 94, 0) 68%
  );

  pointer-events: none;
}

.main-container {
  position: relative;

  z-index: 1;

  padding: 0 !important;
}

.page-content {
  min-height: calc(100vh - 76px);

  animation: page-enter 0.18s ease-out;
}

/* =========================================================
   ACCOUNT BUTTON
========================================================= */

.account-button {
  min-height: 48px;

  display: flex;
  align-items: center;

  gap: 9px;

  padding: 5px 9px 5px 6px;

  border: 1px solid transparent;
  border-radius: 12px;

  background: transparent;

  color: inherit;

  cursor: pointer;

  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
}

.account-button:hover {
  border-color: rgba(255, 255, 255, 0.16);

  background: rgba(255, 255, 255, 0.1);
}

/* =========================================================
   ACCOUNT AVATAR
========================================================= */

.account-avatar {
  width: 38px;
  height: 38px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border: 2px solid rgba(255, 255, 255, 0.32);

  border-radius: 11px;

  background: rgba(255, 255, 255, 0.96);

  color: #15803d;

  font-size: 0.72rem;
  font-weight: 800;

  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.09);
}

/* =========================================================
   ACCOUNT INFO
========================================================= */

.account-info {
  min-width: 100px;

  text-align: left;
}

.account-name {
  max-width: 150px;

  overflow: hidden;

  color: #ffffff;

  font-size: 0.73rem;
  font-weight: 700;

  line-height: 1.2;

  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-role {
  max-width: 150px;

  margin-top: 3px;

  overflow: hidden;

  color: rgba(255, 255, 255, 0.68);

  font-size: 0.61rem;

  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-chevron {
  color: rgba(255, 255, 255, 0.66);
}

/* =========================================================
   ACCOUNT MENU
========================================================= */

.account-menu-card {
  overflow: hidden;

  border: 1px solid #e7ebe8;

  border-radius: 14px !important;

  background: #ffffff;
}

/* =========================================================
   ACCOUNT MENU HEADER
========================================================= */

.account-menu-header {
  display: flex;
  align-items: center;

  gap: 12px;

  padding: 18px 18px 15px;

  background: linear-gradient(145deg, #f7fcf8, #ffffff);
}

.account-menu-avatar {
  width: 46px;
  height: 46px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border-radius: 13px;

  background: linear-gradient(145deg, #daf3e2, #edf9f1);

  color: #15803d;

  font-size: 0.82rem;
  font-weight: 800;
}

.account-menu-user {
  min-width: 0;
}

.account-menu-name {
  max-width: 190px;

  overflow: hidden;

  color: #1f2937;

  font-size: 0.86rem;
  font-weight: 750;

  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-menu-email {
  max-width: 190px;

  margin-top: 3px;

  overflow: hidden;

  color: #929aa5;

  font-size: 0.66rem;

  text-overflow: ellipsis;
  white-space: nowrap;
}

/* =========================================================
   ACCOUNT ROLE
========================================================= */

.account-role-section {
  padding: 12px 18px 14px;
}

.account-role-label {
  margin-bottom: 7px;

  color: #a0a7b0;

  font-size: 0.59rem;
  font-weight: 750;

  letter-spacing: 0.09em;
}

.role-chip {
  font-size: 0.65rem;
}

/* =========================================================
   ACCOUNT MENU LIST
========================================================= */

.account-menu-list {
  padding: 7px !important;
}

.account-menu-item {
  min-height: 43px !important;

  margin-bottom: 2px;

  color: #4b5563;

  font-size: 0.76rem;
}

.account-menu-item:hover {
  background: #f6f8f7;
}

.logout-item:hover {
  background: #fff5f5;
}

/* =========================================================
   ACCOUNT MENU FOOTER
========================================================= */

.account-menu-footer {
  display: flex;
  align-items: center;
  justify-content: center;

  padding: 10px;

  background: #fafbfa;

  color: #9ca3af;

  font-size: 0.58rem;
}

@keyframes page-enter {
  from {
    opacity: 0;

    transform: translateY(3px);
  }

  to {
    opacity: 1;

    transform: translateY(0);
  }
}

/* =========================================================
   TABLET
========================================================= */

@media (max-width: 960px) {
  .sidebar-brand {
    min-height: 84px;
  }

  .brand-accent-line {
    margin: 0 12px;
  }

  .page-icon-wrap {
    width: 36px;

    height: 36px;
  }

  .appbar-right {
    padding-right: 12px;
  }

  /*
   * Slightly adjust biometric artwork
   * on smaller drawer displays.
   */
  .app-sidebar::before {
    background-size:
      cover,
      auto 105%;

    background-position:
      center,
      58% center;
  }
}

/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 600px) {
  .app-header {
    height: 66px !important;
  }

  .menu-button {
    margin-left: 3px;
  }

  .page-identity {
    gap: 8px;

    margin-left: 1px;
  }

  .page-icon-wrap {
    width: 34px;

    height: 34px;

    border-radius: 9px;
  }

  .page-title {
    max-width: 160px;

    overflow: hidden;

    font-size: 0.87rem;

    text-overflow: ellipsis;

    white-space: nowrap;
  }

  .appbar-right {
    padding-right: 7px;
  }

  .school-logo {
    width: 36px;

    height: 36px;

    padding: 3px;

    border-radius: 10px;
  }

  .page-content {
    min-height: calc(100vh - 66px);
  }

  .account-button {
    padding: 3px;
  }

  .account-avatar {
    width: 34px;
    height: 34px;

    border-radius: 9px;
  }
}

/* =========================================================
   REDUCED MOTION
========================================================= */

@media (prefers-reduced-motion: reduce) {
  .page-content,
  .nav-item {
    animation: none;

    transition: none;
  }
}
</style>
