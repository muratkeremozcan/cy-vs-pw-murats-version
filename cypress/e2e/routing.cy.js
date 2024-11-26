import items from '../../fixtures/three.json'

describe('App routing', () => {
  beforeEach(() => {
    cy.request('POST', '/reset', { todos: items })
  })

  it('shows all, completed, or incomplete todos', () => {
    // common locators
    const todos = '.todo-list li'

    // the application starts with 3 items
    cy.visit('/')
    cy.get(todos).should('have.length', 3)

    // inside the "footer" element there is a list with class "filters"
    // tip: Cypress has cy.within command useful to work with a part of the page
    // https://on.cypress.io/within
    cy.get('footer .filters').within(() => {
      // by default, the filter "All" is selected and nothing else
      cy.contains('a.selected', 'All')
      cy.contains('a', 'Completed').should('not.have.class', 'selected')
      // click on the "Active" link and confirm the URL changes its hash part to "#/active"
      cy.contains('a', 'Active').should('not.have.class', 'selected').click()
      cy.location('hash').should('equal', '#/active')
    })

    // there should be 2 todo items shown
    cy.get(todos).should('have.length', 2)

    cy.get('footer .filters').within(() => {
      // the filter "Active" is selected instead of "All" and nothing else
      cy.contains('a.selected', 'Active')
      cy.contains('a', 'All').should('not.have.class', 'selected')
      // click on the "Completed" link and confirm the URL hash changes
      cy.contains('a', 'Completed').should('not.have.class', 'selected').click()
      cy.location('hash').should('equal', '#/completed')
    })

    // there should be just one item shown
    cy.get(todos).should('have.length', 1)

    cy.get('footer .filters').within(() => {
      // the filter "Completed" is selected, and nothing else
      cy.contains('a.selected', 'Completed')
      cy.contains('a', 'Active').should('not.have.class', 'selected')
      // click on the "All" link and confirm the URL hash changes
      cy.contains('a', 'All').should('not.have.class', 'selected').click()
      cy.location('hash').should('equal', '#/all')
    })
    // and we are back to 3 items
    cy.get(todos).should('have.length', 3)
  })
})
