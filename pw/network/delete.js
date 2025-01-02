const errorMessages = [
  ['could not load todos'],
  ['Request failed with status code 500'],
  ['server error'],
]

errorMessages //?
errorMessages.join(' ') //?

errorMessages.map((arg) => arg.join(' ')) //?

errorMessages.flat() //?
