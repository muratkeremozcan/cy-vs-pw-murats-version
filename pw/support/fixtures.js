const { test: base, mergeTests } = require('@playwright/test')
const { test: baseFixtures } = require('./fixtures/base-fixtures')
const { test: networkFixtures } = require('./fixtures/network-fixtures')
const { test: apiE2EFixtures } = require('./fixtures/api-request-fixture')

// add new fixtures here
// const { test: authTest } = require('./auth-fixtures');
// const { test: apiTest } = require('./api-fixtures');

const test = mergeTests(baseFixtures, networkFixtures, apiE2EFixtures) // add new fixtures as arguments

module.exports = { test, expect: base.expect }
