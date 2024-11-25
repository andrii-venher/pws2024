<script>
import DataOutput from './components/DataOutput.vue'

export default {
  data() {
    return {
      messageDisplayed: false,
      messageColor: 'red',
      message: ''
    }
  },
  components: { DataOutput },
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
  <DataOutput @display-message="onDisplayMessage"/>

  <v-snackbar v-model="messageDisplayed" :color="messageColor">
    <div style="width: 100%; text-align: center;">{{ message }}</div>
  </v-snackbar>
</template>

<style scoped>
</style>