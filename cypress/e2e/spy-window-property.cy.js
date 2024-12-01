// @ts-check
/// <reference types="cypress" />
import items from '../../fixtures/three.json'

describe('App', () => {
  beforeEach(() => {
    cy.request('POST', '/reset', { todos: items })
    cy.visit('/')
    cy.get('.todo').should('have.length', 3)
  })

  it('uses ADD_TODO mutation', () => {
    // the Vuex store used inside the application
    // calls a mutation to add new Todo to the store
    // ADD_TODO(state, todoObject) {
    //   state.todos.push(todoObject)
    // },
    // Can you access the mutations in the store
    // and spy on the ADD_TODO mutation?
    // Note: the list of mutations for ADD_TODO is an array
    // https://on.cypress.io/window
    // https://on.cypress.io/its
    // https://on.cypress.io/spy
    cy.window()
      .its('app.$store._mutations.ADD_TODO')
      .then((addTodoMutations) => {
        // confirm the list of ADD_TODO mutations has 1 element
        expect(addTodoMutations).to.have.length(1)
        // spy on the first mutation and give it an alias "addTodo"
        cy.spy(addTodoMutations, '0').as('addTodo')
      })

    cy.intercept('POST', '/todos').as('postTodo')
    // type the todo "a test" into the input element
    // confirm the "a test" todo appears on the page
    cy.get('.new-todo').type('a test{enter}')
    cy.wait('@postTodo')
    cy.contains('li.todo', 'a test')

    // get the "addTodo" spy and confirm it was called
    // with expected argument object
    // Question: you know the title and the completed property
    // but how do you know the ID?
    cy.get('@addTodo').should('have.been.calledOnceWith', {
      completed: false,
      id: Cypress.sinon.match.string,
      title: 'a test',
    })
  })
})
