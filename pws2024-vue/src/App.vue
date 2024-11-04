<script>
import DataInput from './components/DataInput.vue'
import DataOutput from './components/DataOutput.vue'

export default {
  components: { DataInput, DataOutput },
  methods: {
    onRefreshOutput() {
      this.$refs.dataOutputRef.refresh()
    },
    onDataSelected(data) {
      this.$refs.dataInputRef.importData(data)
    }
  }
}
</script>

<template>
  <DataInput ref="dataInputRef" @refresh-output="onRefreshOutput"/>
  <DataOutput ref="dataOutputRef" @data-selected="onDataSelected"/>
</template>

<style scoped>
</style>