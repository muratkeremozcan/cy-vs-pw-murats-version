// @ts-check
/// <reference types="cypress" />

it('has title', () => {
  cy.visit('/')

  cy.title().should('equal', 'cy-vs-pw-example-todomvc')

  cy.get('.todo-list li').should('have.length', 3, { timeout: 5000 })
})
