<template>
  <v-app class="login-app">
    <main class="login-page">
      <!-- =====================================================
           LEFT / LOGIN FORM
      ====================================================== -->
      <section class="login-section">
        <div class="login-container">
          <!-- =================================================
               MOBILE / TABLET BRAND
          ================================================== -->
          <div class="mobile-brand d-lg-none">
            <div class="mobile-logo">
              <v-img
                src="/SNC-Logo.png"
                alt="St. Nicolas College"
                width="52"
                height="52"
                contain
              />
            </div>
            <div>
              <div class="mobile-school-name">St. Nicolas College</div>

              <div class="mobile-system-name">Attendance Management System</div>
            </div>
          </div>

          <!-- =================================================
               LOGIN HEADER
          ================================================== -->
          <div class="login-header">
            <div class="login-icon">
              <v-icon size="25"> mdi-shield-account-outline </v-icon>
            </div>
            <h1 class="login-title">Welcome Back</h1>
            <p class="login-description">
              Sign in to access the Attendance Management System.
            </p>
          </div>

          <!-- =================================================
               LOGIN FORM
          ================================================== -->
          <v-form
            ref="loginForm"
            v-model="formValid"
            @submit.prevent="handleLogin"
          >
            <!-- Username -->
            <div class="field-group">
              <label class="field-label"> Username </label>

              <v-text-field
                v-model="username"
                :rules="rules.username"
                placeholder="Enter your username"
                prepend-inner-icon="mdi-account-outline"
                variant="outlined"
                density="comfortable"
                autocomplete="username"
                hide-details="auto"
                class="login-input"
                :disabled="loading"
              />
            </div>

            <!-- Password -->
            <div class="field-group">
              <div class="password-label-row">
                <label class="field-label"> Password </label>
              </div>

              <v-text-field
                v-model="password"
                :rules="rules.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter your password"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="
                  showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
                "
                variant="outlined"
                density="comfortable"
                autocomplete="current-password"
                hide-details="auto"
                class="login-input"
                :disabled="loading"
                @click:append-inner="showPassword = !showPassword"
              />
            </div>

            <!-- Remember -->
            <div class="form-options">
              <v-checkbox
                v-model="rememberMe"
                color="primary"
                density="compact"
                hide-details
                class="remember-checkbox"
              >
                <template #label>
                  <span class="remember-label"> Remember me </span>
                </template>
              </v-checkbox>
            </div>

            <!-- Error -->
            <v-alert
              v-if="errorMessage"
              type="error"
              variant="tonal"
              density="comfortable"
              class="login-alert mb-4"
              closable
              @click:close="errorMessage = ''"
            >
              {{ errorMessage }}
            </v-alert>

            <!-- Sign In -->
            <v-btn
              type="submit"
              block
              color="primary"
              size="large"
              variant="flat"
              class="login-button"
              :loading="loading"
            >
              <v-icon start size="19"> mdi-login </v-icon>

              Sign In
            </v-btn>
          </v-form>

          <!-- =================================================
               SECURITY INFORMATION
          ================================================== -->
          <div class="security-note">
            <div class="security-icon">
              <v-icon size="18"> mdi-shield-check-outline </v-icon>
            </div>

            <div>
              <div class="security-title">Secure Access</div>

              <div class="security-description">
                Access is restricted to authorized personnel only.
              </div>
            </div>
          </div>

          <!-- =================================================
               FOOTER
          ================================================== -->
          <div class="login-footer">
            <div>St. Nicolas College</div>

            <div class="footer-version">
              Attendance System
              <span> v{{ appVersion }} </span>
            </div>
          </div>
        </div>
      </section>

      <!-- =====================================================
           RIGHT / BIOMETRIC PANEL
      ====================================================== -->
      <section class="visual-section d-none d-lg-flex">
        <div class="visual-overlay" />

        <!-- Decorative Elements -->
        <div class="visual-circle visual-circle-one" />
        <div class="visual-circle visual-circle-two" />

        <!-- School Branding -->
        <div class="visual-brand">
          <div class="visual-logo">
            <v-img
              src="/SNC-Logo.png"
              alt="St. Nicolas College"
              width="62"
              height="62"
              contain
            />
          </div>

          <div>
            <div class="visual-school-name">St. Nicolas College</div>

            <div class="visual-system-name">Attendance Management System</div>
          </div>
        </div>

        <!-- Center Content -->
        <div class="visual-content">
          <div class="biometric-icon-container">
            <div class="scan-ring ring-one" />
            <div class="scan-ring ring-two" />
            <div class="scan-ring ring-three" />

            <div class="fingerprint-icon">
              <v-icon size="78"> mdi-fingerprint </v-icon>
            </div>

            <div class="scan-line" />
          </div>

          <div class="visual-eyebrow">BIOMETRIC ATTENDANCE</div>

          <h2 class="visual-title">
            Smart Attendance.
            <br />
            Secure Access.
          </h2>

          <p class="visual-description">
            A centralized attendance management platform powered by biometric
            technology for accurate and reliable employee time records.
          </p>

          <!-- Feature Chips -->
          <div class="visual-features">
            <div class="feature-item">
              <v-icon size="18"> mdi-fingerprint </v-icon>

              <span> Biometric Integration </span>
            </div>

            <div class="feature-item">
              <v-icon size="18"> mdi-clock-check-outline </v-icon>

              <span> Real-Time Attendance </span>
            </div>

            <div class="feature-item">
              <v-icon size="18"> mdi-file-chart-outline </v-icon>

              <span> Attendance Reports </span>
            </div>
          </div>
        </div>

        <!-- Bottom -->
        <div class="visual-footer">
          <div class="device-status">
            <span class="status-dot" />

            ZKTeco Biometric Integration
          </div>
        </div>
      </section>
    </main>

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
  </v-app>
