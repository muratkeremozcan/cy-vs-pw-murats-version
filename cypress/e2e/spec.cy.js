// @ts-check
/// <reference types="cypress" />

it('has title', () => {
  // visit the page "localhost:3000"
  // https://on.cypress.io/visit
  cy.visit('/')

  // the page title should have text "cy-vs-pw-example-todomvc"
  // https://on.cypress.io/title
  cy.title().should('equal', 'cy-vs-pw-example-todomvc')
})
