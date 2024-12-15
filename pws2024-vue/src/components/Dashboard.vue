<script>
import common from '../mixins/common'

export default {
    props: [ 'session' ],
    emits: [ 'display-message' ],
    mixins: [ common ]
}
</script>

<template>
    <h1>Dashboard</h1>
    <p v-if="session.username">Nice to meet you, <em>{{ session.username }}</em></p>
    <i v-if="checkIfInRole(session, [0])">caution! privileged user</i>
</template>