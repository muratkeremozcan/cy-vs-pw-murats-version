// @ts-check
/// <reference types="cypress" />
import 'cypress-map'
import items from '../../fixtures/three.json'

describe('Prices', () => {
  beforeEach(() => {
    cy.request('POST', '/reset', { todos: items })
    cy.visit('/')
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
      expect(sorted).to.not.be.empty
      expect(sorted, 'sorted from min to max').to.deep.equal(prices)
    })
  })
  it('cypress-map version', () => {
    cy.get(todos)
      .map('innerText')
      .map((s) => s.match(/\$(?<price>\d+)/))
      .map((m) => m?.groups?.price)
      .map(parseFloat)
      .should((prices) => {
        const sorted = Cypress._.sortBy(prices)
        expect(sorted).to.not.be.empty
        expect(sorted, 'sorted from min to max').to.deep.equal(prices)
      })
  })
})
