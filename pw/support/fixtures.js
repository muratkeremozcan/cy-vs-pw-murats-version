const { test: base, mergeTests } = require('@playwright/test')
const { test: baseFixtures } = require('./helpers/base-fixtures')
const { test: networkFixtures } = require('./helpers/network-fixtures')
// add new fixtures here
// const { test: authTest } = require('./auth-fixtures');
// const { test: apiTest } = require('./api-fixtures');

const test = mergeTests(baseFixtures, networkFixtures) // add new fixtures as arguments

module.exports = { test, expect: base.expect }
