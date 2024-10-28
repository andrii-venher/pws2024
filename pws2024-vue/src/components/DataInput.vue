<script>
export default {
  data() {
    return {
      inputData: {
        firstName: '',
        yearOfBirth: 2000
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
      },
      messageDisplayed: false,
      message: ''
    }
  },
  emits: [ 'refreshOutput' ],
  methods: {
    sendClicked() {
      fetch('/api', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(this.inputData)
      })
      .then(res => {
        res.json().then(body => {
          if(res.status < 400) {
            this.message = 'Data accepted'
            this.$emit('refreshOutput')
          } else {
            this.message = 'Backend refused processing the data'
          }
          this.messageDisplayed = true
        })
      })
    }
  }
}
</script>

<template>
  <v-form v-model="isValid">
    <v-card variant="outlined">
      <v-card-title>Enter a data</v-card-title>
      <v-card-text>
        <v-text-field v-model="inputData.firstName" label="First name" variant="outlined" :rules="[ rules.startsWithLetter ]"></v-text-field>
        <v-text-field type=number v-model="inputData.yearOfBirth" label="Year of birth" variant="outlined" :rules="[ rules.validYear ]"></v-text-field>
      </v-card-text>  
      <v-card-actions>
        <v-btn variant="elevated" color="primary" @click="sendClicked" :disabled="!isValid">Send</v-btn>
      </v-card-actions>
    </v-card>
  </v-form>

  <v-snackbar v-model="messageDisplayed">{{ message }}</v-snackbar>
</template>

<style scoped>
</style>