// @ts-check
/// <reference types="cypress" />

beforeEach(() => {
  cy.visit('/')

  cy.get('body').should('have.class', 'loaded')
  // same thing
  cy.get('body.loaded')
})

it('has title', () => {
  console.log('running test "%s"', Cypress.currentTest.titlePath.join('/'))
  cy.title().should('equal', 'cy-vs-pw-example-todomvc')
})

it('adding todos', () => {
  cy.get('[placeholder="What needs to be done?"]').type('Write code {enter}')
  cy.get('.todo-list li label')
    .should('have.length.gte', 1)
    .and('contain', 'Write code')
})
