<script>
import TaskEditor from "./TaskEditor.vue";

const projectEndpoint = "/api/project";
const personEndpoint = "/api/person";

export default {
  components: { TaskEditor },
  data() {
    return {
      personItems: [],
      isValid: false,
      input: {},
      rules: {
        nonEmpty: (value) => {
          if (value) {
            return true;
          }
          return "The field should be non-empty.";
        },
        startsWithLetter: (value) => {
          const pattern = /^\p{L}/u;
          return pattern.test(value) || "It should start with a letter";
        },
        validDate: (value) => {
          const date = new Date(value);
          return !!date || "Use a proper date";
        },
      },
      taskEditor: false,
      tasks: [],
    };
  },
  props: ["project", "persons"],
  emits: ["close", "listChanged"],
  methods: {
    async validateForm() {
      const { valid, _ } = await this.$refs.form.validate();

      return valid;
    },
    ensureDataConsistency() {
      this.tasks.forEach((element) => {
        element.contractor_ids = element.contractor_ids.filter((x) =>
          this.input.contractor_ids.includes(x)
        );
        if (element.startDate < this.input.startDate) {
          element.startDate = this.input.startDate;
        }
        if (element.endDate > this.input.endDate) {
          element.endDate = this.input.endDate;
        }
      });
    },
    async send() {
      if (!(await this.validateForm())) {
        return;
      }

      this.ensureDataConsistency();

      this.input.tasks = this.tasks;

      fetch(projectEndpoint, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(this.input),
      }).then((res) => {
        res
          .json()
          .then((data) => {
            if (!res.ok) {
              this.$emit("close", data.error, "error");
            } else {
              this.input = {};
              this.$emit("close", `Project ${data.name} - added`);
              this.$emit("listChanged");
            }
          })
          .catch((err) => {
            this.$emit("close", "Data discarded", "error");
          });
      });
    },
    async update() {
      if (!(await this.validateForm())) {
        return;
      }

      this.ensureDataConsistency();

      this.input.tasks = this.tasks;

      fetch(projectEndpoint, {
        method: "PUT",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(this.input),
      }).then((res) => {
        res
          .json()
          .then((data) => {
            if (!res.ok) {
              this.$emit("close", data.error, "error");
            } else {
              this.input = {};
              this.$emit("close", `Project ${data.name} - updated`);
              this.$emit("listChanged");
            }
          })
          .catch((err) => {
            this.$emit("close", "Data discarded", "error");
          });
      });
    },
    remove() {
      fetch(
        projectEndpoint + "?" + new URLSearchParams({ _id: this.input._id }),
        {
          method: "DELETE",
        }
      ).then((res) => {
        res
          .json()
          .then((data) => {
            if (!res.ok) {
              this.$emit("close", data.error, "error");
            } else {
              this.input = {};
              this.$emit("close", `Project ${data.name} - deleted`);
              this.$emit("listChanged");
            }
          })
          .catch((err) => {
            this.$emit("close", "Data discarded", "error");
          });
      });
    },
    setData(data) {
      this.input = {};
      Object.assign(this.input, data);
    },
    clear() {
      this.input = { _id: this.input._id };
      this.isValid = false;
      this.$refs.form.resetValidation();
    },
    close() {
      this.$emit("close");
    },
    addTask() {
      this.taskEditor = true;
      this.task = {};
    },
    editTask(task) {
      this.ensureDataConsistency();
      this.taskEditor = true;
      this.task = task;
    },
    removeTask(task) {
      let index = this.tasks.findIndex((x) => x._id == task._id);
      if (index >= 0) {
        this.tasks.splice(index, 1);
      }
    },
    editorClose(text, color) {
      this.taskEditor = false;
      if (text) {
        this.$emit("displayMessage", text, color);
      }
    },
  },
  mounted() {
    Object.assign(this.input, this.project);
    this.tasks = JSON.parse(JSON.stringify(this.input.tasks));
    fetch(
      personEndpoint +
        "?" +
        new URLSearchParams({ sort: "lastName", order: 1 }).toString()
    ).then((res) =>
      res.json().then((facet) => {
        this.personItems = facet.data;
      })
    );
  },
};
</script>

<template>
  <v-form v-model="isValid" ref="form">
    <v-card>
      <v-card-title>{{ input._id ? "Edit data" : "Add data" }}</v-card-title>

      <v-card-subtitle>
        {{ input._id || "new project" }}
      </v-card-subtitle>
      <v-card-text>
        <v-text-field
          variant="outlined"
          label="Name"
          v-model="input.name"
          :rules="[rules.nonEmpty, rules.startsWithLetter]"
        >
        </v-text-field>
        <v-text-field
          type="date"
          variant="outlined"
          label="Start date"
          v-model="input.startDate"
          :rules="[rules.nonEmpty, rules.validDate]"
        >
        </v-text-field>
        <v-text-field
          type="date"
          variant="outlined"
          label="End date"
          v-model="input.endDate"
          :rules="[rules.validDate]"
        >
        </v-text-field>
        <v-autocomplete
          variant="outlined"
          v-model="input.contractor_ids"
          chips
          label="Contractors"
          multiple
          :items="personItems"
          :item-title="(item) => item.firstName + ' ' + item.lastName"
          item-value="_id"
        ></v-autocomplete>
        <v-list>
          <v-list-subheader>Tasks</v-list-subheader>

          <v-list-item
            v-for="task in tasks"
            :key="task.name"
            :subtitle="task._id"
            :title="task.name"
          >
            <template v-slot:prepend>
              <v-avatar color="grey-lighten-1">
                <v-icon color="white">mdi-code-brackets</v-icon>
              </v-avatar>
            </template>

            <template v-slot:append>
              <v-btn
                color="grey-lighten-1"
                icon="mdi-pencil-circle"
                variant="text"
                @click="() => editTask(task)"
              ></v-btn>
              <v-btn
                color="grey-lighten-1"
                icon="mdi-close-circle"
                variant="text"
                @click="() => removeTask(task)"
              ></v-btn>
            </template>
          </v-list-item>
        </v-list>
        <v-btn @click="addTask">Add Task</v-btn>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="elevated" @click="clear">Clear</v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          @click="send"
          v-if="!input._id"
          >Save</v-btn
        >
        <v-btn
          color="secondary"
          variant="elevated"
          @click="update"
          v-if="input._id"
          >Update</v-btn
        >
        <v-btn color="error" variant="elevated" @click="remove" v-if="input._id"
          >Delete</v-btn
        >
        <v-btn variant="elevated" @click="close">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-form>

  <v-dialog v-model="taskEditor" width="50%">
    <TaskEditor
      :task="task"
      :tasks="tasks"
      :projectContributors="
        personItems.filter((p) => this.input.contractor_ids.includes(p._id))
      "
      :startDate="input.startDate"
      :endDate="input.endDate"
      @close="editorClose"
      @list-changed="tableKey++"
    />
  </v-dialog>
</template>

<style scoped></style>
