<template>
  <div>
    <v-card variant="tonal" append-icon="mdi-notebook" class="mx-auto" title="Attendance Logs" @click="dialog = true"
      link>

    </v-card>

    <v-dialog v-model="dialog" fullscreen scrollable>
      <v-card>
        <v-toolbar>
          <v-btn icon="mdi-close" @click="closeDialog()"></v-btn>

          <v-toolbar-title>Attendance Logs</v-toolbar-title>

          <v-toolbar-items>
            <v-btn text="Save" variant="text" @click="closeDialog()"></v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <v-row justify="center" dense>
          <v-col cols="12" md="8">
            <v-card elevation="0">
              <v-card-text>
                <v-row dense align="center" justify="center">
                  <v-col cols="12" md="5"> <v-date-input density="compact" label="Select a date start"
                      v-model="dateStart" prepend-icon="" prepend-inner-icon="$calendar" variant="solo-filled"
                      hide-details flat></v-date-input></v-col>
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


        <v-divider></v-divider>
        <v-card-text>
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
        </v-card-text>

      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
const dialog = ref(false)
const dateStart = ref(null)
const dateEnd = ref(null)
const logs = ref<any[]>([])
const loading = ref(false)
const search = ref('');
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


async function searchAttendanceRange() {
  loading.value = true
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
    loading.value = false
  }
}

async function closeDialog() {
  logs.value = []
  dateStart.value = null,
  dateEnd.value = null
  dialog.value = false
}
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