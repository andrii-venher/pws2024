<script>
import { v4 as uuidv4 } from "uuid";

export default {
  data() {
    return {
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
    };
  },
  props: ["task", "tasks", "startDate", "endDate", "projectContributors"],
  emits: ["close"],
  methods: {
    async save() {
      const { valid, _ } = await this.$refs.form.validate();

      if (!valid) {
        return;
      }

      this.input._id = uuidv4();

      this.tasks.push(this.input);

      this.close();
    },
    async update() {
      const { valid, _ } = await this.$refs.form.validate();

      if (!valid) {
        return;
      }

      let index = this.tasks.findIndex((x) => x._id == this.input._id);
      if (index >= 0) {
        this.tasks[index] = this.input;
      }
      this.close();
    },
    clear() {
      this.input = { _id: this.input._id, contractor_ids: [], tasks: [] };
      this.isValid = false;
    },
    close() {
      this.$emit("close");
    },
  },
  mounted() {
    Object.assign(this.input, this.task);
  },
};
</script>

<template>
  <v-form v-model="isValid" ref="form">
    <v-card>
      <v-card-title>{{ input._id ? "Edit data" : "Add data" }}</v-card-title>
      <v-card-subtitle>
        {{ input._id || "New task" }}
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
          :min="startDate"
          :max="endDate"
          v-model="input.startDate"
          :rules="[rules.nonEmpty, rules.validDate]"
        >
        </v-text-field>
        <v-text-field
          type="date"
          variant="outlined"
          label="End date"
          :min="startDate"
          :max="endDate"
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
          :items="projectContributors"
          :item-title="(item) => item.firstName + ' ' + item.lastName"
          item-value="_id"
        ></v-autocomplete>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="elevated" @click="clear">Clear</v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          @click="save"
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
        <v-btn variant="elevated" @click="close">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<style scoped></style>
