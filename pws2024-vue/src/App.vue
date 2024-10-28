<script>
import DataInput from './components/DataInput.vue'
import DataOutput from './components/DataOutput.vue'

export default {
  components: { DataInput, DataOutput },
  methods: {
    onRefreshOutput() {
      this.$refs.dataOutputRef.refresh()
    }
  }
}
</script>

<template>
  <DataInput @refresh-output="onRefreshOutput"/>
  <DataOutput ref="dataOutputRef"/>
</template>

<style scoped>
</style>