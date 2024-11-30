// @ts-check
/// <reference types="cypress" />

describe('App', () => {
  it('prints the load start message', () => {
    // visit the page
    // but before any of the application code loads
    // set up a spy on the "console.log" method
    // give the spy an alias "log"
    // https://on.cypress.io/visit
    // https://on.cypress.io/spy
    cy.visit('/', {
      onBeforeLoad(win) {
        cy.spy(win.console, 'log').as('log')
      },
    })
    // confirm the "log" spy was called with
    // two expected arguments
    cy.get('@log').should(
      'have.been.calledWith',
      'loadTodos start, delay is %d',
      0,
    )
  })
})
