/*
  Constants
*/
const constants = require('./constants');

const jsonwebtoken = require('jsonwebtoken')
const mongoose = require('mongoose')
const express = require('express')
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs')
const multer = require('multer')
const upload = multer({dest: './data/student_uploads'})

const app = express()
mongoose.connect('mongodb://localhost:27017/erudite-database')

/*
  Database Definition
*/
var UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  account_type: String,
  grades: [{ quiz: String, mark: Number}],
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
})
var CourseSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  name: String,
  content: [{ file_name: String, file_location: String}],
  assignments: [{
    file_name: String,
    file_location: String,
    response_to_course_id: mongoose.Schema.Types.ObjectId,
    response_to_file_id: mongoose.Schema.Types.ObjectId,
    submitted_by: String,
    submission_time: Date,
  }],
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
var Course = mongoose.model('Course', CourseSchema)

/** Initialize Dummy Database */
var sampleDefaultCourseId = null
require('./demo_setup/demo_database')(User, Course, function(val) { sampleDefaultCourseId = val })

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
  if(req.body.email && req.body.password && req.body.account_type) {
    // register as email
    User.findOne({email: req.body.email}, function(error, user) {
      if(error) return res.json(constants.messages.internalError)
      if(user) return res.json(constants.messages.alreadyRegistered)
      if(!user) {
        var newUser = new User({
          email: req.body.email,
          password: req.body.password,
          account_type: req.body.account_type,
        })
        if(sampleDefaultCourseId) {
          newUser.courses = [sampleDefaultCourseId]
        }
        newUser.save(function(error) {
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

//
// View registered course list
//
app.post('/course-list', checkToken(), function(req, res) {
  User.findOne({_id: req.user._id}).populate('courses').exec(function(error, user) {
    var returnedData = user.courses.map(course => {
      return {teacher: course.owner, name: course.name, _id: course._id }
    })

    return res.json({
      courses: returnedData
    })
  })
})

//
// View course content list
//
app.post('/course-content', checkToken(), function(req, res) {
  Course.findOne({_id: req.body.course_id}).exec(function(error, course) {
    if(error || !course) return res.json(constants.messages.invalid)
    var returnedData = course.content.map(list => {
      return {name: list.file_name, file_id: list._id}
    })

    return res.json({content_list: returnedData})
  })
})

//
// View course content file
//
app.post('/course-content-file', checkToken(), function(req, res) {
  Course.findOne({_id: req.body.course_id}).exec(function(error, course) {
    if(error || !course) return res.json(constants.messages.invalid)
    var file_location = ''
    for(var i = 0; i < course.content.length; i++) {
      if (course.content[i]._id == req.body.file_id) {
        file_location = course.content[i].file_location
        break;
      }
    }

    return res.sendfile(file_location, {root: './data/uploads/'})
  })
})

function toObjectId(str) {
  return mongoose.mongo.BSONPure.ObjectID.fromHexString(str)
}

//
// Upload student assignment
//
app.post('/course-content-submit/:course_id/:file_id', checkToken(), upload.single('assignment'), function(req, res) {

  /*req.file = { fieldname: 'assignment',
    originalname: 'download.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    destination: './data/student_uploads',
    filename: 'ea4f03ceea8f301b86d25373aea607e2',
    path: 'data/student_uploads/ea4f03ceea8f301b86d25373aea607e2',
    size: 81124 }
  */
  console.log(req.param('course_id'))
  console.log(req.file)

  var course_id = req.param('course_id')
  var file_id = req.param('file_id')

  Course.findByIdAndUpdate(
      req.param('course_id'),
      {$push: {"assignments": {
        file_name: req.file.originalname,
        file_location: req.file.filename,
        response_to_course_id: course_id, //course in which this file is posted in
        response_to_file_id: file_id, //file_id of file this was uploaded in response to
        submitted_by: req.user._id,
        submission_time: Date.now()}}},
      {safe: true, upsert: true},
      function(err, model) {
          console.log(err);
      }
  )
  return res.json({
    success: true,
    message: 'Student assignment uploaded'
  })
})

//
// Get submitted student assignments for a course
//
app.post('/course-content-submissions', checkToken(), function(req, res) {
  Course.findOne({id: req.body.course_id, 'assignments.submitted_by': req.user._id, 'assignments.response_to_file_id': req.body.file_id}).exec(function(error, data) {
    if(error || !data) return res.json(constants.messages.invalid)

    var student_assignments = []

    for(var i = 0; i < data.assignments.length; i++) {
      if(data.assignments[i].submitted_by == req.user.id) {
        student_assignments.push(data.assignments[i])
      }
    }
    
    return res.json({
      assignments: student_assignments
    })
  })
})


function checkToken() {
  return function(req, res, next) {
    var token = req.header('Authentication')

    if(!token) return res.json(constants.messages.parametersRequired)

    jsonwebtoken.verify(token, constants.jwtSecret, function(error, decodedToken) {
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

app.post('/clean', function(req, res) {
  User.remove({}, function(error) { console.log(error)})
  Course.remove({}, function(error) { console.log(error)})
  require('./demo_setup/demo_database')(User, Course, function(val) { sampleDefaultCourseId = val })
  return res.json({
    success: true,
    message: 'Cleaned mongo database.'
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
