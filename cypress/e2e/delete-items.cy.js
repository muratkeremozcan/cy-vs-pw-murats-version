// @ts-check
/// <reference types="cypress" />

import items from '../../fixtures/three.json'

describe('App', () => {
  beforeEach(() => {
    cy.request('POST', '/reset', { todos: items })
  })

  it('deletes items', () => {
    // common locators
    const todos = '.todo-list li'

    cy.visit('/')
    cy.get(todos).should('have.length', items.length)

    // delete one completed item (the middle one)
    cy.get(todos)
      .eq(1)
      .find('.destroy')
      // skip visibility check
      .click({ force: true })

    // confirm the remaining two items are still there
    cy.get(todos)
      .should('have.length', 2)
      .map('innerText')
      .should('deep.equal', ['Write code', 'Make tests pass'])

    // delete one incomplete item (the first one)
    cy.get(todos)
      .first()
      .find('.destroy')
      // skip visibility check
      .click({ force: true })

    // confirm the one remaining item
    cy.get(todos)
      .should('have.length', items.length - 2)
      .contains('Make tests pass')
  })
})
