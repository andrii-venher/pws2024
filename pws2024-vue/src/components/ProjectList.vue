<script>
import common from "../mixins/common";
import ProjectEditor from "./ProjectEditor.vue";

const projectEndpoint = "/api/project";
const personEndpoint = "/api/person";

export default {
  components: { ProjectEditor },
  emits: ["displayMessage"],
  props: ["session"],
  mixins: [common],
  data() {
    return {
      projects: [],
      project: {},
      persons: [],
      editor: false,
      itemsPerPage: 10,
      headers: [
        { title: "Name", key: "name", align: "start", sortable: true },
        { title: "Start date", key: "startDate", align: "end" },
        { title: "End date", key: "endDate", align: "end" },
        { title: "#Contractors", key: "contractor_ids", align: "end" },
      ],
      loading: false,
      search: "",
      itemsLength: 0,
      serverItems: [],
      tableKey: 0,
    };
  },
  methods: {
    loadItems({ page, itemsPerPage, sortBy }) {
      this.loading = true;
      const skip = (page - 1) * itemsPerPage;
      let queryString = { skip, limit: itemsPerPage, search: this.search };
      if (sortBy && sortBy[0]) {
        queryString.sort = sortBy[0].key;
        queryString.order = sortBy[0].order == "asc" ? 1 : -1;
      }
      fetch(
        projectEndpoint + "?" + new URLSearchParams(queryString).toString()
      ).then((res) =>
        res.json().then((facet) => {
          this.itemsLength = +facet.total;
          this.serverItems = facet.data;
          this.loading = false;
        })
      );
    },
    clickItem(item, event) {
      if (this.checkIfInRole(this.session, [0])) {
        this.project = event.item;
        this.editor = true;
      }
    },
    add() {
      this.project = { contractor_ids: [], tasks: [] };
      this.editor = true;
    },
    editorClose(text, color) {
      this.editor = false;
      if (text) {
        this.$emit("displayMessage", text, color);
      }
    },
  },
  mounted() {
    fetch(
      personEndpoint +
        "?" +
        new URLSearchParams({ sort: "firstName", order: 1 }).toString()
    ).then((res) =>
      res.json().then((facet) => {
        this.persons = facet.data;
      })
    );
  },
};
</script>

<template>
  <v-card variant="outlined">
    <v-card-title class="d-flex">
      Projects
      <v-spacer></v-spacer>
      <v-btn @click="add" v-show="checkIfInRole(session, [0])">Add</v-btn>
    </v-card-title>
    <v-card-text>
      <v-data-table-server
        v-model:items-per-page="itemsPerPage"
        :headers="headers"
        :items="serverItems"
        :items-length="itemsLength"
        :loading="loading"
        :search="search"
        :key="tableKey"
        @update:options="loadItems"
        @click:row="clickItem"
        itemsPerPageText="# items on page"
        pageText="{0}-{1} of {2}"
        density="compact"
      >
        <template #item.startDate="{ item }">
          {{ new Date(item.startDate).toLocaleDateString() }}
        </template>
        <template #item.endDate="{ item }">
          {{ item.endDate ? new Date(item.endDate).toLocaleDateString() : "" }}
        </template>
        <template #item.contractor_ids="{ item }">
          {{ item.contractor_ids ? item.contractor_ids.length : 0 }}
        </template>
        <template #footer.prepend>
          <v-text-field
            v-model="search"
            class="mr-5"
            variant="outlined"
            density="compact"
            placeholder="search..."
            hide-details
            prepend-icon="mdi-magnify"
          ></v-text-field>
        </template>
      </v-data-table-server>
    </v-card-text>
  </v-card>

  <v-dialog v-model="editor" width="50%">
    <ProjectEditor
      :project="project"
      :persons="persons"
      @close="editorClose"
      @list-changed="tableKey++"
    />
  </v-dialog>
</template>

<style scoped></style>
