// @ts-check
/// <reference types="cypress" />

describe('App', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.get('.loaded')
  })

  it('deletes a todo', () => {
    const title = 'Advance ' + Cypress._.random(1e6)

    // spy on the "POST /todos" network call
    cy.intercept('POST', '/todos').as('postTodo')

    // enter the new todo with a random title
    cy.get('input.new-todo').type(title + '{enter}')

    // wait for the post call and get the todo item id
    cy.wait('@postTodo')
      .its('response.body.id')
      .then((id) => {
        // spy on the "DELETE /todos/:id" network call
        cy.intercept('DELETE', `/todos/${id}`).as('deleteTodo')

        // find the newly entered todo item
        // and click on the delete button
        cy.contains('li.todo', title).find('.destroy').click({ force: true })

        // confirm the delete network call happens
        // and the server responded with the status code 200
        cy.wait('@deleteTodo').its('response.statusCode').should('equal', 200)
      })
    // confirm the new todo is no longer on the page
    cy.contains('li.todo', title).should('not.exist')
  })
})
