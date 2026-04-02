<!-- NoteList.vue -->
<template>
  <div v-if="notes.length > 0">
    <h3>Notes</h3>
    <ul>
      <li v-for="note in notes" :key="note.id">
        <h4>{{ formatDate(note.created) }}:</h4> {{ note.content }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    parentid: String, // The ID of the company, job, or contact etc.
    modelName: String, // The model name ('job', 'contact', 'company')
  },
  data() {
    return {
      notes: [], // Initialize as an empty array
    };
  },
  mounted() {
    // Fetch notes when the component is mounted
    this.fetchNotes();
  },
  methods: {
    formatDate(dateString) {
      const options = {
        weekday: 'short',
        year: '2-digit',
        month: 'numeric',
        day: 'numeric',
      };
      const formattedDate = new Date(dateString).toLocaleString(undefined, options);
      return formattedDate;
    },

    async fetchNotes() {
      try {
        // Fetch notes based on companyId and modelName
        const response = await this.$axios.get(`/api/notes/?model=${this.modelName}&id=${this.parentid}`);
        this.notes = response.data.results;
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    },
  },
};
</script>

<style scoped>
/* Add your component styles here */
</style>
