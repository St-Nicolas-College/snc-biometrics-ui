<template>
  <div>
    <h1>Users Page</h1>
  
    <v-card elevation="0">
      <v-data-table :headers="headers" :items="userAccountList" :loading="loading">
        <template v-slot:loading>
          <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn @click="addShiftDialogBox(item)" variant="flat" color="blue" class="mr-2">Add Shift</v-btn>
          <v-btn :to="`/students/${item.uid}`" variant="flat" color="primary">View</v-btn>
        </template>

      </v-data-table>
    </v-card>


    <v-dialog max-width="900" v-model="addShiftDialog" scrollable persistent>
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
            <v-col cols="12" md="6">
              <v-row>
                <v-col cols="2">UID:</v-col>
                <v-col cols="8">{{ userDetails.uid }}</v-col>
              </v-row>
            </v-col>
            <v-col cols="12" md="6">
              <v-row>
                <v-col cols="2">Name:</v-col>
                <v-col cols="8">{{ userDetails.name }}</v-col>
              </v-row>
            </v-col>
          </v-row>

        </div>
        <v-divider></v-divider>
        <v-card-text>

          <v-row dense>
            <v-col cols="2">Monday</v-col>
            <v-col cols="5">
              <v-text-field v-model="monTimeIn" :active="mon_menu_in" label="Time In"
                prepend-inner-icon="mdi-clock-time-four-outline" readonly  variant="solo-filled" flat>
                <v-menu v-model="mon_menu_in" :close-on-content-click="false" activator="parent"
                  transition="scale-transition">
                  <v-time-picker v-if="mon_menu_in" v-model="monTimeIn" full-width format="24hr"></v-time-picker>
                </v-menu>
              </v-text-field>
            </v-col>
            <v-col cols="5">
              <v-text-field v-model="monTimeOut" :active="mon_menu_out" label="Time In"
                prepend-inner-icon="mdi-clock-time-four-outline" readonly  variant="solo-filled" flat>
                <v-menu v-model="mon_menu_out" :close-on-content-click="false" activator="parent"
                  transition="scale-transition">
                  <v-time-picker v-if="mon_menu_out" v-model="monTimeOut" full-width format="24hr"></v-time-picker>
                </v-menu>
              </v-text-field>
          </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="2">Tuesday</v-col>
            <v-col cols="5"><v-text-field label="Time In" variant="solo-filled" flat></v-text-field></v-col>
            <v-col cols="5"><v-text-field label="Time Out" variant="solo-filled" flat></v-text-field></v-col>
          </v-row>
          <v-row dense>
            <v-col cols="2">Wednesday</v-col>
            <v-col cols="5"><v-text-field label="Time In" variant="solo-filled" flat></v-text-field></v-col>
            <v-col cols="5"><v-text-field label="Time Out" variant="solo-filled" flat></v-text-field></v-col>
          </v-row>
          <v-row dense>
            <v-col cols="2">Thursday</v-col>
            <v-col cols="5"><v-text-field label="Time In" variant="solo-filled" flat></v-text-field></v-col>
            <v-col cols="5"><v-text-field label="Time Out" variant="solo-filled" flat></v-text-field></v-col>
          </v-row>
          <v-row dense>
            <v-col cols="2">Friday</v-col>
            <v-col cols="5"><v-text-field label="Time In" variant="solo-filled" flat></v-text-field></v-col>
            <v-col cols="5"><v-text-field label="Time Out" variant="solo-filled" flat></v-text-field></v-col>
          </v-row>
          <v-row dense>
            <v-col cols="2">Saturday</v-col>
            <v-col cols="5"><v-text-field label="Time In" variant="solo-filled" flat></v-text-field></v-col>
            <v-col cols="5"><v-text-field label="Time Out" variant="solo-filled" flat></v-text-field></v-col>
          </v-row>


        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" variant="flat" @click="addShift()">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
const loading = ref(true)
const addShiftDialog = ref(false);
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
const userAccountList = ref([]);
const userDetails = ref({})
const monTimeIn = ref(null)
const mon_menu_in = ref(false)
const monTimeOut = ref(null)
const mon_menu_out = ref(false)

async function initialize() {
  try {
    let result = await $fetch(`/api/user-accounts/list`);
    if (result) {
      userAccountList.value = result;
      loading.value = false
      console.log(result);
    }
  } catch (err) {
    console.error("Failed to fetch data: ", err);
    loading.value = false;
    throw err;
  }
}

async function addShiftDialogBox(item) {
  console.log(item);
  userDetails.value = item;
  addShiftDialog.value = true;
}

async function addShift() {
  const payload = {
    mon_time_in: monTimeIn.value,
    mon_time_out: monTimeOut.value,
  };

  console.log("Time Log: ", payload)
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