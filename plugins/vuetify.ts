import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

import { createVuetify } from "vuetify";

import { VDateInput } from "vuetify/labs/VDateInput";
import { VTimePicker } from "vuetify/labs/VTimePicker";

const customLightTheme = {
  dark: false,

  colors: {
    background: "#ECEFF1",

    surface: "#FFFFFF",

    "surface-bright": "#FFFFFF",

    "surface-light": "#EEEEEE",

    "surface-variant": "#424242",

    "on-surface-variant": "#EEEEEE",

    primary: "#4CAF50",

    "primary-darken-1": "#1F5592",

    secondary: "#48A9A6",

    "secondary-darken-1": "#018786",

    error: "#B00020",

    info: "#2196F3",

    success: "#4CAF50",

    warning: "#FB8C00",
  },
};

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    theme: {
      defaultTheme: "customLightTheme",

      themes: {
        customLightTheme,
      },
    },

    components: {
      VDateInput,
      VTimePicker,
    },
  });

  nuxtApp.vueApp.use(vuetify);
});