</template>

<script setup lang="ts">
/*
|--------------------------------------------------------------------------
| No Default Layout
|--------------------------------------------------------------------------
|
| Login page should not display the navigation drawer or AppBar.
|
*/

definePageMeta({
  layout: false,
});

/*
|--------------------------------------------------------------------------
| Runtime Config
|--------------------------------------------------------------------------
*/

const config = useRuntimeConfig();

const appVersion = computed(() => {
  return String(config.public.appVersion ?? "1.0.0");
});

/*
|--------------------------------------------------------------------------
| Form
|--------------------------------------------------------------------------
*/

const loginForm = ref<any>(null);

const formValid = ref(false);

const username = ref("");

const password = ref("");

const showPassword = ref(false);

const rememberMe = ref(false);

const loading = ref(false);

const errorMessage = ref("");

/*
|--------------------------------------------------------------------------
| Snackbar
|--------------------------------------------------------------------------
*/

const snackbar = ref(false);

const snackbarText = ref("");

const snackbarColor = ref("success");

const snackbarIcon = ref("mdi-check-circle-outline");

/*
|--------------------------------------------------------------------------
| Rules
|--------------------------------------------------------------------------
*/

const rules = {
  username: [(value: string) => !!value?.trim() || "Username is required"],

  password: [(value: string) => !!value || "Password is required"],
};

/*
|--------------------------------------------------------------------------
| Snackbar Helper
|--------------------------------------------------------------------------
*/

const showSnackbar = (
  message: string,
  color = "success",
  icon = "mdi-check-circle-outline",
) => {
  snackbarText.value = message;
  snackbarColor.value = color;
  snackbarIcon.value = icon;
  snackbar.value = true;
};

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/

const handleLogin = async () => {
  errorMessage.value = "";
  const validation = await loginForm.value?.validate();
  if (!validation?.valid) {
    return;
  }
  loading.value = true;

  try {
    await $fetch("/api/auth/login", {
      method: "POST",
      body: {
        identifier: username.value.trim(),
        password: password.value,
        remember: rememberMe.value,
      },
    });

    showSnackbar("Login successful.", "success", "mdi-check-circle-outline");

    /*
     * Go to dashboard.
     */
    await navigateTo("/");
  } catch (error: any) {
    console.error("Login failed:", error);

    errorMessage.value =
      error?.data?.statusMessage ||
      error?.data?.message ||
      error?.statusMessage ||
      "Invalid username or password.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* =========================================================
   APPLICATION
========================================================= */

.login-app {
  min-height: 100vh;
  background: #f6f8f7;
}

.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns:
    minmax(440px, 46%)
    1fr;
  background: #ffffff;
}

/* =========================================================
   LEFT SECTION
========================================================= */

.login-section {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 72px;
  background: linear-gradient(145deg, #ffffff 0%, #fbfdfb 55%, #f6faf7 100%);
}

.login-section::before {
  content: "";
  position: absolute;
  top: -180px;
  left: -180px;
  width: 420px;
  height: 420px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(22, 163, 74, 0.05), transparent 70%);
  pointer-events: none;
}

.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 430px;
}

/* =========================================================
   MOBILE BRAND
========================================================= */

.mobile-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 42px;
}

.mobile-logo {
  width: 62px;
  height: 62px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border: 1px solid #def0e3;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 5px 16px rgba(22, 163, 74, 0.07);
}

