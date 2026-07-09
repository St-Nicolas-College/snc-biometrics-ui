<template>
  <div class="mx-auto d-flex justify-center align-center" style="height: 50vh;">
    <v-card width="500" rounded="lg" elevation="0">
      <v-card-title>
        <v-icon color="green" start>mdi-notebook</v-icon> Reports Generation
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <v-row dense>
          <v-col cols="12">
            
            <AttendanceLogs />
          </v-col>
          <v-col cols="12">
           <SummaryOfLate />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts" setup>
import SummaryOfLate from '~/components/SummaryOfLate.vue';


</script>

<style></style>