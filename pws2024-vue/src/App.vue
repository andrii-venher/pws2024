<script>
import common from './mixins/common'
import LoginDialog from './components/LoginDialog.vue'
import LogoutDialog from './components/LogoutDialog.vue'

export default {
  data() {
    return {
      messageDisplayed: false,
      messageColor: 'red',
      message: '',
      loginDialog: false,
      logoutDialog: false,
      session: {},
      generalError: false
    }
  },
  components: { LoginDialog, LogoutDialog },
  mixins: [ common ],
  methods: {
    onDisplayMessage(text, color) {
      this.message = text
      this.messageColor = color || 'success'
      this.messageDisplayed = true
    },
    onLogin(text, color = 'success') {
      this.loginDialog = false
      this.logoutDialog = false
      if(text) {
        this.onDisplayMessage(text, color)
      }
      if(color == 'success') {
        this.whoami()
        this.$router.push('/')
      }
    },
    whoami() {
      fetch('/api/auth').then(res => {
        res.json().then(data => {
          if (!res.ok) {
            this.generalError = true
          } else {
            this.session = data
          }
        }).catch(err => {
          this.generalError = true
        })
      })
    }
  },
  mounted() {
    this.whoami()
  }
}
</script>

<template>
  <v-app v-if="!generalError">

    <v-navigation-drawer expand-on-hover rail permanent>

      <v-list nav>
        <v-list-item v-for="route in $router.options.routes" :to="route.path" :prepend-icon="route.icon" :title="route.title" exact v-show="!route.roles || checkIfInRole(session, route.roles)"/>
      </v-list>

      <v-spacer></v-spacer>

      <v-list nav>
        <v-list-item key="Login" @click="loginDialog = true" @close="onLogin" prepend-icon="mdi-login" title="Login" exact v-if="!session.username"/>
        <v-list-item key="Logout" @click="logoutDialog = true" @close="onLogin" prepend-icon="mdi-logout" title="Logout" exact v-if="session.username"/>
      </v-list>

    </v-navigation-drawer>

    <v-main>
      <router-view @display-message="onDisplayMessage" :session="session"></router-view>
    </v-main>

    <v-snackbar v-model="messageDisplayed" :color="messageColor" :timeout="5000">
      <div style="width: 100%; text-align: center;">{{ message }}</div>
    </v-snackbar>

    <v-dialog v-model="loginDialog" width="33%">
      <LoginDialog @close="onLogin" />
    </v-dialog>

    <v-dialog v-model="logoutDialog" width="33%">
      <LogoutDialog @close="onLogin" />
    </v-dialog>
  </v-app>

  <v-snackbar v-model="generalError" color="error" timeout="-1">
    <div style="width: 100%; text-align: center;">Backend is not connected</div>
  </v-snackbar>
</template>

<style scoped></style>