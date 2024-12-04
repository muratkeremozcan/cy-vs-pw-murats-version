// @ts-check
const { test, expect } = require('@playwright/test')

test.describe('Todo API', () => {
  const newTodo = { title: 'Write more tests with pw', completed: false }
  const updatedTodo = { title: 'Write updated tests with pw', completed: true }

  test('should crud a todo', async ({ request }) => {
    const post = await request.post('/todos', { data: newTodo })
    const postBody = await post.json()
    const postStatus = post.status()
    const { id } = postBody

    expect(postStatus).toBe(201)
    expect(postBody).toMatchObject({
      ...newTodo,
      id: expect.any(String),
    })

    // get all todos
    const getAll = await request.get('/todos')
    const getAllBody = await getAll.json()
    const getAllStatus = getAll.status()

    expect(getAllStatus).toBe(200)
    expect(getAllBody.length).toBeGreaterThanOrEqual(1)

    // get one todo
    const get = await request.get(`/todos/${id}`)
    const getBody = await get.json()
    const getStatus = get.status()

    expect(getStatus).toBe(200)
    expect(getBody).toMatchObject({
      ...newTodo,
      id,
    })

    // update the todo
    const put = await request.put(`/todos/${id}`, {
      data: updatedTodo,
    })
    const putBody = await put.json()
    const putStatus = put.status()

    expect(putStatus).toBe(200)
    expect(putBody).toMatchObject({
      ...updatedTodo,
      id,
    })

    // get the updated todo
    const getUpdatedTodo = await request.get(`/todos/${id}`)
    const getUpdatedTodoBody = await getUpdatedTodo.json()
    const getUpdatedTodoStatus = getUpdatedTodo.status()

    expect(getUpdatedTodoStatus).toBe(200)
    expect(getUpdatedTodoBody).toMatchObject({
      ...updatedTodo,
      id,
    })

    // delete the todo
    const deleteRes = await request.delete(`/todos/${id}`)
    const deleteResStatus = deleteRes.status()
    expect(deleteResStatus).toBe(200)

    // confirm the todo is gone
    const getDeletedTodoRes = await request.get(`/todos/${id}`)
    expect(getDeletedTodoRes.status()).toBe(404)
  })
})
