// @ts-check
/// <reference types="cypress" />
import items from '../../fixtures/three.json'

describe('Complete todos', () => {
  beforeEach(() => {
    cy.request('POST', '/reset', { todos: items })

    cy.visit('/')
    cy.get('body.loaded').should('be.visible')
  })

  it('completes a todo', () => {
    const todos = '.todo-list li'
    const todoLabels = todos + ' label'
    const count = '[data-cy="remaining-count"]'

    const labels = items.map((item) => item.title)

    cy.get(todoLabels)
      .should('have.length', items.length)
      .map('innerText')
      .should('deep.equal', labels)

    cy.contains(count, items.length)

    cy.get(todos).first().find('.toggle').click()
    cy.get(todos).first().should('have.class', 'completed')

    cy.get(todos).eq(1).should('not.have.class', 'completed')
    cy.get(todos).eq(2).should('not.have.class', 'completed')

    cy.get(todos)
      .map('classList.value')
      .should('deep.equal', ['todo completed', 'todo', 'todo'])

    cy.contains(count, items.length - 1)

    cy.contains('button', 'Clear completed').should('be.visible')
  })
})
