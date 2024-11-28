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

    // confirm the item labels
    const labels = items.map((item) => item.title)
    cy.get(todoLabels)
      .should('have.length', items.length)
      .should('read', labels)
    // .map('innerText') // old way
    // .should('deep.equal', labels)

    // confirm the "3" todos remaining is shown
    cy.contains(count, items.length - 1)

    // complete the first item by clicking its toggle element
    cy.get(todos).first().find('.toggle').click()

    // confirm completed vs not completed
    cy.get(todos).first().should('have.class', 'completed')
    cy.get(todos).eq(1).should('have.class', 'completed')
    cy.get(todos).eq(2).should('not.have.class', 'completed')

    // confirm classes for all 3 elements at once
    cy.get(todos)
      .map('classList.value')
      .should('deep.equal', ['todo completed', 'todo completed', 'todo'])

    // confirm there is 1 remaining items
    cy.contains(count, items.length - 2)
    // and that we can clear the completed items button appears
    cy.contains('button', 'Clear completed').should('be.visible')
  })
})
