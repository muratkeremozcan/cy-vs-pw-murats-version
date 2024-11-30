// @ts-check
/// <reference types="cypress" />
import items from '../../fixtures/three.json'

chai.config.truncateThreshold = 400

describe('App', () => {
  beforeEach(() => {
    cy.request('POST', '/reset', { todos: items })
    cy.visit('/')
    cy.get('.loaded')
  })

  it('confirms the entire sent Todo object', () => {
    // spy on the "POST /todos" network call
    // and give it an alias "post"
    // https://on.cypress.io/intercept
    // https://on.cypress.io/as
    cy.intercept('POST', '/todos').as('post')
    // get the application's window object
    // and spy on its "Math.random" method
    // https://on.cypress.io/window
    // https://on.cypress.io/its
    // https://on.cypress.io/spy
    // give the method spy an alias "random"
    cy.window()
      .its('Math')
      .then((Math) => {
        cy.spy(Math, 'random').as('random')
      })
    // enter new todo "Code" followed by enter
    cy.get('input.new-todo').type('Code{enter}')
    // get the "random" spy
    // https://on.cypress.io/get
    // and confirm it was called once
    // https://glebbahmutov.com/cypress-examples/commands/spies-stubs-clocks.html
    cy.get('@random')
      .should('have.been.calledOnce')
      // from the spy, get the first call's return value
      // using "firstCall.returnValue" deep notation
      // https://on.cypress.io/its
      .its('firstCall.returnValue')
      // and confirm it is a number between 0 and 1
      .should('be.within', 0, 1)
      // follow the same steps as the app.js does to
      // convert the float to the string id
      .invoke('toString')
      .invoke('substr', 2, 10)
      // pass the id value into cy.then callback and
      // get the "post" network call post data
      // you know know all the fields it should have
      // confirm using the "deep.equal" assertion
      .then((id) => {
        cy.wait('@post').its('request.body').should('deep.equal', {
          title: 'Code',
          completed: false,
          id,
        })
      })
  })
})
