// @ts-check
/// <reference types="cypress" />

// increase the threshold to see the full object
// in the assertion "deep.equal"
chai.config.truncateThreshold = 500

describe('App', () => {
  it('responds with the same data on posting new item', () => {
    cy.visit('/')
    cy.get('.loaded')

    // spy on the "POST /todos" network call
    cy.intercept('POST', '/todos').as('post')
    // enter a new todo
    cy.get('input.new-todo').type('A task{enter}')

    // wait for the "post" intercept and then
    // confirm the server responds with the same data
    // back as the web app sends in the request
    cy.wait('@post').then((intercepted) => {
      expect(intercepted.request.body, 'same data').to.deep.equal(
        intercepted.response?.body,
      )
    })
  })
})
