<template>
  <v-dialog v-model="dialog" max-width="900">
    <v-card>
      <v-card-title>{{ job.title }}</v-card-title>
      <v-card-subtitle>{{ job.company.name }} - {{ job.company.address }}</v-card-subtitle>

      <v-card-text>
        <h5>Job Description: </h5>
        <job-details-chips :job="job" />
        <div >
          {{ job.description }}
        </div>
        <div> <a :href="job.url" target="_blank">
            Full job description
          </a>
        </div>
      </v-card-text>

      <v-card-text>
        <h5>About {{ job.company.name }}:</h5>
        <company-card :company="job.company" variant="tonal" color="secondary" />
        
      </v-card-text>

      <v-card-text>
        <h5>Contacts:</h5>
        <v-row v-for="contact in job.contacts" :key="contact.id">
          <V-col cols="12" md="12" lg="12">
            <contact-card :contact="contact" variant="tonal" color="secondary" />
          </V-col>
        </v-row>
      </v-card-text>

      <!-- Add NoteList component here -->
      <note-list :parentid="job.id" modelName="job" />

      <v-card-actions>
        <v-btn @click="editJob">Edit Job Record</v-btn>
        <v-btn @click="closeDialog">Close Job Detail</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
  
<script>
import JobDetailsChips from './JobDetailsChips.vue';
import ContactCard from './ContactCard.vue';
import CompanyCard from './CompanyCard.vue';
import NoteList from './NoteList.vue';
import { statusChoiceMappings, priorityChoiceMappings, locationChoiceMappings, travelChoiceMappings } from '@/config/choiceMappings.js';

export default {
  components: {
    ContactCard,
    JobDetailsChips,
    CompanyCard,
    NoteList,
  },
  props: {
    job: Object,
  },
  data() {
    return {
      dialog: false,
    };
  },
  methods: {
    editJob() {
      // Implement your edit logic here
      console.log("Edit job:", this.job);
      // You may want to navigate to an edit page or show a form here
    },
    closeDialog() {
      // Close the dialog by emitting an event to the parent component
      this.$emit("close-dialog");
    },
  },
};
</script>
  
<style scoped>
/* Add your custom styles here */
</style>