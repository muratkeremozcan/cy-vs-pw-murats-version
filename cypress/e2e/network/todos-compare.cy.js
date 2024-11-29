// @ts-check
/// <reference types="cypress" />
import items from '../../../fixtures/three.json'

describe('App', () => {
  beforeEach(() => {
    cy.request('POST', '/reset', { todos: items })
    cy.visit('/')
    cy.get('.loaded')
  })

  it('assigns a different id to each new item', () => {
    // start spying on the "POST /todos" calls
    // assign the intercept an alias "post-todo"
    cy.intercept('POST', '/todos').as('post-todo')

    // add new todo with text "first todo"
    cy.get('.new-todo').type('first todo{enter}')

    // get the request id sent by the application
    // from the network call "post-todo"
    // confirm it is a string
    cy.wait('@post-todo')
      .its('request.body.id')
      .should('be.a', 'string')
      .then((id) => {
        // add new todo with text "second todo"
        cy.get('.new-todo').type('second todo{enter}')
        // get the request id from the second todo
        // sent by the application
        // confirm it is a string
        // and it is different from the first request
        cy.wait('@post-todo')
          .its('request.body.id')
          .should('be.a', 'string')
          .and('not.equal', id)
      })
  })
})
