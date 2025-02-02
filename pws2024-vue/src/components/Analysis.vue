<script>
import FrappeGantt from "./frappe-gantt.vue";

const projectEndpoint = "/api/project";

export default {
  components: { FrappeGantt },
  data() {
    return {
      projects: [],
      selectedProjectId: null,
    };
  },
  computed: {
    selectedProject() {
      return (
        this.projects.find((p) => p._id === this.selectedProjectId) || null
      );
    },
    formattedProjects() {
      return this.projects.map((p) => this.formatTask(p));
    },
    formattedTasks() {
      return this.selectedProject
        ? this.selectedProject.tasks.map((t) => this.formatTask(t))
        : [];
    },
  },
  methods: {
    formatTask(item) {
      const today = new Date().toISOString().substr(0, 10);
      return {
        id: item._id,
        name: item.name,
        start: item.startDate,
        end: item.endDate || (today > item.startDate ? today : item.startDate),
        progress: item.endDate ? 100 : 0,
      };
    },
  },
  mounted() {
    this.websocket = new WebSocket("ws://" + window.location.host + "/ws");
    this.websocket.onopen = () => {
      console.log("Websocket connection established");
    };
    this.websocket.onmessage = (event) => {
      let data = {};
      try {
        data = JSON.parse(event.data);
      } catch (err) {
        console.error("JSON expected, got", event.data);
        return;
      }

      if (data.type != "project") {
        return;
      }

      if (data.operation == "add") {
        this.projects.push(data.project);
      } else if (data.operation == "update") {
        let index = this.projects.findIndex((p) => p._id == data.project._id);
        if (index >= 0) {
          this.projects[index] = data.project;
        }
      } else if (data.operation == "remove") {
        let index = this.projects.findIndex((p) => p._id == data.project._id);
        if (index >= 0) {
          this.projects.splice(index, 1);
        }
      }
    };
    fetch(projectEndpoint).then((res) =>
      res
        .json()
        .then((facet) => {
          this.projects = facet.data;
        })
        .catch((error) => console.error("Error fetching projects:", error))
    );
  },
};
</script>

<template>
  <div>
    <h1>Analysis</h1>

    <h2>All projects</h2>
    <FrappeGantt :tasks="formattedProjects" viewMode="Day" />

    <v-select
      v-model="selectedProjectId"
      label="Select a project"
      :items="projects"
      item-title="name"
      item-value="_id"
    />

    <h2 v-if="selectedProject">Tasks for {{ selectedProject.name }}</h2>
    <FrappeGantt
      v-if="selectedProject"
      :tasks="formattedTasks"
      viewMode="Day"
    />
  </div>
</template>
