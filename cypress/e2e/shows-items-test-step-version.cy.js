// @ts-check
/// <reference types="cypress" />

import items from '../../fixtures/three.json'

describe('Complete todos', () => {
  beforeEach(() => {
    // confirm there are several items
    // and some are completed and some are not
    expect(items.length, 'number of items').to.be.greaterThan(0)
    expect(items.some((item) => item.completed)).to.be.true
    expect(items.some((item) => !item.completed)).to.be.true

    cy.request('POST', '/reset', { todos: items })
  })

  it('completes a todo', () => {
    const todos = '.todo-list li'
    const count = '[data-cy="remaining-count"]'

    cy.visit('/')

    cy.log(`**shows _${items.length}_ items**`)
    cy.get(todos).should('have.length', items.length)

    cy.log('**check each item**')
    items.forEach((item, k) => {
      cy.get(todos).eq(k).contains('label', item.title)

      if (item.completed) {
        cy.get(todos).eq(k).should('have.class', 'completed')
      } else {
        cy.get(todos).eq(k).should('not.have.class', 'completed')
      }
    })

    const n = items.filter((item) => !item.completed).length
    cy.log(`remaining count **${n}**`)
    cy.contains(count, n)
  })
})
