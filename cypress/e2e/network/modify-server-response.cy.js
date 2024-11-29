// @ts-check
/// <reference types="cypress" />

describe('App', () => {
  it('inserts the first todo', () => {
    const todos = '.todo-list li'
    const title = 'The first one!'

    // spy on the "GET /todos" network call
    // before the request continues
    // delete the header "if-none-match" to avoid
    // the server responding with "304 Not Modified"
    // once the response arrives
    // confirm it is an array
    // and insert a new object at the first position
    // title, completed=false, id="1234"
    // https://on.cypress.io/intercept
    cy.intercept('GET', '/todos', (req) => {
      // Disable cache problem: 304 another way to disable cache
      delete req.headers['if-none-match']
      req.continue((res) => {
        expect(res.body, 'response list').to.be.an('array')
        res.body.unshift({
          title,
          completed: false,
          id: '1234',
        })
      })
    })

    cy.visit('/')
    // confirm there is at least one todo
    // and the first todo element
    // has the title text
    // and has the class "todo"
    // and does not have class "completed"
    cy.get(todos)
      .should('have.length.greaterThan', 0)
      .first()
      .should('include.text', title)
      .and('have.class', 'todo')
      .and('not.have.class', 'completed')
  })
})