.mobile-school-name {
  color: #1f2937;
  font-size: 0.95rem;
  font-weight: 750;
}

.mobile-system-name {
  margin-top: 3px;
  color: #8a929d;
  font-size: 0.68rem;
}

/* =========================================================
   LOGIN HEADER
========================================================= */

.login-header {
  margin-bottom: 32px;
}

.login-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  border: 1px solid #d8efdf;
  border-radius: 14px;
  background: linear-gradient(145deg, #eaf9ef, #f5fcf7);
  color: #15803d;
}

.login-title {
  margin: 0;
  color: #1f2937;
  font-size: 2rem;
  font-weight: 780;
  line-height: 1.15;
}

.login-description {
  margin: 10px 0 0;
  color: #7c8591;
  font-size: 0.9rem;
  line-height: 1.6;
}

/* =========================================================
   FORM
========================================================= */

.field-group {
  margin-bottom: 20px;
}

.field-label {
  display: block;
  margin-bottom: 8px;
  color: #374151;
  font-size: 0.77rem;
  font-weight: 650;
}

.password-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

:deep(.login-input .v-field) {
  min-height: 52px;
  border-radius: 11px;
  background: #ffffff;
}

:deep(.login-input .v-field--focused) {
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.06);
}

:deep(.login-input .v-field__prepend-inner) {
  color: #9099a4;
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: -4px 0 20px;
}

.remember-checkbox {
  margin-left: -8px;
}

.remember-label {
  color: #5f6874;

  font-size: 0.76rem;
}

/* =========================================================
   ERROR
========================================================= */

.login-alert {
  border-radius: 10px;
}

/* =========================================================
   LOGIN BUTTON
========================================================= */

.login-button {
  height: 52px;
  border-radius: 11px;
  text-transform: none;
  font-size: 0.88rem;
  font-weight: 700;
  letter-spacing: 0;
  box-shadow: 0 7px 18px rgba(22, 163, 74, 0.17) !important;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.login-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(22, 163, 74, 0.22) !important;
}

/* =========================================================
   SECURITY NOTE
========================================================= */

.security-note {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-top: 28px;
  padding: 13px 14px;
  border: 1px solid #e5ebe7;
  border-radius: 11px;
  background: rgba(247, 250, 248, 0.9);
}

.security-icon {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 9px;
  background: #e6f6eb;
  color: #15803d;
}

.security-title {
  color: #4b5563;
  font-size: 0.71rem;
  font-weight: 700;
}

.security-description {
  margin-top: 2px;
  color: #9ca3af;
  font-size: 0.65rem;
}

/* =========================================================
   LOGIN FOOTER
========================================================= */

.login-footer {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-top: 36px;
  padding-top: 20px;
  border-top: 1px solid #edf0ee;
  color: #a0a7b0;
  font-size: 0.64rem;
}

.footer-version span {
  margin-left: 3px;
  color: #6b7280;
  font-weight: 650;
}

/* =========================================================
   BIOMETRIC VISUAL
========================================================= */

.visual-section {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 42px 48px;
  background: #14532d;
  color: #ffffff;
  isolation: isolate;
}

/*
 * Biometric artwork.
 */
.visual-section::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -3;
  background-image: url("/biometric-drawer-bg.png");
  background-size: cover;
  background-position: center;
  opacity: 0.55;
}

/*
 * Green treatment over the image.
 */
.visual-overlay {
  position: absolute;
  inset: 0;
  z-index: -2;
  background: linear-gradient(
    135deg,
    rgba(20, 83, 45, 0.94) 0%,
    rgba(21, 128, 61, 0.88) 52%,
    rgba(22, 163, 74, 0.83) 100%
  );
}

/* =========================================================
   VISUAL CIRCLES
========================================================= */

.visual-circle {
  position: absolute;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  pointer-events: none;
}

.visual-circle-one {
  width: 520px;
  height: 520px;
  top: -280px;
  right: -170px;
}

.visual-circle-two {
  width: 720px;
  height: 720px;
  right: -370px;
  bottom: -350px;
}

/* =========================================================
   VISUAL BRAND
========================================================= */

.visual-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  position: relative;
  z-index: 2;
}

