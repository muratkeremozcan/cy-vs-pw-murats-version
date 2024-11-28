// @ts-check
/// <reference types="cypress" />
import 'cypress-map'
import items from '../../fixtures/three.json'

describe('Prices', () => {
  beforeEach(() => {
    cy.request('POST', '/reset', { todos: items })
    cy.visit('/')
    cy.get('.loaded')
  })

  const todos = '.todo-list li'

  it('shows items sorted by price', () => {
    // confirm there are several items
    // and parse each item's title to get the prices
    // and confirm they are sorted in the ascending order
    cy.get(todos).should(($el) => {
      const titles = Cypress._.map($el, 'innerText')
      const matches = titles.map((s) => s.match(/\$(?<price>\d+)/))
      const strings = matches.map((m) => m?.groups?.price)
      // @ts-ignore
      const prices = strings.map(parseFloat)
      const sorted = Cypress._.sortBy(prices) // doesn't mutate the original prices
      expect(sorted, 'sorted from min to max').to.deep.equal(prices)
    })
  })

  it('cypress-map version - shows items sorted by price', () => {
    cy.get('.todo-list li')
      .map('innerText')
      .mapInvoke('match', /\$(?<price>\d+)/)
      .map('groups.price')
      .map(parseFloat)
      .should((prices) => {
        const sorted = Cypress._.sortBy(prices)
        expect(sorted, 'sorted from min to max').to.deep.equal(prices)
      })
  })

  it('c9 shows the items with css class', () => {
    // from the list of items get the list of titles
    // and the list of CSS classes each item element should have
    // completed? "todo" + "completed"
    // incomplete? just "todo"
    const titles = Cypress._.map(items, 'title')
    const cssClasses = items.map((item) =>
      item.completed ? 'todo completed' : 'todo',
    )
    // confirm the todo items have the titles and the class names
    cy.get(todos).map('innerText').should('deep.equal', titles)
    // timeout last: when you have multiple chained queries,
    // place the timeout parameter on the last query before the assertion.
    cy.get(todos)
      .map('className', { timeout: 7000 })
      .should('deep.equal', cssClasses)
  })
})
