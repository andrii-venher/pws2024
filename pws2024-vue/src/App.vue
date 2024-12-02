<script>
import PersonList from './components/PersonList.vue'

export default {
  data() {
    return {
      messageDisplayed: false,
      messageColor: 'red',
      message: ''
    }
  },
  components: { PersonList },
  methods: {
    onDisplayMessage(text, color) {
      this.message = text
      this.messageColor = color || 'success'
      this.messageDisplayed = true
    }
  }
}
</script>

<template>
  <PersonList @display-message="onDisplayMessage"/>

  <v-snackbar v-model="messageDisplayed" :color="messageColor">
    <div style="width: 100%; text-align: center;">{{ message }}</div>
  </v-snackbar>
</template>

<style scoped>
</style>