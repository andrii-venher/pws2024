<script>
export default {
  data() {
    return {
      dataGathered: []
    }
  },
  emits: [ 'dataSelected' ],
  methods: {
    refresh() {
      fetch('/api', {
      method: 'GET'
      }).then(res => res.json().then(body => {
        this.dataGathered = body
      }))
    },
    dataClicked(data) {
      this.$emit('dataSelected', data)
    }
  },
  mounted() {
    this.refresh()
  }
}
</script>

<template>
  <v-card variant="outlined">
    <v-card-title>Data gathered so far</v-card-title>
    <v-card-text>
      <v-table density="compact">
        <thead>
          <tr>
            <th>First name</th><th>Year of birth</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="data in dataGathered" @click="dataClicked(data)">
            <td>{{ data.firstName }}</td><td>{{ data.yearOfBirth }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>  
  </v-card>
</template>

<style scoped>
</style>