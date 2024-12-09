<script>

    const authEndpoint = '/api/auth'

    export default {
        emits: [ 'close' ],
        methods: {
           logout() {
              fetch(authEndpoint, {
                method: 'DELETE'
              }).then(res => {
                res.json().then(data => {
                    if(!res.ok) {
                        this.$emit('close', data.error, 'error')
                    } else {
                        this.$emit('close', 'Successful logout')
                    }
                }).catch(err => {
                    this.$emit('close', 'Backend does not respond', 'error')
                })
              })
           },
           close() {
                this.$emit('close')
           }  
        }
    }
</script>

<template>
    <v-card>
        <v-card-title>Logout</v-card-title>
        <v-card-text>
            Are you sure?
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" variant="elevated" @click="logout">Logout</v-btn>
            <v-btn variant="elevated" @click="close">Close</v-btn>
        </v-card-actions>
    </v-card>
</template>

<style scoped>
</style>