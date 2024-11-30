// @ts-check
/// <reference types="cypress" />

describe('App', () => {
  it('fetches todos every 60 seconds', () => {
    // spy on the "GET /todos" requests and
    // give them an alias "loadTodos"
    // https://on.cypress.io/intercept
    cy.intercept('GET', '/todos').as('loadTodos')
    // control the application's clock
    // https://on.cypress.io/clock
    cy.clock()
    cy.visit('/')
    // confirm the application called the "loadTodos" endpoint
    // Tip: you can even use a short 100ms timeout
    cy.tick(1000)
    cy.wait('@loadTodos')
    // advance the application's clock by 61 seconds
    // https://on.cypress.io/tick
    cy.tick(61_000)
    // confirm the application called the "loadTodos" endpoint
    cy.wait('@loadTodos')
    // advance the application's clock by another 61 seconds
    cy.tick(61_000)
    // confirm the application called the "loadTodos" endpoint
    cy.wait('@loadTodos')
  })
})
