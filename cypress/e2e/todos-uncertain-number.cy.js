// @ts-check
/// <reference types="cypress" />
import items from '../../fixtures/three.json'

describe('App', () => {
  beforeEach(() => {
    cy.request('POST', '/reset', { todos: items })
    cy.visit('/')
    cy.get('.todo').should('have.length', 3)
  })

  it('shows more than 2 items at the start', () => {
    // common locators
    const todos = '.todo-list li'

    // the application starts several items
    // assume that we don't know the exact number
    // but we expect more than 2 items

    // solution 1
    cy.get(todos).should('have.length.above', 2)
    cy.get(todos).should('have.length.greaterThan', 2)
    cy.get(todos).its('length').should('be.greaterThan', 2)
    cy.get(todos).should('have.length.gte', 3)
    // solution 2
    cy.get(todos).should(
      'satisfy',
      ($el) => $el.length > 2,
      'more than 2 elements',
    )
    // solution 3
    cy.get(todos).should(($el) => {
      expect($el.length, 'more than 2 elements').to.be.greaterThan(2)
    })
  })
})
