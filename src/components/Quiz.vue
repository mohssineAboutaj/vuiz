<template>
  <div class="quiz-component">
    <v-card :min-height="mh" min-width="400" max-width="500">
      <v-card-title class="justify-center headline text-capitalize">
        <template v-if="current < steps">
          question {{ current }}/{{ questionsLength }}
        </template>
        <template v-else>
          quiz finished
        </template>
      </v-card-title>
      <v-card-text>
        <template v-if="!showResult">
          <v-stepper v-model="current">
            <v-stepper-items :style="`min-height:${mh}px`">
              <v-stepper-content
                v-for="(q, n) in questions"
                :key="`content-${n}`"
                :step="n + 1"
              >
                <v-form
                  lazy-validation
                  :ref="`form-${n + 1}`"
                  v-model="q.valid"
                >
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
                    <v-list class="text-capitalize headline">
                      <v-list-item>
                        Thank you for participating in our quiz!
                      </v-list-item>
                      <v-list-item>
                        please click submit button to get your result
                      </v-list-item>
                    </v-list>
                  </template>
                </v-form>
              </v-stepper-content>
            </v-stepper-items>
          </v-stepper>
        </template>
        <template v-else>
          <div v-if="waitingResult" class="py-5">
            <v-alert type="info" icon="fa-spinner">
              please wait...
            </v-alert>
            <v-row
              justify="center"
              align="center"
              :style="`min-height:${mh}px`"
            >
              <v-progress-circular
                indeterminate
                :size="100"
                :width="10"
                color="primary"
              ></v-progress-circular>
            </v-row>
          </div>
          <div v-else class="py-5">
            <v-alert :type="setResult(points).color">
              {{ setResult(points).text }}
            </v-alert>
            <v-row justify="center" align="center" class="my-10">
              <v-progress-circular
                :rotate="-90"
                :value="points"
                :size="100"
                :width="10"
                color="primary"
              >
                {{ points }}%
              </v-progress-circular>
            </v-row>
            <v-list class="text-capitalize">
              <v-list-item>
                <v-list-item-icon>
                  <v-icon>fa-clock</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>
                    your time is <b>{{ quizTime }}</b>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-icon>
                  <v-icon>fa-tasks</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>
                    you have answered to {{ passed }} from {{ questionsLength }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </div>
        </template>
      </v-card-text>
      <v-card-actions>
        <v-row class="justify-space-around">
          <template v-for="(btn, b) in footerButtons">
            <v-btn
              v-if="btn.renderIt"
              :key="b"
              :color="btn.color"
              rounded
              large
              :disabled="btn.disabled"
              class="my-4"
              @click="btn.cb()"
            >
              {{ btn.text }}
            </v-btn>
          </template>
        </v-row>
      </v-card-actions>
    </v-card>

    <!-- cancel modal -->
    <v-dialog v-model="cancelDialog" persistent max-width="290">
      <v-card class="text-capitalize">
        <v-card-title class="headline">
          are you sure you want to cancel the quiz?
        </v-card-title>
        <v-card-actions class="justify-space-between">
          <v-btn color="success" text @click="cancelDialog = false">no</v-btn>
          <v-btn color="error" text @click="cancelQuiz()">yes</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue, Watch } from "vue-property-decorator";
import { FinalResult, FooterButton, Question } from "@/types";
import { isEmpty, shuffle } from "lodash";
import humanizeDuration from "humanize-duration";

@Component
export default class Quiz extends Vue {
  // props
  @Prop() questions!: Question[];

  // data
  /// general
  mh?: number = 400;
  startTime = 0;
  endTime = 0;
  quizTime?: string = "";
  questionsLength = 0;
  passed = 0;
  /// quiz data
  current = 1;
  steps = 1;
  valid?: boolean = true;
  /// alert
  answerAlert?: boolean = false;
  /// result
  showResult = false;
  waitingResult?: boolean = true;
  points = 0;
  // cancel
  cancelDialog?: boolean = false;

  // computed
  get footerButtons(): FooterButton[] {
    return [
      {
        text: "restart",
        color: "primary",
        disabled: false,
        cb: () => {
          this.cancelQuiz();
        },
        renderIt: this.showResult
      },
      {
        text: "cancel",
        color: "error",
        disabled: false,
        cb: () => {
          this.cancelDialog = true;
        },
        renderIt: !this.showResult
      },
      {
        text: "submit",
        color: "primary",
        disabled: this.current < this.steps,
        cb: () => {
          this.showResult = true;
          const userAnswers = Array.from(this.questions, q => {
            return q.value;
          }).slice(1);

          userAnswers.forEach((ans, i): void => {
            const answer = Array.isArray(ans) ? ans[0] : ans;
            if (this.questions[i].correct_answer === answer) {
              this.points++;
              this.passed++;
            }
          });
          this.endTime = Date.now();
          setTimeout(() => {
            this.points =
              parseInt(
                ((this.points / this.questionsLength) * 100).toFixed(0)
              ) || 0;

            this.waitingResult = false;
            this.quizTime = humanizeDuration(this.endTime - this.startTime);
          }, 5000);
        },
        renderIt: !(this.current < this.steps) && !this.showResult
      },
      {
        text: "next",
        color: "success",
        disabled: false,
        cb: () => {
          this.nextStep(this.current);
        },
        renderIt: this.current < this.steps
      }
    ];
  }

  // hooks
  beforeMount(): void {
    // insert some props
    this.questions.map(q => {
      // add more props
      q.value = q.type === "boolean" ? "" : [];
      q.valid = false;
      q.label = q.question;
      q.items = shuffle([q.correct_answer, ...q.incorrect_answers]);
      // delete non-used props
      delete q.difficulty;
      delete q.category;
      delete q.incorrect_answers;
      delete q.question;
    });

    // add last step
    this.questions.push({
      valid: true,
      value: true,
      type: "final",
      label: "thanks"
    });
  }
  mounted(): void {
    this.startTime = Date.now();
  }

  // watch
  @Watch("steps") stepsChanged(val: number): void {
    if (this.current > val) {
      this.current = val;
    }
  }
  @Watch("questions") questionsChanged(v: Question[]): void {
    this.questionsLength = v.length - 1;
    this.steps = this.questionsLength + 1;
  }

  // methods
  nextStep(n: number): void {
    if (n === this.steps) {
      this.current = 1;
    } else {
      if (!isEmpty(this.questions[this.current - 1].value)) {
        this.current++;
        this.answerAlert = false;
      } else {
        this.answerAlert = true;
      }
    }
  }
  setResult(p: number): FinalResult {
    if (p >= 80) {
      return { color: "success", text: "great job" };
    } else if (p < 80 && p >= 50) {
      return { color: "info", text: "good job" };
    } else if (p < 50 && p > 30) {
      return { color: "warning", text: "nice job, but need more" };
    } else {
      return { color: "error", text: "bad job" };
    }
  }

  // emit
  @Emit("cancel-quiz") cancelQuiz(): boolean {
    return false;
  }
}
</script>
