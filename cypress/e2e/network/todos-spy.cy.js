// @ts-check
/// <reference types="cypress" />

describe('App', () => {
  beforeEach(() => {
    // Disable cache problem: 304
    // Every time the application receives the data, it saves the ETag header value.
    // Next time the app asks for the data, it sends this value with the header If-None-Match.
    // If the server sees the match in the request, it simply responds with Status: 304 Not Modified, Body: "".

    // Why is this not a problem in Playwright?
    // Because enabling routing and waiting for responses disable the cache there.
    // But in Cypress, we can test the caching behavior, thus it is up to us to disable the built-in caching

    // KEY: disable network caching using a Chrome Debugger Protocol command
    // by using "cy.wrap" command we ensure that the promise returned
    // by the Cypress.automation method resolves before proceeding
    // to the next Cypress command
    cy.wrap(
      Cypress.automation('remote:debugger:protocol', {
        command: 'Network.setCacheDisabled',
        params: {
          cacheDisabled: true,
        },
      }),
    )

    // spy on the network call "GET /todos"
    // give the network intercept an alias
    cy.intercept('GET', '/todos').as('load')
    cy.visit('/')
  })

  it('shows the same number of items as sent by the server', () => {
    // wait for the network alias
    // grab its length and pass it to the cy.then callback
    // inside the callback get the number of Todo items on the page,
    // it should equal to the number of items returned by the server
    cy.wait('@load')
      .its('response.body.length')
      .then((n) => cy.get('.todo-list li').should('have.length', n))
  })
})
