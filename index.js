/*
  Constants
*/
const constants = require('./constants');

const jsonwebtoken = require('jsonwebtoken')
const mongoose = require('mongoose')
const express = require('express')
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs')

const app = express()
mongoose.connect('mongodb://localhost:27017/test')

/*
  Database Definition
*/
var UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  account_type: String,
  grades: [{ quiz: String, mark: Number}],
  courses: [{ course: Object}],
})

UserSchema.pre('save', function(next) {
  var user = this
  if(!user.isModified('password')) return next()

  bcrypt.hash(user.password, constants.bcryptWorkFactor, function(error, hash) {
    if(error) return next(error)

    user.password = hash
    return next()
  })
})

var User = mongoose.model('User', UserSchema)

/*
  Application Setup
*/
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

function createToken(email) {
  return jsonwebtoken.sign({email: email}, constants.jwtSecret, {expiresIn: constants.tokenTime})
}

//
// Login Endpoint
//
app.post('/login', function(req, res) {
  if(req.body.email && req.body.password) {
    // check email & password
    User.findOne({email: req.body.email}, function(error, user) {
      if(error) return res.json(constants.messages.internalError)
      if(!user) return res.json(constants.messages.invalidCredentials)
      if(user) {
        bcrypt.compare(req.body.password, user.password, function(error, correct) {
          if(correct) {
            var token = createToken(req.body.email)
            return res.json({
              success: true,
              message: 'Logged in.',
              token: token
            })
          } else return res.json(invalidCredentials)
        })
      }
    })
  } else return res.json(constants.messages.parametersRequired)
})


//
// Register Endpoint
//
app.post('/register', function(req, res) {
  if(req.body.email && req.body.password) {
    // register as email
    User.findOne({email: req.body.email}, function(error, user) {
      if(error) return res.json(constants.messages.internalError)
      if(user) return res.json(constants.messages.alreadyRegistered)
      if(!user) {
        var newUser = new User({
          email: req.body.email,
          password: req.body.password
        }).save(function(error) {
          if(error) return res.json(constants.messages.internalError)
          else {
            var token = createToken(req.body.email)

            return res.json({
              success: true,
              message: 'Registered and logged in!',
              token: token
            })
          }
        })
      }
    })
  } else return res.json(constants.messages.parametersRequired)
})

function checkToken() {
  return function(req, res, next) {
    if(!req.body.token) return res.json(constants.messages.parametersRequired)

    jsonwebtoken.verify(req.body.token, constants.jwtSecret, function(error, decodedToken) {
      if(error) return res.json(constants.messages.invalidToken)

      User.findOne({email: decodedToken.email}, function(error, user) {
        if(error || !user) return res.json(constants.messages.invalidToken)

        req.user = user
        return next()
      })
    })
  }
}

//
// Protected Endpoint
//
app.post('/dash', checkToken(), function(req, res) {
  return res.json({
    success: true,
    message: 'Welcome to the protected route!',
    user: req.user
  })
})

//
// Invalid Endpoint
//

app.use(function(req, res) {
  return res.json({
    success: false,
    message: 'Incorrect API usage.'
  })
})

app.listen(constants.port)

console.log(`Listening localhost:${constants.port}`)
