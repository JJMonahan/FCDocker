<!-- ContactDetailDialog.vue -->

<template>
    <v-dialog v-model="dialog" max-width="900">
        <v-card>
            <v-card-title>{{ contact.fname }} {{ contact.lname }}</v-card-title>
            <v-card-subtitle>{{ contact.fname }} {{ contact.lname }}</v-card-subtitle>
           
            <!-- Add NoteList component here -->
            <note-list :parentid="contact.id" modelName="contact" />

            <v-card-actions>
                <v-btn @click="editContact">Edit Contact Record</v-btn>
                <v-btn @click="closeDialog">Close Contact Detail</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
  
<script>
import NoteList from './NoteList.vue';

export default {
    components: {
        NoteList,
    },

    props: {
        contact: Object,
    },
    data() {
        return {
            dialog: false,
        };
    },
    methods: {
        editContact() {
            // Implement your edit logic here
            console.log("Edit Contact:", this.contact);
            // You may want to navigate to an edit page or show a form here
        },
        closeDialog() {
            // Close the dialog by emitting an event to the parent component
            this.$emit("close-dialog");
        },
    },
};
</script>
  