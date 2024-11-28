// @ts-check
/// <reference types="cypress" />

describe('App', () => {
  it('shows a loader', () => {
    // intercept the "/todos" call
    // and delay it by 2 seconds before
    // allowing it to continue to the server
    // spy on the "/todos" network call
    cy.intercept('GET', '/todos', () => Cypress.Promise.delay(2000)).as(
      'loading',
    )

    cy.visit('/')

    // confirm the loading element is visible
    cy.get('.loading').should('be.visible')
    // confirm the "/todos" call has happened
    cy.wait('@loading')
    // confirm loading element becomes hidden
    cy.get('.loading').should('not.be.visible')

    // confirm the app finishes loading
    cy.get('.loaded', { timeout: 100 })
  })
})
