<!-- CompanyDetailDialog.vue -->
<template>
  <v-dialog v-model="dialog" max-width="600">
    <v-card>
      <!-- Company details... -->
      <v-card-title>{{ company.name }}</v-card-title>
      <v-card-subtitle>{{ company.address }}</v-card-subtitle>
      <v-card-text>
        <h4>Company Description: </h4>{{company.description }}
      </v-card-text>

      <v-card-text>
        <a :href="company.url" target="_blank">
          Company Website
        </a>
      </v-card-text>

      <!-- Add NoteList component here -->
      <note-list :parentid="company.id" modelName="company" />

      <v-card-actions>
        <v-btn @click="editCompany">Edit Company Record</v-btn>
        <v-btn @click="closeDialog">Close Company Detail</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import NoteList from './NoteList.vue';
import ContactCard from './ContactCard.vue';

export default {
  components: {
    NoteList,
    ContactCard,
  },
  props: {
    company: Object,
  },
  data() {
    return {
      dialog: false,
    };
  },
  methods: {
    editCompany() {
      // Implement your edit logic here
      console.log('Edit company:', this.company);
      // You may want to navigate to an edit page or show a form here
    },
    closeDialog() {
      // Close the dialog by emitting an event to the parent component
      this.$emit('close-dialog');
    },
  },
};
</script>

<style scoped>
/* Add your custom styles here */
</style>
