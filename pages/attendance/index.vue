<template>
  <div class="p-8">

    <div v-if="loading">Loading...</div>

    <div v-else >
      <v-row justify="center" dense>
        <v-col cols="12" md="5">
          <v-card elevation="0">
            <v-card-text>
              <v-row dense align="center" justify="center">
                <v-col cols="12" md="5"> <v-date-input density="compact" label="Select a date start" v-model="dateStart"
                    prepend-icon="" prepend-inner-icon="$calendar" variant="solo-filled" hide-details
                    flat></v-date-input></v-col>
                <v-col cols="12" md="5"> <v-date-input density="compact" label="Select a date end" v-model="dateEnd"
                    prepend-icon="" prepend-inner-icon="$calendar" variant="solo-filled" hide-details
                    flat></v-date-input></v-col>
                <v-col cols="12" md="1"> <v-btn variant="tonal" block color="primary"
                    @click="searchAttendanceRange"><v-icon>mdi-magnify</v-icon></v-btn></v-col>
              </v-row>


            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-card elevation="0" class="mt-5">
        <v-card-title class="d-flex align-center pe-2">
          <v-icon start>mdi-calendar-clock</v-icon> Daily Attendance (IN/OUT)
          <v-spacer></v-spacer>

          <v-spacer></v-spacer>
          <v-text-field v-model="search" density="compact" label="Search" clearable prepend-inner-icon="mdi-magnify"
            variant="solo-filled" flat hide-details single-line></v-text-field>
        </v-card-title>
        <v-divider></v-divider>
        <v-data-table :items="logs" :headers="headers" :search="search" :loading="loading" density="compact"
          :items-per-page="20">
          <template v-slot:loading>
            <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
          </template>
          <template v-slot:[`item.log_date`]="{ item }">
            {{ new Date(item.log_date).toLocaleDateString() }}
          </template>
          <template v-slot:[`item.in_time`]="{ item }">
            <span>{{ new Date(item.in_time).toLocaleTimeString() }}</span>
          </template>
          <template v-slot:[`item.out_time`]="{ item }">
            <span v-if="item.in_time === item.out_time">NO TIME OUT</span>
            <span v-else>{{ new Date(item.out_time).toLocaleTimeString() }}</span>
          </template>
          <template v-slot:[`item.late_minutes`]="{ item }">


            <v-chip size="small" v-if="item.late_minutes > 0" variant="outlined" color="red">
              {{ item.late_minutes }} min late
            </v-chip>

          </template>

        </v-data-table>

      </v-card>


      <!-- <table class="min-w-full table-auto text-sm">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-3 text-left">User ID</th>
            <th class="p-3 text-left">Date</th>
            <th class="p-3 text-left">IN Time</th>
            <th class="p-3 text-left">OUT Time</th>
            <th class="p-3 text-left">Hours Worked</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs" :key="`${log.user_id}-${log.log_date}`" class="border-b hover:bg-gray-50">
            <td class="p-3">{{ log.user_id }}</td>
            <td class="p-3">{{ new Date(log.log_date).toLocaleString() }}</td>
            <td class="p-3">{{ new Date(log.in_time).toLocaleTimeString() }}</td>
            <td class="p-3">{{ new Date(log.out_time).toLocaleTimeString() }}</td>
            <td class="p-3">{{ log.total_hours }} hrs</td>
          </tr>
        </tbody>
      </table> -->
    </div>
  </div>
</template>
<script setup lang="ts">

const logs = ref<any[]>([])
const loading = ref(true)
const search = ref('');
const dateStart = ref(null)
const dateEnd = ref(null)
const dateF = ref(null);
const headers = ref([
  {
    title: "User ID",
    sortable: true,
    key: "user_id",
  },
  { title: "Name", key: "name", sortable: false },
  { title: "Date", key: "log_date", sortable: false },
  { title: "Day", key: "shift_name", sortable: false },
  { title: "Shift Start", key: "shift_start", sortable: false },
  { title: "Shift End", key: "shift_end", sortable: false },
  { title: "Time In", key: "in_time", sortable: false },
  { title: "Time Out", key: "out_time", sortable: false },
  // { title: "Allowed In", key: "allowed_in", sortable: false },
  // { title: "Late(minutes)", key: "late_minutes", sortable: false },
  // { title: "Total Hours", key: "total_hours", sortable: false },
  // { title: "Status", key: "status", sortable: false },
  { title: "Late(minutes)", key: "late_minutes", sortable: false },


  { title: "Late Status", key: "late_status", sortable: false },
  { title: "Early Leave Status", key: "early_leave_status", sortable: false },

]);

const fetchAttendance = async () => {
  const { data } = await useFetch('/api/attendance/inout_shift')
  logs.value = data.value || []
  loading.value = false
}

async function searchAttendanceRange() {
  //@ts-ignore
  const formattedDateStart = new Date(dateStart.value).toLocaleDateString('en-GB')
  //@ts-ignore
  //const formattedDateEnd = new Date(dateEnd.value).toISOString().split('T')[0]
  const formattedDateEnd = new Date(dateEnd.value).toLocaleDateString('en-GB')
  console.log("Date Start: ", formattedDateStart);
  console.log("Date End: ", formattedDateEnd)

  let result = await $fetch(`/api/attendance/search?date_start=${formattedDateStart}&date_end=${formattedDateEnd}`);
  if (result) {
    console.log(result)
    logs.value = result
  }
}

onMounted(() => {
  fetchAttendance()
})
</script>
<style scoped>
:deep() .v-table .v-table__wrapper>table>thead>tr>th {
  border-right: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-bottom: thick solid rgba(var(--v-border-color), var(--v-border-opacity));
  font-weight: bold;
  /* background-color: #04aa6d;
  color: white; */
}

:deep() .v-table .v-table__wrapper>table>tbody>tr>td:not(:last-child),
.v-table .v-table__wrapper>table>tbody>tr>th:not(:last-child) {
  border-right: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}

:deep() .v-table .v-table__wrapper>table>tbody>tr:nth-child(even) {
  background-color: #f2f2f2;
}

:deep() .v-table .v-table__wrapper>table>tbody>tr:hover {
  background-color: #f2f2f2;
}
</style>
