<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <div class="d-flex align-center">
        <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png"
          transition="scale-transition"
          width="40"
        />
      </div>

      <v-spacer></v-spacer>
      <v-app-bar-nav-icon @click="$vuetify.theme.dark = !$vuetify.theme.dark">
        <v-icon>fa-{{ $vuetify.theme.dark ? "sun" : "moon" }}</v-icon>
      </v-app-bar-nav-icon>
    </v-app-bar>

    <v-main class="primary">
      <v-container class="fill-height justify-center">
        <Quiz
          v-if="startQuiz"
          v-on:cancel-quiz="startQuiz = !startQuiz"
          :questions.sync="questions"
        />
        <v-card v-else class="text-capitalize" elevation="4">
          <v-card-title class="justify-center">quiz app</v-card-title>
          <v-card-subtitle class="mb-5 mt-2">
            choose the options, to start the quiz
          </v-card-subtitle>
          <v-card-text>
            <v-autocomplete
              :items="categories"
              v-model="category"
              label="Select Category"
              item-text="name"
              item-value="name"
              persistent-hint
              single-line
              return-object
              prepend-icon="fa-graduation-cap"
              filled
              hint="If you didn't choice you will get random category questions"
            ></v-autocomplete>
            <v-select
              :items="diffs"
              v-model="diff"
              label="Select Difficulty"
              persistent-hint
              single-line
              prepend-icon="fa-layer-group"
              filled
            ></v-select>
            <v-select
              :items="types"
              v-model="type"
              label="Select Questions Type"
              persistent-hint
              single-line
              prepend-icon="fa-tasks"
              filled
            ></v-select>
          </v-card-text>
          <v-card-actions>
            <v-btn
              class="text-center"
              color="primary"
              block
              @click="getQuestions()"
              :disabled="!diff"
              :loading="loading"
            >
              <span class="mr-2">get started</span>
              <v-icon>fa-angle-double-right</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import Quiz from "./components/Quiz.vue";
import axios from "axios";
import { Category, Question } from "./types";

@Component({
  components: { Quiz }
})
export default class App extends Vue {
  // data
  /// amount
  amount?: number = 10;
  /// category
  category: Category = {};
  categories: Category[] = [];
  /// diff
  diff?: string = "";
  diffs: string[] = ["easy", "medium", "hard"];
  /// type
  types: string[] = ["boolean", "multiple"];
  type: string = this.types[0];
  /// questions
  questions: Question[] = [];
  /// start it
  startQuiz?: boolean = false;
  loading?: boolean = false;

  // hooks
  created(): void {
    axios.get("https://opentdb.com/api_category.php").then(({ data }) => {
      data.trivia_categories.forEach((c: Category): void => {
        this.categories.push(c);
      });
    });
  }

  // methods
  getQuestions(): void {
    this.loading = true;

    /// api url
    let apiURL = `https://opentdb.com/api.php?amount=${this.amount}&difficulty=${this.diff}&type=${this.type}`;

    if (this.category.id) {
      apiURL += `&category=${this.category.id}`;
    }

    axios
      .get(apiURL)
      .then(({ data: { results } }): void => {
        results.forEach((q: Question): void => {
          this.questions.push(q);
        });
      })
      .then(() => {
        this.startQuiz = true;
        this.loading = false;
      });
  }

  // watch
  @Watch("startQuiz") startQuizChanged(v: boolean): void {
    if (!v) {
      this.questions = [];
      this.diff = "";
      this.category = {};
      this.type = this.types[0];
    }
  }
}
</script>
