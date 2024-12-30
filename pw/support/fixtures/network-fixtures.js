const { test: base } = require('@playwright/test')
const {
  interceptNetworkCall: interceptNetworkCallFunction,
} = require('../utils/network')

const test = base.extend({
  // only works as a fixture if handler is not being used,
  // otherwise, because page is needed in the inner functions,
  interceptNetworkCall: async ({ page, request }, use) => {
    const interceptNetworkCall = (data) =>
      interceptNetworkCallFunction({ page, request, data })

    await use(interceptNetworkCall)
  },
})

module.exports = { test }
