// @ts-check
/// <reference types="cypress" />

describe('App', () => {
  beforeEach(() => {
    // set up a route handler for "/todos" endpoint
    // when the route matches, fulfill it using the loaded items array
    cy.intercept('/todos', { fixture: 'three.json' }).as('load')

    cy.visit('/')
  })

  it('shows 3 items', () => {
    // wait for the intercepted network call "load"
    cy.wait('@load')
    // confirm the the number of shown todos is 3
    // and that todos show up within 100ms of the load network call
    cy.get('.todo-list li').should('have.length', 3)
  })
})
