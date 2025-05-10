<template>
  <v-app>
    <v-navigation-drawer v-model="drawer">

     <!-- <div class="image-container">
        <v-img src="/SNC-Logo.png" alt="Centered Image" class="rounded-image"></v-img>
      </div> -->
      <v-list>
          <v-list-item
            prepend-avatar="/SNC-Logo.png"
            subtitle="Online"
            title="St. Nicolas College"
          ></v-list-item>
        </v-list>

      <v-divider></v-divider>

      <v-list density="compact" nav>
          <v-list-item active-class="border" prepend-icon="mdi-view-dashboard" title="Dashboard" to="/" ></v-list-item>
          <v-list-item active-class="border" prepend-icon="mdi-calendar-clock" title="Attendance" to="/attendance" :active="$route.path.startsWith('/attendance')"></v-list-item>
          <v-list-item active-class="border" prepend-icon="mdi-account-group" title="Users" to="/users" :active="$route.path.startsWith('/users')"></v-list-item>
          <v-list-item active-class="border" prepend-icon="mdi-office-building" title="Department" to="/department" :active="$route.path.startsWith('/department')"></v-list-item>
        </v-list>

    </v-navigation-drawer>
    <v-app-bar class="elevation-0">
      <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-app-bar-title>SNC Attendance System</v-app-bar-title>
    </v-app-bar>
    <v-main>
      <v-container fluid>
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
const drawer = ref(true)
const items = [
  {
    title: 'Dashboard',
    icon: 'mdi-view-dashboard',
    to: '/'
  },
  {
    title: 'Attendance',
    icon: 'mdi-calendar-clock',
    to: '/attendance'
  },
  {
    title: 'Users',
    icon: 'mdi-account',
    to: '/users'
  },
]

</script>

<style scoped>
.border {
  color: green;
  border: none !important;
}
.image-container {
  width: 35%;
  margin: 15px auto;
}
</style>