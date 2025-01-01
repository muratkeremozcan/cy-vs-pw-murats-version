const { test: base } = require('@playwright/test')
const {
  apiRequest: apiRequestFunction,
} = require('../fixture-helpers/plain-functions')

const test = base.extend({
  apiRequest: async ({ request }, use) => {
    const apiRequest = ({ method, url, body = null }) =>
      apiRequestFunction({ request, method, url, body })

    await use(apiRequest)
  },
})

module.exports = { test }
