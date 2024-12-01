// @ts-check
/// <reference types="cypress" />
import items from '../../fixtures/three.json'

describe('App', () => {
  beforeEach(() => {
    cy.request('POST', '/reset', { todos: items })
    cy.visit('/')
    cy.get('.todo').should('have.length', 3)
  })

  it('gets the todos from the application', () => {
    // get the list of todos from the application
    // using the "window.appTodos" property
    cy.window()
      .its('appTodos')
      // confirm that the todo titles you got from the app
      // are the same as the titles in the loaded todos fixture
      .map('title')
      .should('deep.equal', Cypress._.map(items, 'title'))

    // confirm that each item in the todos list points at the list
    // via the "list" property
    cy.window()
      .its('appTodos')
      .then((todos) => {
        todos.forEach((todo, k) => {
          expect(todo.list, `item ${k + 1}`).to.equal(todos)
        })
      })
  })
})
