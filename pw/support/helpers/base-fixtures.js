// @ts-check
const { test: base } = require('@playwright/test')
const { resetAndVisit: resetAndVisitFunction } = require('./plain-functions')
const { spyOn: spyOnFunction } = require('../utils/spy-stub-helper')

// Extend the base test with our custom fixture
const test = base.extend({
  // Define the resetAndVisit fixture
  resetAndVisit: async ({ page, request }, use) => {
    // Define the function without needing to pass page and request
    const resetAndVisit = (data) =>
      resetAndVisitFunction({ page, request, data })
    // Make the function available in the test
    await use(resetAndVisit)
  },

  spyOn: async ({ page }, use) => {
    const spyOn = (objectName, method) =>
      spyOnFunction(page, objectName, method)
    await use(spyOn)
  },
})

module.exports = { test }

/*
We can have a base fixtures file and we can extend it

// fixtures.js
const { mergeTests } = require('@playwright/test');
const { test: baseTest } = require('./base-fixtures');
const { test: authTest } = require('./auth-fixtures');
const { test: apiTest } = require('./api-fixtures');

const test = mergeTests(baseTest, authTest, apiTest);

module.exports = { test };
*/
