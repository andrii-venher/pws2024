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
<v-app>

  <v-navigation-drawer expand-on-hover rail permanent>

    <v-list nav>
        <v-list-item href="/#/" prepend-icon="mdi-home" title="Dashboard" exact/>
        <v-list-item href="/#/persons" prepend-icon="mdi-account-tie-woman" title="Persons" exact/>
    </v-list>

  </v-navigation-drawer>

  <v-main>
    <router-view @display-message="onDisplayMessage"></router-view>
  </v-main>

  <v-snackbar v-model="messageDisplayed" :color="messageColor">
    <div style="width: 100%; text-align: center;">{{ message }}</div>
  </v-snackbar>

</v-app>
</template>

<style scoped>
</style>