// @ts-check
/// <reference types="cypress" />
import items from '../../fixtures/three.json'

describe('App', () => {
  beforeEach(() => {
    cy.request('POST', '/reset', { todos: items })
    cy.visit('/')
    cy.get('.todo').should('have.length', 3)
  })

  it('stores todos in the local storage', () => {
    // the local storage should have three items
    // Tip: the local storage is available under "window.localStorage"
    // and to get an item from the local storage you
    // can invoke the "getItem" method on it
    cy.window()
      .its('localStorage')
      .invoke('getItem', 'todos')
      // confirm the item is a string
      // then parse it into an object
      .should('be.a', 'string')
      // @ts-ignore
      .then(JSON.parse)
      // which should be an array with 3 items
      .should('have.length', 3)
  })
})
