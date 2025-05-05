<template>
  <div>
    <h1>Users Page</h1>

    <v-card elevation="0">
      <v-card-title class="d-flex align-center pe-2">
        <v-spacer></v-spacer>
        <v-spacer></v-spacer>
        <v-text-field v-model="search" density="compact" label="Search" clearable prepend-inner-icon="mdi-magnify"
          variant="solo-filled" flat hide-details single-line></v-text-field>
      </v-card-title>
      <v-divider></v-divider>
      <v-data-table :headers="headers" :items="userAccountList" :search="search" :loading="loading" density="compact"
        :items-per-page="20">
        <template v-slot:loading>
          <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn @click="addShiftDialogBox(item)" size="small" variant="flat" color="blue" class="mr-2">Add
            Shift</v-btn>
          <v-btn :to="`/users/${item.uid}`" variant="flat" size="small" color="primary">View</v-btn>
        </template>

      </v-data-table>
    </v-card>


    <v-dialog max-width="1000" v-model="addShiftDialog" scrollable persistent>
      <v-card elevation="0">
        <v-toolbar color="primary" density="compact">
          <v-icon class="ml-4">mdi-account-group</v-icon>
          <v-toolbar-title> Add Shift</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="addShiftDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <div class="ma-5">


          <v-row dense>
            <v-col cols="2">UID:</v-col>
            <v-col cols="10">{{ userDetails.uid }}</v-col>
          </v-row>

          <v-row dense>
            <v-col cols="2">NAME:</v-col>
            <v-col cols="10">{{ userDetails.name }}</v-col>
          </v-row>


        </div>
        <v-divider></v-divider>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="4">
              <v-form v-model="valid" ref="createShiftForm" lazy-validation>

                <v-select label="Day" v-model="shiftName" prepend-inner-icon="mdi-calendar" :rules="rules.shiftName"
                  :items="['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']" variant="solo-filled"
                  flat></v-select>

                <v-text-field v-model="timeIn" :active="menu_in" label="Time In" :rules="rules.timeIn"
                  prepend-inner-icon="mdi-clock-time-four-outline" readonly variant="solo-filled" flat>
                  <v-menu v-model="menu_in" :close-on-content-click="false" activator="parent"
                    transition="scale-transition">
                    <v-time-picker v-if="menu_in" v-model="timeIn" full-width format="24hr" use-seconds></v-time-picker>
                  </v-menu>
                </v-text-field>

                <v-text-field v-model="timeOut" :active="menu_out" label="Time Out" :rules="rules.TimeOut"
                  prepend-inner-icon="mdi-clock-time-four-outline" readonly variant="solo-filled" flat>
                  <v-menu v-model="menu_out" :close-on-content-click="false" activator="parent"
                    transition="scale-transition">
                    <v-time-picker v-if="menu_out" v-model="timeOut" full-width format="24hr"
                      use-seconds></v-time-picker>
                  </v-menu>
                </v-text-field>

                <v-text-field v-model="gracePeriod" label="Grace Period (minutes)" type="number"
                  :rules="rules.gracePeriod" prepend-inner-icon="mdi-timer-sand-complete" variant="solo-filled" flat>
                </v-text-field>

                <v-btn color="primary" block variant="flat" @click="addShift()" v-if="!isUpdate">Save</v-btn>
                <v-row v-else>
                  <v-col cols="12" md="6"><v-btn color="primary" block variant="flat"
                      @click="updateShift()">Save</v-btn></v-col>
                  <v-col cols="12" md="6"><v-btn color="warning" block variant="flat"
                      @click="cancelShift()">Cancel</v-btn></v-col>
                </v-row>

              </v-form>

            </v-col>
            <v-col cols="12" md="8">
              <v-data-table density="compact" :headers="shiftHeaders" :items="shiftList" :loading="loading">
                <template v-slot:[`item.actions`]="{ item }">
                  <v-btn variant="text" size="small" color="blue" class="mr-2"
                    @click="editShift(item)"><v-icon>mdi-pencil</v-icon></v-btn>

                </template>

              </v-data-table>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>


    <!-- SNACKBAR -->
    <v-snackbar
      v-model="shiftSnackbar"
      color="success"
      location="top"
    >
      {{ snackbarText }}

      <template v-slot:actions>
        <v-btn icon @click="addShiftDialog = false" size="small">
            <v-icon>mdi-close</v-icon>
          </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
