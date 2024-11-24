// @ts-check
/// <reference types="cypress" />

beforeEach(() => {
  cy.request('POST', '/reset', { data: { todos: [] } })
  cy.visit('/')
})

it('has title', () => {
  console.log('running test "%s"', Cypress.currentTest.titlePath.join('/'))
  cy.title().should('equal', 'cy-vs-pw-example-todomvc')

  cy.get('body').should('have.class', 'loaded')
  // same thing
  cy.get('body.loaded')

  cy.get('.todo-list li').should('have.length', 0, { timeout: 1000 })
})
