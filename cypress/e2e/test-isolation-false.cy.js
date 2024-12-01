// @ts-check
/// <reference types="cypress" />
import todos from '../../fixtures/three.json'

// how would you ensure that these tests run one after another
// and do not go to the blank page in between?
describe('Completing todos', { testIsolation: false }, () => {
  before(() => {
    cy.request('POST', '/reset', { todos })
  })

  // blasphemy...
  it('shows the list of todos', () => {
    cy.visit('/')
    // confirm the number of todos shown
    cy.get('li.todo').should('have.length', todos.length)
    cy.log('**all todos are active**')
    // confirm the all todos are active (do not have class completed)
    cy.get('li.todo:not(.completed)').should('have.length', todos.length - 1)
    // there should be no completed todos
    cy.get('li.todo.completed').should('have.length', todos.length - 2)
  })

  it('completes the first todo', () => {
    // find the first todo and click on its ".toggle" button
    cy.get('li').first().find('.toggle').click()
    // the first todo should get the class "completed"
    cy.get('li').first().should('have.class', 'completed')
  })

  it('clears completed todos', () => {
    // click on the button with the text "Clear completed"
    cy.contains('button', 'Clear completed').click()
    // the number of todos should go down by 1
    cy.get('li.todo').should('have.length', todos.length - 2)
    // there should be no completed todos
    cy.get('li.todo.completed').should('have.length', 0)
  })
})
