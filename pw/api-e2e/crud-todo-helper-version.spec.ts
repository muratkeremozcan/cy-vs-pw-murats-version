import { test, expect } from '../support/fixtures'

test.describe('Todo API', () => {
  const newTodo = { title: 'Write more tests with pw', completed: false }
  const updatedTodo = { title: 'Write updated tests with pw', completed: true }

  test('should crud a todo', async ({ apiRequest }) => {
    const { body: postBody, status: postStatus } = await apiRequest({
      method: 'POST',
      url: '/todos',
      body: newTodo,
    })
    const { id } = postBody

    expect(postStatus).toBe(201)

    // get all todos
    // get one todo
    // update the todo
    // get the updated todo

    // delete the todo
    const { status: deleteStatus } = await apiRequest({
      method: 'DELETE',
      url: `/todos/${id}`,
    })
    expect(deleteStatus).toBe(200)

    // confirm the todo is gone
    const { status: getDeletedTodoStatus } = await apiRequest({
      method: 'GET',
      url: `/todos/${id}`,
    })
    expect(getDeletedTodoStatus).toBe(404)
  })
})
