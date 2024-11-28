// @ts-check
/// <reference types="cypress" />

describe('App', () => {
  it('shows a loader', () => {
    // intercept the "GET /todos" network call
    // let the call continue to the server
    // but delay it by 2 seconds
    // This should give the loading element plenty of time
    cy.intercept('GET', '/todos', () => Cypress.Promise.delay(2000))
    cy.visit('/')
    // confirm the loading element is visible
    // and then becomes hidden
    cy.get('.loading').should('be.visible')
    cy.get('.loading').should('not.be.visible')
    // confirm the app finishes loading really quickly
    // after the loader becomes hidden
    cy.get('.loaded', { timeout: 100 })
  })
})
