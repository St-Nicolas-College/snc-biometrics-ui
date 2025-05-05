<script setup lang="ts">

const logs = ref<any[]>([])
const loading = ref(true)
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
  { title: "Time In", key: "in_time", sortable: false },
  { title: "Shift End", key: "shift_end", sortable: false },
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

onMounted(() => {
  fetchAttendance()
})
</script>

<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-6">Daily Attendance (IN/OUT)</h1>

    <div v-if="loading">Loading...</div>

    <div v-else class="overflow-x-auto bg-white shadow rounded-lg">

      <v-data-table :items="logs" :headers="headers">
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
