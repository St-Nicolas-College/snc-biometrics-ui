<template>
  <div>
    <!-- <h1 class="text-2xl font-bold mb-6">Department</h1> -->
    <v-row>
      <v-col cols="12" md="4">
        <v-card elevation="0" class="card-outlined">
          <v-toolbar color="transparent">
            <v-toolbar-title class="title-color">
              <v-icon start>mdi-office-building</v-icon> Create Department

            </v-toolbar-title>

          </v-toolbar>
          <v-divider></v-divider>
          <v-card-text>
            <v-form v-model="valid" class="mt-5" ref="createDeptForm" lazy-validation>
              <v-text-field v-model="deptCode" label="Department Code" prepend-inner-icon="mdi-code-array"
                variant="solo-filled" flat>
              </v-text-field>
              <v-text-field v-model="deptName" label="Department Name" prepend-inner-icon="mdi-office-building"
                variant="solo-filled" flat>
              </v-text-field>
              <v-btn block variant="flat" color="primary" @click="createDepartment()" class="mt-3"><v-icon
                  start>mdi-plus</v-icon> Create</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="8">
        <v-card class="card-outlined" elevation="0">
          <v-toolbar color="transparent">
            <v-toolbar-title class="title-color"><v-icon start>mdi-list-box</v-icon> Department List</v-toolbar-title>
          </v-toolbar>
          <v-divider></v-divider>

          <v-data-table density="compact" :headers="deptHeaders" :items="departmentList" :loading="loading">
            <template v-slot:[`item.createdAt`]="{ item }">
              {{ new Date(item.createdAt).toLocaleDateString() }} {{ new Date(item.createdAt).toLocaleTimeString() }}
            </template>
            <template v-slot:[`item.actions`]="{ item }">
              <v-btn variant="text" size="small" color="blue" class="mr-2"
                @click="editShift(item)"><v-icon>mdi-pencil</v-icon></v-btn>

            </template>

          </v-data-table>

        </v-card>
      </v-col>
    </v-row>

    <!-- SNACKBAR -->
    <v-snackbar v-model="deptSnackbar" :color="snackbarColor" location="top">
      <v-icon start>{{ snackbarIcon }}</v-icon>
      {{ snackbarText }}

      <template v-slot:actions>
        <v-btn icon @click="deptSnackbar = false" size="small">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
const valid = ref(true)
const loading = ref(true)
const deptCode = ref("")
const deptName = ref("")
const createDeptForm = ref(null)
const departmentList = ref([])
const deptSnackbar = ref(false);
const snackbarText = ref("")
const snackbarColor = ref(null)
const snackbarIcon = ref(null);
const deptHeaders = ref([
  {
    title: "ID",
    sortable: true,
    key: "id",
  },
  { title: "Department Code", key: "dept_code", sortable: false },
  { title: "Department Name", key: "dept_name", sortable: false },
  { title: "Created At", key: "createdAt", sortable: false },
  { title: "", key: "actions", align: "center", sortable: false },
]);

onMounted(async () => {
  await initialize();

})

async function initialize() {
  try {
    let result = await $fetch(`/api/department/list`);
    if (result) {
      departmentList.value = result;
      loading.value = false
      //console.log(result);
    }
  } catch (err) {
    console.error("Failed to fetch data: ", err);
    loading.value = false;
    throw err;
  }
}


async function createDepartment() {
  const { valid, errors } = await createDeptForm.value?.validate();
  if (valid) {
    const payload = {
    dept_code: deptCode.value,
    dept_name: deptName.value
  };

  await $fetch(`/api/department/create`, {
    method: 'POST',
    body: payload
  }).then(response => {
    console.log(response)
    console.log("Department Created Successfully!")
    snackbarText.value = "Department created successfully";
    snackbarColor.value = "success"
    snackbarIcon.value = 'mdi-check-circle'
    deptSnackbar.value = true
    createDeptForm.value?.reset();
    initialize();
    
  })

  console.log(payload)
  }
  
}
</script>

<style scoped>
.card-outlined {
  border-radius: 15px;
}
</style>