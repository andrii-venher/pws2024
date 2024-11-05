<script>
export default {
  data() {
    return {
      inputData: {
        _id: '',
        firstName: '',
        yearOfBirth: ''
      },
      isValid: false,
      rules: {
        startsWithLetter: (value) => {
          if(/^[A-Z]/.test(value)) return true
          return 'It should start with a capital letter'
        },
        validYear: (value) => {
          let numValue = parseInt(value)
          if(numValue >= 1900 && numValue <= 2024) return true
          return 'Out of range 1900-2024'
        }
      }
    }
  },
  emits: [ 'refreshOutput', 'displayMessage' ],
  methods: {
    createClicked() {
      delete this.inputData._id
      fetch('/api', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(this.inputData)
      })
      .then(res => {
        res.json().then(body => {
          if(res.status < 400) {
            this.$emit('displayMessage', 'Data created')
            this.$emit('refreshOutput')
          } else {
            this.$emit('displayMessage', body.error, 'error')
          }
        })
      })
    },
    updateClicked() {
      fetch('/api', {
        method: 'PUT',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(this.inputData)
      })
      .then(res => {
        res.json().then(body => {
          if(res.status < 400) {
            this.$emit('displayMessage', 'Data updated')
            this.$emit('refreshOutput')
          } else {
            this.$emit('displayMessage', body.error, 'error')
          }
        })
      })
    },
    clearClicked() {
      this.inputData = {}
    },
    importData(data) {
      this.inputData = data
    }
  }
}
</script>

<template>
  <v-form v-model="isValid">
    <v-card variant="outlined">
      <v-card-title>
        Enter a data
        <v-spacer></v-spacer>
      </v-card-title>
      <v-card-subtitle>
        {{ inputData._id || 'to create' }}
      </v-card-subtitle>
      <v-card-text>
        <v-text-field v-model="inputData.firstName" label="First name" variant="outlined" :rules="[ rules.startsWithLetter ]"></v-text-field>
        <v-text-field type=number v-model="inputData.yearOfBirth" label="Year of birth" variant="outlined" :rules="[ rules.validYear ]"></v-text-field>
      </v-card-text>  
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="elevated" @click="clearClicked">Clear</v-btn>
        <v-btn variant="elevated" color="primary" @click="createClicked" :disabled="!isValid" v-if="!inputData._id">Create</v-btn>
        <v-btn variant="elevated" color="secondary" @click="updateClicked" :disabled="!isValid" v-if="inputData._id">Update</v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<style scoped>
</style>