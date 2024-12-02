const { test: base, mergeTests } = require('@playwright/test')
const { test: baseTest } = require('./helpers/base-fixtures')
// add new fixtures here
// const { test: authTest } = require('./auth-fixtures');
// const { test: apiTest } = require('./api-fixtures');

const test = mergeTests(baseTest) // add new fixtures as arguments

module.exports = { test, expect: base.expect }
