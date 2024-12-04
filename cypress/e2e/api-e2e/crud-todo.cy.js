import spok from 'cy-spok'
import '@bahmutov/cy-api'

describe('Todo API', () => {
  const newTodo = { title: 'Write more tests with cy', completed: false }
  const updatedTodo = { title: 'Write updated tests with cy', completed: true }

  it('should crud a todo', () => {
    cy.api({ method: 'POST', url: '/todos', body: newTodo })
      .should(
        spok({
          status: 201,
          body: {
            ...newTodo,
            id: spok.string,
          },
        }),
      )
      .its('body.id')
      .then((id) => {
        // get all todos
        cy.api({ method: 'GET', url: '/todos' }).its('status').should('eq', 200)
        cy.api({ method: 'GET', url: '/todos' })
          .its('body')
          .should('have.length.gte', 1)

        // get one todo
        cy.api({ method: 'GET', url: `/todos/${id}` }).should(
          spok({
            status: 200,
            body: {
              ...newTodo,
              id,
            },
          }),
        )

        // update the todo
        cy.api({
          method: 'PUT',
          url: `/todos/${id}`,
          body: updatedTodo,
        }).should(
          spok({
            status: 200,
            body: {
              ...updatedTodo,
              id,
            },
          }),
        )

        cy.api({ method: 'GET', url: `/todos/${id}` }).should(
          spok({
            status: 200,
            body: {
              ...updatedTodo,
              id,
            },
          }),
        )

        cy.api({ method: 'DELETE', url: `/todos/${id}` })
          .its('status')
          .should('eq', 200)

        cy.api({
          method: 'GET',
          url: `/todos/${id}`,
          failOnStatusCode: false,
        })
          .its('status')
          .should('eq', 404)
      })
  })
})
