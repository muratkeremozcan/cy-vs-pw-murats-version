import { test, expect } from '../support/fixtures'
import type { Todo } from '../../@types/todo'

test.describe('Todo API', () => {
  const newTodo = { title: 'Write more tests with pw', completed: false }
  const updatedTodo = { title: 'Write updated tests with pw', completed: true }

  test('should crud a todo', async ({ apiRequest }) => {
    const { body: postBody, status: postStatus } = await apiRequest({
      method: 'POST',
      url: '/todos',
      body: newTodo,
    })
    const { id } = postBody as Todo

    expect(postStatus).toBe(201)
    expect(postBody).toMatchObject({
      ...newTodo,
      id: expect.any(String),
    })

    // get all todos
    const { body: getAllBody, status: getAllStatus } = await apiRequest({
      method: 'GET',
      url: '/todos',
    })
    expect(getAllStatus).toBe(200)
    expect((getAllBody as Todo[]).length).toBeGreaterThanOrEqual(1)

    // get one todo
    const { body: getBody, status: getStatus } = await apiRequest({
      method: 'GET',
      url: `/todos/${id}`,
    })
    expect(getStatus).toBe(200)
    expect(getBody).toMatchObject({
      ...newTodo,
      id,
    })

    // update the todo
    const { body: putBody, status: putStatus } = await apiRequest({
      method: 'PUT',
      url: `/todos/${id}`,
      body: updatedTodo,
    })
    expect(putStatus).toBe(200)
    expect(putBody).toMatchObject({
      ...updatedTodo,
      id,
    })

    // get the updated todo
    const { body: getUpdatedTodoBody, status: getUpdatedTodoStatus } =
      await apiRequest({
        method: 'GET',
        url: `/todos/${id}`,
      })
    expect(getUpdatedTodoStatus).toBe(200)
    expect(getUpdatedTodoBody).toMatchObject({ ...updatedTodo, id })

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