const loading = ref(true)
const addShiftDialog = ref(false);
const search = ref(null);
const createShiftForm = ref(null);
const isUpdate = ref(false)
const valid = ref(true)
const shiftSnackbar = ref(false);
const snackbarText = ref("")
const snackbarColor = ref(null)
const headers = ref([
  {
    title: "User ID",
    sortable: true,
    key: "user_id",
  },
  { title: "Name", key: "name", sortable: false },
  { title: "Card No", key: "card_no", sortable: false },
  { title: "Role", key: "role", sortable: false },
  { title: "", key: "actions", align: "center", sortable: false },
]);
const shiftHeaders = ref([
  {
    title: "User ID",
    sortable: true,
    key: "user_id",
  },
  { title: "Shift Name", key: "shift_name", sortable: false },
  { title: "Shift Start", key: "shift_start", sortable: false },
  { title: "Shift End", key: "shift_end", sortable: false },
  { title: "Grace Period", key: "grace_period_minutes", sortable: false },
  { title: "", key: "actions", align: "center", sortable: false },
]);
const rules = ref({
  shiftName: [(v) => !!v || "Shift Name is required"],
  timeIn: [(v) => !!v || "Time in is required"],
  TimeOut: [(v) => !!v || "Time out is required"],
  gracePeriod: [(v) => !!v || "Grace period is required"],
})
const userAccountList = ref([]);
const shiftList = ref([]);
const userDetails = ref({})
const userID = ref(null)
const shiftName = ref("")
const timeIn = ref("")
const menu_in = ref(false)
const timeOut = ref(null)
const menu_out = ref(false)
const gracePeriod = ref(15);
const weekday = ref(null);
const documentID = ref("");

async function initialize() {
  try {
    let result = await $fetch(`/api/user-accounts/list`);
    if (result) {
      userAccountList.value = result;
      loading.value = false
      //console.log(result);
    }
  } catch (err) {
    console.error("Failed to fetch data: ", err);
    loading.value = false;
    throw err;
  }
}

async function getShift() {
  try {
    //console.log("User ID: ", userID.value)
    let result = await $fetch(`/api/shift-type/list/${userID.value}`);
    if (result) {
      shiftList.value = result;
      //console.log(result)
    }
  } catch (err) {
    console.error("Failed to fetch data: ", err);
    throw err;
  }
}

async function addShiftDialogBox(item) {
  //console.log(item);
  userID.value = item.user_id;
  userDetails.value = item;
  addShiftDialog.value = true;
  getShift();
}

async function addShift() {
  const { valid, errors } = await createShiftForm.value?.validate();
  if (valid) {
    const week = shiftName.value;
    switch (week) {
      case 'Monday':
        console.log('1');
        weekday.value = 1;
        break;
      case 'Tuesday':
        console.log("2");
        weekday.value = 2;
        break;
      case 'Wednesday':
        console.log("3");
        weekday.value = 3;
        break;
      case 'Thursday':
        console.log("4");
        weekday.value = 4;
        break;
      case 'Friday':
        console.log('5');
        weekday.value = 5;
        break;
      case 'Saturday':
        console.log("6");
        weekday.value = 6;
        break;
      default:
        console.log("No Record Found");
    }
    const payload = {
      user_id: userID.value,
      shift_name: shiftName.value,
      shift_start: timeIn.value,
      shift_end: timeOut.value,
      grace_period: parseInt(gracePeriod.value),
      weekday: weekday.value,
      is_active: true
    };
    //console.log("Time Log: ", payload)
    await $fetch('/api/shift-type/create', {
      method: "POST",
      body: payload
    }).then(response => {
      //console.log("Response: ", response)
      if (response.status == "fail") {
        //alert(response.message);
        console.log(response.message)

      } else {
        console.log("Shift created successfully")
        //createShiftForm.value?.reset();
        gracePeriod.value = 15
        getShift()
      }
    })
  }
}

async function editShift(item) {
  console.log(item)
  isUpdate.value = true
  documentID.value = item.documentId;
  shiftName.value = item.shift_name;
  timeIn.value = item.shift_start;
  timeOut.value = item.shift_end;
  gracePeriod.value = item.grace_period_minutes;
}

async function cancelShift() {
  createShiftForm.value?.reset();
  gracePeriod.value = 15;
  isUpdate.value = false
}

async function updateShift() {
  const { valid, errors } = await createShiftForm.value?.validate();
  if (valid) {
    const payload = {
      //document_id: documentID.value,
      user_id: userID.value,
      shift_name: shiftName.value,
      shift_start: timeIn.value,
      shift_end: timeOut.value,
      grace_period: parseInt(gracePeriod.value),
      //weekday: weekday.value,
      is_active: true
    };
    console.log(payload)

    await $fetch(`/api/shift-type/update/${documentID.value}`, {
      method: 'PUT',
      body: payload
  }).then(response => {
    if (response.status == "fail") {
        //alert(response.message);
        console.log(response.message)

      } else {
        console.log("Shift update successfully")
        snackbarText.value = `${shiftName.value} shift updated sucessfully`;
        shiftSnackbar.value = true
        //createShiftForm.value?.reset();
        //gracePeriod.value = 15
        getShift()
      }
  })
  }
}

onMounted(async () => {
  await initialize();

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