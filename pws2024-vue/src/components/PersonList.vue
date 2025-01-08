<script>
    import common from '../mixins/common'
    import PersonEditor from './PersonEditor.vue'

    const personEndpoint = '/api/person'

    export default {
        components: { PersonEditor },
        emits: [ 'displayMessage' ],
        props: [ 'session' ],
        mixins: [ common ],
        data() {
            return {
                persons: [],
                person: {},
                editor: false,
                itemsPerPage: 10,
                headers: [
                    { title: 'First name', key: 'firstName', align: 'start', sortable: true },
                    { title: 'Last name', key: 'lastName', align: 'start' },
                    { title: 'Birth date', key: 'birthDate', align: 'end' },
                    { title: '#Projects', key: 'project_ids', align: 'end' }
                ],
                loading: false,
                search: '',
                itemsLength: 0,
                serverItems: [],
                tableKey: 0
            }
        },
        methods: {
            loadItems({ page, itemsPerPage, sortBy }) {
                this.loading = true
                const skip = (page - 1) * itemsPerPage
                let queryString = { skip, limit: itemsPerPage, search: this.search }
                if(sortBy && sortBy[0]) {
                    queryString.sort = sortBy[0].key
                    queryString.order = sortBy[0].order == 'asc' ? 1 : -1
                } else {
                    queryString.sort = 'lastName'
                    queryString.order = 1
                }           
                fetch(personEndpoint + '?' + 
                    new URLSearchParams(queryString).toString())
                .then(res => res.json().then(facet => {
                    this.itemsLength = +facet.total
                    this.serverItems = facet.data
                    this.loading = false
                }))
            },
            clickItem(item, event) {
                if(this.checkIfInRole(this.session, [0])) {
                    this.person = event.item
                    this.editor = true
                }
            },
            add() {
                this.person = {}
                this.editor = true
            },
            editorClose(text, color) {
                this.editor = false
                if(text) {
                    this.$emit('displayMessage', text, color)
                }
            }
        }
    }
</script>

<template>
    <v-card variant="outlined">
        <v-card-title class="d-flex">
            Persons
            <v-spacer></v-spacer>
            <v-btn @click="add" v-show="checkIfInRole(session, [0])">Add</v-btn>
        </v-card-title>
        <v-card-text>
            <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers" :items="serverItems"
                :items-length="itemsLength" :loading="loading" :search="search" :key="tableKey"
                @update:options="loadItems" @click:row="clickItem"
                itemsPerPageText="# items on page" pageText="{0}-{1} of {2}" density="compact">
                <template #item.birthDate="{ item }">
                    {{ new Date(item.birthDate).toLocaleDateString() }}
                </template>
                <template #item.project_ids="{ item }">
                    {{ item.project_ids ? item.project_ids.length : 0 }}
                </template>
                <template #footer.prepend>
                    <v-text-field v-model="search" class="mr-5" variant="outlined" density="compact" placeholder="search..."
                        hide-details prepend-icon="mdi-magnify"></v-text-field>                   
                </template>
            </v-data-table-server>
        </v-card-text>
    </v-card>

    <v-dialog v-model="editor" width="50%">
        <PersonEditor :person="person" @close="editorClose" @list-changed="tableKey++"/>
    </v-dialog>
</template>

<style scoped>
</style>