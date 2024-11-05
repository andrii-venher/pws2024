<script>
import DataInput from './components/DataInput.vue'
import DataOutput from './components/DataOutput.vue'

export default {
  data() {
    return {
      messageDisplayed: false,
      messageColor: 'red',
      message: ''
    }
  },
  components: { DataInput, DataOutput },
  methods: {
    onRefreshOutput() {
      this.$refs.dataOutputRef.refresh()
    },
    onDataSelected(data) {
      this.$refs.dataInputRef.importData(data)
    },
    onDisplayMessage(text, color) {
      this.message = text
      this.messageColor = color || 'success'
      this.messageDisplayed = true
    }
  }
}
</script>

<template>
  <div class="horizontal">
    <DataInput ref="dataInputRef" @refresh-output="onRefreshOutput" @display-message="onDisplayMessage" class="horizontalElement"/>
    <DataOutput ref="dataOutputRef" @data-selected="onDataSelected" class="horizontalElement"/>
  </div>

  <v-snackbar v-model="messageDisplayed" :color="messageColor">
    <div style="width: 100%; text-align: center;">{{ message }}</div>
  </v-snackbar>
</template>

<style scoped>
  .horizontal { display: flex; }
  .horizontalElement { flex: 1; width: 400px; margin: 10px 10px; }
</style>