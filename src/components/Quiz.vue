<template>
  <v-card :min-height="mh" min-width="400" max-width="800">
    <v-card-text>
      <template v-if="!showResult">
        <v-stepper v-model="current">
          <v-stepper-header class="hidden-lg-and-down">
            <v-stepper-step
              v-for="n in steps"
              :key="`${n}-step`"
              :complete="current > n"
              :step="n"
            ></v-stepper-step>
          </v-stepper-header>

          <v-stepper-items :style="`min-height:${mh}px`">
            <v-stepper-content
              v-for="(q, n) in questions"
              :key="`content-${n}`"
              :step="n + 1"
            >
              <v-form lazy-validation :ref="`form-${n + 1}`" v-model="q.valid">
                <h4 class="mb-8 headline" v-html="q.label"></h4>
                <v-alert type="error" dismissible v-model="answerAlert">
                  please answer the question
                </v-alert>
                <template v-if="q.type === 'multiple'">
                  <v-checkbox
                    v-for="(item, k) in q.items"
                    :key="`item-${k}`"
                    :label="item"
                    :value="item"
                    v-model="q.value"
                  ></v-checkbox>
                </template>
                <template v-else-if="q.type == 'boolean'">
                  <v-radio-group v-model="q.value">
                    <v-radio
                      v-for="(item, k) in q.items"
                      :key="`item-${k}`"
                      :label="item"
                      :value="item"
                    ></v-radio>
                  </v-radio-group>
                </template>
                <template v-else>
                  <p>
                    Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                    Eum, ducimus necessitatibus voluptate exercitationem aut
                    blanditiis hic quisquam omnis, eveniet aliquid quibusdam
                    dolorem nostrum vitae eius dolorum et alias aspernatur
                    delectus?
                  </p>
                </template>
              </v-form>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
      </template>
      <template v-else>
        <v-row justify="center" align="center" :style="`min-height:${mh}px`">
          <v-progress-circular
            v-if="waitingResult"
            indeterminate
            :size="100"
            :width="10"
          ></v-progress-circular>
        </v-row>
      </template>
    </v-card-text>
    <v-card-actions v-if="!showResult" class="my-4">
      <v-row class="justify-space-around">
        <template v-for="(btn, b) in footerButtons">
          <v-btn
            v-if="btn.renderIt"
            :key="b"
            :color="btn.color"
            rounded
            large
            :disabled="btn.disabled"
            @click="btn.cb()"
          >
            {{ btn.text }}
          </v-btn>
        </template>
      </v-row>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator"
import { FooterButton, Question } from "@/types"
import { isEmpty } from "lodash"

@Component
export default class Quiz extends Vue {
  // props
  @Prop() questions!: Question[]

  // data
  /// general
  mh = 400
  /// quiz data
  current = 1
  steps = 1
  valid = true
  /// alert
  answerAlert = false
  /// result
  showResult = false
  waitingResult = true

  // computed
  get footerButtons(): FooterButton[] {
    return [
      {
        text: "cancel",
        color: "error",
        disabled: false,
        cb: () => {
          console.log("cancel")
        },
        renderIt: true,
      },
      {
        text: "submit",
        color: "primary",
        disabled: this.current < this.steps,
        cb: () => {
          this.showResult = true
          console.log(
            Array.from(this.questions, (q) => {
              return q.value
            }),
          )
        },
        renderIt: !(this.current < this.steps),
      },
      {
        text: "next",
        color: "success",
        disabled: false,
        cb: () => {
          this.nextStep(this.current)
        },
        renderIt: this.current < this.steps,
      },
    ]
  }

  // hooks
  beforeMount(): void {
    // insert some props
    this.questions.map((q) => {
      // add more props
      q.value = q.type === "boolean" ? "" : []
      q.valid = false
      q.label = q.question
      q.items = [q.correct_answer, ...q.incorrect_answers]
      // delete non-used props
      delete q.difficulty
      delete q.category
      delete q.incorrect_answers
      delete q.question
    })

    // add last step
    this.questions.push({
      valid: true,
      value: true,
      type: "final",
      label: "thanks",
    })

    // get items count
    this.steps = this.questions.length
  }

  // watch
  @Watch("steps") stepsChanged(val: number): void {
    if (this.current > val) {
      this.current = val
    }
  }

  // methods
  nextStep(n: number): void {
    if (n === this.steps) {
      this.current = 1
    } else {
      if (!isEmpty(this.questions[this.current - 1].value)) {
        this.current = n + 1
        this.answerAlert = false
      } else {
        this.answerAlert = true
      }
    }
  }
}
</script>
