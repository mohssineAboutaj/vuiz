<template>
  <v-app>
    <v-app-bar color="primary" dark fixed>
      <div class="d-flex align-center">
        <v-img
          alt="Vuetify Logo"
          src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png"
          transition="scale-transition"
          width="40"
        />
      </div>
      <v-spacer></v-spacer>
      <v-app-bar-title class="text-capitalize">vuiz</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-app-bar-nav-icon @click="$vuetify.theme.dark = !$vuetify.theme.dark">
        <v-icon>fa-{{ $vuetify.theme.dark ? "sun" : "moon" }}</v-icon>
      </v-app-bar-nav-icon>
    </v-app-bar>

    <v-main class="primary fill-height">
      <v-parallax
        src="https://cdn.vuetifyjs.com/images/backgrounds/vbanner.jpg"
        :height="height"
      >
        <v-container class="fill-height justify-center">
          <template v-if="!gettingStarter">
            <v-card
              class="text-capitalize"
              color="transparent"
              dark
              elevation="0"
            >
              <v-card-title class="justify-center display-3">
                vuiz
              </v-card-title>
              <v-card-subtitle class="justify-center display-1 mt-4 mb-10">
                take the quiz &amp; test your knowledge
              </v-card-subtitle>
              <v-card-actions class="justify-center">
                <v-btn
                  large
                  elevation="2"
                  class="white primary--text pa-4"
                  rounded
                  @click="gettingStarter = true"
                >
                  getting started
                </v-btn>
              </v-card-actions>
            </v-card>
          </template>
          <template v-else>
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
                <v-col cols="12">
                  <v-subheader class="pl-0">
                    Select Questions Count
                  </v-subheader>
                  <v-slider
                    v-model="amount"
                    thumb-label="always"
                    max="50"
                    min="1"
                    prepend-icon="fa-file-alt"
                  ></v-slider>
                </v-col>
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
          </template>
        </v-container>
      </v-parallax>
    </v-main>

    <v-footer
      class="text-capitalize justify-center"
      color="transparent"
      dark
      fixed
    >
      <div class="mx-auto">
        <v-icon class="mr-2">fa-copyright</v-icon> 2020 - mohssine aboutaj
      </div>
    </v-footer>
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
  /// paralax
  height?: number = 100;
  gettingStarter = false;
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
  beforeMount(): void {
    this.height = window.innerHeight;
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
