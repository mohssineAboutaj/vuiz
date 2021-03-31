export interface Category {
  id?: number
  name?: string
}

export interface Question {
  category?: string
  type?: string
  difficulty?: string
  question?: string
  correct_answer?: string
  incorrect_answers?: any[string]
  // new props
  value?: boolean | string | string[]
  valid?: string | boolean
  label?: string
  items?: string[]
}

export interface FooterButton {
  text?: string
  color?: string
  disabled?: boolean
  cb?: Function
  renderIt?: boolean
}
