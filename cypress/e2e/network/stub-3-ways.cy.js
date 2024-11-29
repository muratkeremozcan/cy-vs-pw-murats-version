// @ts-check
/// <reference types="cypress" />

describe('App', () => {
  it('stubs the load data network call three different ways', () => {
    const todos = '.todo-list li'

    // stub the "GET /todos" network call
    // on the first call return the data from the "fixtures/one.json" file
    // on the second call return the data from the "fixtures/two.json" file
    // on the third call return the data from the "fixtures/three.json" file
    // Tip: while you can write a callback that keeps the request count
    // to decide which fixture to return, you can also define a Cypress intercept
    // to work only a certain number of times
    // See the https://on.cypress.io/intercept options
    cy.intercept(
      {
        method: 'GET',
        path: '/todos',
      },
      { fixture: 'three.json' },
    )

    cy.intercept(
      {
        method: 'GET',
        path: '/todos',
        times: 1,
      },
      { fixture: 'two.json' },
    )

    cy.intercept(
      {
        method: 'GET',
        path: '/todos',
        times: 1,
      },
      { fixture: 'one.json' },
    )
    // load the page
    // and confirm only 1 todo is shown
    cy.visit('/')
    cy.get(todos).should('have.length', 1)
    // reload the page
    // confirm there are 2 todos
    cy.reload()
    cy.get(todos).should('have.length', 2)
    // reload the page
    // confirm there are 3 todos
    cy.reload()
    cy.get(todos).should('have.length', 3)
    // reload the page one more time
    // and confirm the 3 todos are still there
    cy.reload()
    cy.get(todos).should('have.length', 3)
  })
})
