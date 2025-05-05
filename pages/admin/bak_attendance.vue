<script setup>
const records = ref(null)
// const result = await useFetch('/api/zkteco/attendance')
const { data, pending, error } = await useFetch('/api/zkteco/attendance')
records.value = data.value;
console.log(data)
</script>

<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-6">Attendance History</h1>

    <div v-if="pending" class="text-gray-500">Loading...</div>
    <div v-else-if="error" class="text-red-500">Failed to load data.</div>
    
    <div v-else>
      <table class="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr class="bg-gray-100">
            <th class="border p-2 text-left">User ID</th>
            <th class="border p-2 text-left">Serial No.</th>
            <th class="border p-2 text-left">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in records.data" :key="log.deviceUserId" class="hover:bg-gray-50">
            <td class="border p-2">{{ log.deviceUserId }}</td>
            <td class="border p-2">{{ log.userSn }}</td>
            <td class="border p-2">{{ new Date(log.recordTime).toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
