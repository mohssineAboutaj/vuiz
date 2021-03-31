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
        <Quiz v-if="startQuiz" :questions.sync="questions" />
        <v-card v-else class="text-capitalize" elevation="4">
          <v-card-title class="justify-center">quiz app</v-card-title>
          <v-card-subtitle>choose the options</v-card-subtitle>
          <v-card-text>
            <v-select
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
            ></v-select>
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
              prepend-icon="fa-list"
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
import { Component, Vue } from "vue-property-decorator"
import Quiz from "./components/Quiz.vue"
import axios from "axios"
import { Category } from "./types"

@Component({
  components: { Quiz },
})
export default class App extends Vue {
  // data
  /// amount
  amount = 10
  /// category
  category: Category = {}
  categories: Category[] = []
  /// diff
  diff = ""
  diffs = ["easy", "medium", "hard"]
  /// type
  types = ["boolean", "multiple"]
  type = this.types[0]
  /// questions
  questions = []
  /// start it
  startQuiz = false
  loading = false

  // hooks
  created(): void {
    axios.get("https://opentdb.com/api_category.php").then(({ data }) => {
      data.trivia_categories.forEach((c: never): void => {
        this.categories.push(c)
      })
    })
  }

  // methods
  getQuestions(): void {
    this.loading = true

    let url = `https://opentdb.com/api.php?amount=${this.amount}&difficulty=${this.diff}&type=${this.type}`

    if (this.category.id) {
      url += `&category=${this.category.id}`
    }

    axios
      .get(url)
      .then(({ data: { results } }): void => {
        results.forEach((q: never): void => {
          this.questions.push(q)
        })
      })
      .then(() => {
        // this.questions.map((q) => {
        //   if (this.type === "boolean") {
        //     q.correct_answer = JSON.parse(q.correct_answer.toLowerCase())
        //     q.incorrect_answers[0] = JSON.parse(
        //       q.incorrect_answers[0].toLowerCase(),
        //     )
        //   }
        // })
        this.startQuiz = true
        this.loading = false
      })
  }
}
</script>