.visual-logo {
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 17px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.visual-school-name {
  color: #ffffff;
  font-size: 0.98rem;
  font-weight: 750;
}

.visual-system-name {
  margin-top: 4px;

  color: rgba(255, 255, 255, 0.7);

  font-size: 0.69rem;
}

/* =========================================================
   VISUAL CONTENT
========================================================= */

.visual-content {
  width: 100%;
  max-width: 580px;

  margin: auto;

  position: relative;

  z-index: 2;
}

/* =========================================================
   BIOMETRIC ICON
========================================================= */

.biometric-icon-container {
  position: relative;

  width: 150px;
  height: 150px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 36px;
}

.fingerprint-icon {
  position: relative;

  z-index: 2;

  width: 110px;
  height: 110px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid rgba(255, 255, 255, 0.22);

  border-radius: 50%;

  background: rgba(255, 255, 255, 0.11);

  color: #ffffff;

  backdrop-filter: blur(8px);

  box-shadow: inset 0 0 30px rgba(255, 255, 255, 0.04);
}

.scan-ring {
  position: absolute;

  border: 1px solid rgba(255, 255, 255, 0.12);

  border-radius: 50%;
}

.ring-one {
  width: 130px;
  height: 130px;
}

.ring-two {
  width: 145px;
  height: 145px;
}

.ring-three {
  width: 160px;
  height: 160px;
}

.scan-line {
  position: absolute;

  z-index: 3;

  left: 26px;
  right: 26px;

  top: 50%;

  height: 2px;

  background: linear-gradient(
    90deg,
    transparent,
    rgba(187, 247, 208, 0.95),
    transparent
  );

  box-shadow: 0 0 12px rgba(187, 247, 208, 0.8);

  animation: scan 2.7s ease-in-out infinite;
}

@keyframes scan {
  0% {
    transform: translateY(-38px);

    opacity: 0;
  }

  20% {
    opacity: 1;
  }

  50% {
    transform: translateY(0);
  }

  80% {
    opacity: 1;
  }

  100% {
    transform: translateY(38px);

    opacity: 0;
  }
}

/* =========================================================
   VISUAL TEXT
========================================================= */

.visual-eyebrow {
  margin-bottom: 12px;

  color: rgba(220, 252, 231, 0.78);

  font-size: 0.67rem;
  font-weight: 750;

  letter-spacing: 0.17em;
}

.visual-title {
  margin: 0;

  color: #ffffff;

  font-size: clamp(2.4rem, 4vw, 4rem);

  font-weight: 800;

  line-height: 1.08;

  letter-spacing: -0.035em;
}

.visual-description {
  max-width: 520px;

  margin: 22px 0 0;

  color: rgba(255, 255, 255, 0.72);

  font-size: 0.9rem;

  line-height: 1.75;
}

/* =========================================================
   FEATURES
========================================================= */

.visual-features {
  display: flex;
  flex-wrap: wrap;

  gap: 10px;

  margin-top: 30px;
}

.feature-item {
  display: flex;
  align-items: center;

  gap: 8px;

  padding: 9px 13px;

  border: 1px solid rgba(255, 255, 255, 0.16);

  border-radius: 10px;

  background: rgba(255, 255, 255, 0.09);

  color: rgba(255, 255, 255, 0.88);

  font-size: 0.69rem;

  backdrop-filter: blur(8px);
}

/* =========================================================
   VISUAL FOOTER
========================================================= */

.visual-footer {
  position: relative;

  z-index: 2;

  display: flex;
  justify-content: flex-end;
}

.device-status {
  display: flex;
  align-items: center;

  gap: 8px;

  color: rgba(255, 255, 255, 0.66);

  font-size: 0.66rem;
}

.status-dot {
  width: 7px;
  height: 7px;

  border-radius: 50%;

  background: #86efac;

  box-shadow: 0 0 8px rgba(134, 239, 172, 0.9);
}

/* =========================================================
   TABLET
========================================================= */

@media (max-width: 1264px) {
  .login-page {
    grid-template-columns: 1fr;
  }

  .login-section {
    min-height: 100vh;
  }
}

/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 600px) {
  .login-section {
    align-items: flex-start;

    padding: 28px 20px;
  }

  .login-container {
    max-width: none;
  }

  .mobile-brand {
    margin-bottom: 50px;
  }

  .mobile-logo {
    width: 56px;
    height: 56px;
  }

  .login-title {
    font-size: 1.7rem;
  }

  .login-description {
    font-size: 0.82rem;
  }

  .login-footer {
    align-items: center;

    flex-direction: column;

    gap: 5px;

    text-align: center;
  }
}

/* =========================================================
   SMALL MOBILE
========================================================= */

@media (max-width: 390px) {
  .login-section {
    padding: 22px 16px;
  }

  .mobile-brand {
    margin-bottom: 38px;
  }

  .login-icon {
    width: 44px;
    height: 44px;
  }
}

/* =========================================================
   REDUCED MOTION
========================================================= */

@media (prefers-reduced-motion: reduce) {
  .scan-line {
    animation: none;
  }

  .login-button {
    transition: none;
  }
}
</style>
