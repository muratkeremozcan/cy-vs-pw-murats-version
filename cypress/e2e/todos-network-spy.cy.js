// @ts-check
/// <reference types="cypress" />
import spok from 'cy-spok'
describe('App', () => {
  beforeEach(() => {
    // stub the "GET /todos" network calls
    // and return an empty array
    cy.intercept('GET', '/todos', { body: [] })

    cy.visit('/')
    cy.get('.loaded')
    cy.get('.todo-list li').should('have.length', 0)
  })

  it('sends new todo object', () => {
    // spy on the "POST /todos" call
    cy.intercept('POST', '/todos').as('post-todo')

    // add an item
    cy.get('.new-todo').type('Learn testing{enter}')
    cy.get('.todo-list li').should('have.length', 1)

    // confirm the new todo was sent over the network
    cy.wait('@post-todo')
      // get the request body and confirm the known properties "title" and "completed"
      // confirm the request body includes the property "id", as string
      .its('request.body')
      .should(
        spok({
          title: 'Learn testing',
          completed: false,
          id: spok.string,
        }),
      )
    // confirm the server responds with status code 201
    cy.get('@post-todo').its('response.statusCode').should('equal', 201)
  })
})
