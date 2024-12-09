<script>
export default {
    props: [ 'session' ]
}
</script>

<template>
    <h1>Dashboard</h1>
    <h3>{{ session.username }}</h3>
</template>