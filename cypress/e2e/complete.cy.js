// @ts-check
/// <reference types="cypress" />

describe('Complete todos', () => {
  beforeEach(() => {
    cy.request('POST', '/reset', { todos: [] })

    cy.visit('/')
    cy.get('body.loaded').should('be.visible')
  })

  it('completes a todo', () => {
    const input = '[placeholder="What needs to be done?"]'
    const todos = '.todo-list li'
    const todoLabels = todos + ' label'
    const count = '[data-cy="remaining-count"]'

    cy.get(input)
      .type('Write code{enter}')
      .type('Write tests{enter}')
      .type('Make tests pass{enter}')

    cy.get(todoLabels)
      .map('innerText')
      .should('deep.equal', ['Write code', 'Write tests', 'Make tests pass'])

    cy.contains(count, '3')

    cy.get(todos).first().find('.toggle').click()
    cy.get(todos).first().should('have.class', 'completed')

    cy.get(todos).eq(1).should('not.have.class', 'completed')
    cy.get(todos).eq(2).should('not.have.class', 'completed')

    cy.get(todos)
      .map('classList.value')
      .should('deep.equal', ['todo completed', 'todo', 'todo'])

    cy.contains(count, 2)

    cy.contains('button', 'Clear completed').should('be.visible')
  })
})
