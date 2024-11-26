// @ts-check
/// <reference types="cypress" />
import 'cypress-real-events'
import items from '../../fixtures/three.json'

describe('App', () => {
  beforeEach(() => {
    // do a hard wait (this is an anti pattern, but to run all examples together in parallel...)
    cy.wait(2000)
    cy.request('POST', '/reset', { todos: items })
  })

  it('deletes items', () => {
    // common locators
    const todos = '.todo-list li'

    cy.visit('/')
    cy.get(todos).should('have.length', items.length)

    // delete one completed item (the middle one)
    cy.get(todos).eq(1).realHover().find('.destroy').click()

    // confirm the remaining two items are still there
    cy.get(todos)
      .should('have.length', 2)
      .map('innerText')
      .should('deep.equal', ['Write code', 'Make tests pass'])

    // delete one incomplete item (the first one)
    cy.get(todos).first().realHover().find('.destroy').click()

    // confirm the one remaining item
    cy.get(todos)
      .should('have.length', items.length - 2)
      .contains('Make tests pass')
  })
})
