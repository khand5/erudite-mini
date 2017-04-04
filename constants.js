module.exports = {
  jwtSecret : 'abc',
  bcryptWorkFactor : 12,
  tokenTime: '24h',
  port : process.env.PORT || 8080,

  messages: {
    parametersRequired : {success: false, message: 'Invalid parameters.' },
    internalError : {success: false, message: 'An internal error occurred.'},
    invalidCredentials: {success: false, message: 'Invalid credentials.'},
    alreadyRegistered: {success: false, message: 'Email already registered.'},
    invalidToken: {success: false, message: 'Invalid Token'},
    invalid : {success: false, message: 'Invalid Endpoint Access'}
  }
}
