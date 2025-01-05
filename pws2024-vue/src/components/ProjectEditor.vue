<script>

    const projectEndpoint = '/api/project'

    export default {
        data() {
            return {
                isValid: false,
                input: {},
                rules: {
                    startsWithLetter: value => {
                        const pattern = /^\p{L}/u
                        return pattern.test(value) || 'It should start with a letter'
                    },
                    validDate: value => {
                        const date = new Date(value)
                        return !!date || 'Use a proper date'
                    }
                }
            }
        },
        props: [ 'project', 'persons' ],
        emits: [ 'close', 'listChanged' ],
        methods: {
           send() {
              fetch(projectEndpoint, {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(this.input)
              }).then(res => {
                res.json().then(data => {
                    if(!res.ok) {
                        this.$emit('close', data.error, 'error')
                    } else {
                        this.input = {}
                        this.$emit('close', `Project ${data.name} - added`)
                        this.$emit('listChanged')
                    }
                }).catch(err => {
                    this.$emit('close', 'Data discarded', 'error')
                })
              })
           },
           update() {
              fetch(projectEndpoint, {
                method: 'PUT',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(this.input)
              }).then(res => {
                res.json().then(data => {
                    if(!res.ok) {
                        this.$emit('close', data.error, 'error')
                    } else {
                        this.input = {}
                        this.$emit('close', `Project ${data.name} - updated`)
                        this.$emit('listChanged')
                    }
                }).catch(err => {
                    this.$emit('close', 'Data discarded', 'error')
                })
              })
           },
           remove() {
              fetch(projectEndpoint + '?' + new URLSearchParams({ _id: this.input._id }), {
                method: 'DELETE'
              }).then(res => {
                res.json().then(data => {
                    if(!res.ok) {
                        this.$emit('close', data.error, 'error')
                    } else {
                        this.input = {}
                        this.$emit('close', `Project ${data.name} - deleted`)
                        this.$emit('listChanged')
                    }
                }).catch(err => {
                    this.$emit('close', 'Data discarded', 'error')
                })
              })
           },
           setData(data) {
              this.input = {}
              Object.assign(this.input, data)
           },
           clear() {
                this.input = { _id: this.input._id }
                this.isValid = false
           },
           close() {
                this.$emit('close')
           }  
        },
        mounted() {
            Object.assign(this.input, this.project)
        }
    }
</script>

<template>
    <v-form v-model="isValid">
        <v-card>
            <v-card-title>{{ input._id ? 'Edit data' : 'Add data' }}</v-card-title>
            <v-card-subtitle>
                {{  input._id || 'new project' }}
            </v-card-subtitle>
            <v-card-text>
                <v-text-field variant="outlined" label="Name" v-model="input.name" :rules="[ rules.startsWithLetter ]">
                </v-text-field>
                <v-text-field type="date" variant="outlined" label="Start date" v-model="input.startDate" :rules="[ rules.validDate ]">
                </v-text-field>
                <v-text-field type="date" variant="outlined" label="End date" v-model="input.endDate" :rules="[ rules.validDate ]">
                </v-text-field>
                <v-autocomplete
                    label="Contractors" variant="outlined" multiple v-model="input.contractor_ids"
                    :items="persons" :item-title="item => item.firstName + ' ' + item.lastName" item-value="_id"
                >
                </v-autocomplete>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="elevated" @click="clear">Clear</v-btn>
                <v-btn color="primary" variant="elevated" @click="send" :disabled="!isValid" v-if="!input._id">Save</v-btn>
                <v-btn color="secondary" variant="elevated" @click="update" :disabled="!isValid" v-if="input._id">Update</v-btn>
                <v-btn color="error" variant="elevated" @click="remove" v-if="input._id">Delete</v-btn>
                <v-btn variant="elevated" @click="close">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-form>

</template>

<style scoped>
</style>