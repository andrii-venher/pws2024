<script>
export default {
    props: [ 'session' ],
    emits: [ 'display-message' ]
}
</script>

<template>
    <h1>Dashboard</h1>
    <p v-if="session.username">Nice to meet you, <em>{{ session.username }}</em></p>
</template>