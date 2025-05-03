<template>
 <div>
    <h1>Attendance Logs</h1>
    <!-- <div v-if="pending">Loading...</div>
    <div v-else-if="error">Error loading data</div>
    <ul v-else>
      <li v-for="log in records.data" :key="log">
      <pre> {{ log }}</pre> 
      </li>
    </ul> -->
    <!-- <pre>{{ records.data.data }}</pre> -->
  </div>
</template>

<script setup>
const records = ref(null)
// const result = await useFetch('/api/zkteco/attendance')
// const { data, pending, error } = await useFetch('/api/zkteco/attendance')
// records.value = data.value;
// console.log(data)

// async function initialize() {
//   const { data, pending, error } = await useFetch('/api/zkteco/attendance');
//   console.log(data)
 
// }

onMounted(async () => {
  //await initialize();
})
</script>

<style>

</style>