<!-- CompanyCard.vue -->
<template>
    <v-card :id="'company-card-' + company.id" lass="m-card-height" @click="showCompanyDetails">
      <v-card-title>{{ company.name }}</v-card-title>
      <v-card-subtitle>{{ company.address }}</v-card-subtitle>
      <v-card-text class="trunc-3">{{ company.description }}</v-card-text>
  
      <!-- Add more company details as needed -->
  
      <v-card-actions>
        <v-btn v-if="company.url" text color="primary" @click="openLink(company.url)">
          Company details
        </v-btn>
        <v-btn v-else disabled text>
          No Company Details Available
        </v-btn>
      </v-card-actions>

      <!-- Displaying job details as colored chips -->
      <company-details-chips :company="company" />
  
      <!-- Include the CompanyDetailDialog component -->
      <company-detail-dialog :company="company" @close-dialog="closeDialog" ref="companyDetailDialog" />
    </v-card>
  </template>
  
  <script>
  import CompanyDetailDialog from './CompanyDetailDialog.vue';
  import CompanyDetailsChips from './CompanyDetailsChips.vue';
  
  export default {
    props: {
      company: {
        type: Object,
      },
    },
    components: {
      CompanyDetailDialog,
      CompanyDetailsChips,
    },
    methods: {
      openLink(url) {
        if (url && url !== 'NA' && url !== 'Unknown') {
          // Open the link in a new tab
          window.open(url, '_blank');
        }
      },
      showCompanyDetails() {
        // Access the child component using $refs and update the dialog property
        if (this.$refs.companyDetailDialog) {
          this.$refs.companyDetailDialog.dialog = true;
        }
      },
      closeDialog() {
        // Access the child component using $refs and update the dialog property
        if (this.$refs.companyDetailDialog) {
          this.$refs.companyDetailDialog.dialog = false;
        }
      },
    },
  };
  </script>
  
  <style scoped>
  /* Add your custom styles here */
  </style>
  