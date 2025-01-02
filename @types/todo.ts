export type Todo = {
  title: string
  completed: boolean
  id: string
}

export type TodoPostResponse = {
  data: Todo
}

export type TodoPostRequest = Todo & { id: string }
