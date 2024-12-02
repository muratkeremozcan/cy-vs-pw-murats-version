const { test: base } = require('@playwright/test')
const {
  interceptNetworkCall: interceptNetworkCallFunction,
} = require('../utils/network')

const test = base.extend({
  interceptNetworkCall: async ({ page, request }, use) => {
    const interceptNetworkCall = (data) =>
      interceptNetworkCallFunction({ page, request, data })

    await use(interceptNetworkCall)
  },
})

module.exports = { test }
