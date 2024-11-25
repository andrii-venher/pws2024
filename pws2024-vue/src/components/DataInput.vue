<script>
export default {
  data() {
    return {
      inputData: {},
      isValid: false,
      rules: {
        startsWithCapital: (value) => {
          if (/^[A-Z]/.test(value)) return true
          return 'It should start with a capital letter'
        },
        startsWithLetter: (value) => {
          if (/^[A-Za-z]/.test(value)) return true
          return 'It should start with a letter'
        },
        validDate: (value) => {
          let numValue = Date.parse(value)
          return isNaN(numValue) ? 'Invalid date' : true
        }
      }
    }
  },
  props: [ 'edit' ],
  emits: [ 'refreshOutput', 'displayMessage', 'closeDialog' ],
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
            if (res.ok) {
              this.$emit('displayMessage', body.firstName + ' ' + body.lastName + ' was created')
              this.$emit('refreshOutput')
              this.$emit('closeDialog')
            } else {
              this.$emit('displayMessage', 'Error ' + res.status, 'error')
            }
          }).catch(err => {
            this.$emit('displayMessage', 'General problem', 'error')
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
            if (res.ok) {
              this.$emit('displayMessage', body.firstName + ' ' + body.lastName + ' was updated')
              this.$emit('refreshOutput')
              this.$emit('closeDialog')
            } else {
              this.$emit('displayMessage', 'Error ' + res.status, 'error')
            }
          }).catch(err => {
            this.$emit('displayMessage', 'General problem', 'error')
          })
        })
    },
    deleteClicked() {
      fetch('/api?_id=' + this.inputData._id, {
        method: 'DELETE'
      })
        .then(res => {
          res.json().then(body => {
            if (res.ok) {
              this.$emit('displayMessage', body.firstName + ' ' + body.lastName + ' was deleted')
              this.$emit('refreshOutput')
              this.$emit('closeDialog')
            } else {
              this.$emit('displayMessage', 'Error ' + res.status, 'error')
            }
          }).catch(err => {
            this.$emit('displayMessage', 'General problem', 'error')
          })
        })
    },
    clearClicked() {
      this.inputData = {}
    },
    cancelClicked() {
      this.$emit('closeDialog')
    },
    importData() {
      this.clearClicked()
      Object.assign(this.inputData, this.edit)
    }
  },
  mounted() {
    this.importData()
  }
}
</script>

<template>
  <v-form v-model="isValid">
    <v-card>
      <v-card-title>
        Enter a data
        <v-spacer></v-spacer>
      </v-card-title>
      <v-card-subtitle>
        {{ inputData._id || 'to create' }}
      </v-card-subtitle>
      <v-card-text>
        <v-text-field v-model="inputData.firstName" label="First name" variant="outlined"
          :rules="[rules.startsWithCapital]"></v-text-field>
        <v-text-field v-model="inputData.lastName" label="Last name" variant="outlined"
          :rules="[rules.startsWithLetter]"></v-text-field>
        <v-text-field type="date" v-model="inputData.birthDate" label="Birth date" variant="outlined"
          :rules="[rules.validDate]"></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="elevated" @click="clearClicked">Clear</v-btn>
        <v-btn variant="elevated" color="primary" @click="createClicked" :disabled="!isValid"
          v-if="!inputData._id">Create</v-btn>
        <v-btn variant="elevated" color="secondary" @click="updateClicked" :disabled="!isValid"
          v-if="inputData._id">Update</v-btn>
        <v-btn variant="elevated" color="error" @click="deleteClicked" v-if="inputData._id">Delete</v-btn>
        <v-btn variant="elevated" @click="cancelClicked">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<style scoped>
</style>