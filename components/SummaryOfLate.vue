<template>
  <div>
    <v-card variant="tonal" append-icon="mdi-notebook" class="mx-auto" title="Summary of Late" @click="dialog = true" link>
    </v-card>


    <v-dialog v-model="dialog" fullscreen scrollable>
      <v-card>
        <v-toolbar>
          <v-btn icon="mdi-close" @click="closeDialog()"></v-btn>

          <v-toolbar-title>Summary of Late</v-toolbar-title>

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
                      @click="searchSummaryOfLate"><v-icon>mdi-magnify</v-icon></v-btn></v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>


        <v-divider></v-divider>
        <v-card-text>
          <v-card elevation="0">
           
            <v-data-table :items="summary" :headers="headers" :search="search" :loading="loading" density="compact"
              :items-per-page="20">
              <template v-slot:loading>
                <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
              </template>
              <template v-slot:[`item.cutoff_date`]="{ item }">
                {{ new Date(item.cutoff_start).toLocaleDateString() }} - {{ new Date(item.cutoff_end).toLocaleDateString() }}
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

<script lang="ts" setup>
const dialog = ref(false)
const dateStart = ref(null)
const dateEnd = ref(null)
const search = ref('');
const loading = ref(false)
const summary = ref<any[]>([])
const headers = ref([
  {
    title: "User ID",
    sortable: true,
    key: "user_id",
  },
  { title: "Name", key: "employee_name", sortable: false },
  { title: "Date", key: "cutoff_date", sortable: false },


  { title: "Late(minutes)", key: "late_minutes", sortable: false },



]);

async function searchSummaryOfLate() {
  loading.value = true;
  //@ts-ignore
   const formattedDateStart = new Date(dateStart.value).toLocaleDateString('en-GB')
  //@ts-ignore
  const formattedDateEnd = new Date(dateEnd.value).toLocaleDateString('en-GB')

  let result = await $fetch(`/api/attendance/late-summary?start=${formattedDateStart}&end=${formattedDateEnd}`);
  if (result) {
    console.log(result)
    //@ts-ignore
    summary.value = result.data
    loading.value = false
  }
}

async function closeDialog() {
  summary.value = []
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