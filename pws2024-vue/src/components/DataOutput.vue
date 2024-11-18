<script>
export default {
  data() {
    return {
      dataGathered: []
    }
  },
  emits: [ 'dataSelected', 'displayMessage' ],
  methods: {
    refresh() {
      fetch('/api', {
      method: 'GET'
      }).then(res => res.json().then(body => {
        if(res.status < 400) {
          this.dataGathered = body
        } else {
          this.$emit('displayMessage', body.error, 'error')
        }
      }).catch(err => {
          this.$emit('displayMessage', 'Error ' + res.status, 'error')
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
            <th>First name</th><th>Last name</th><th>Birth date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="data in dataGathered" @click="dataClicked(data)">
            <td>{{ data.firstName }}</td><td>{{ data.lastName }}</td><td>{{ new Date(data.birthDate).toLocaleDateString() }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>  
  </v-card>
</template>

<style scoped>
</style>