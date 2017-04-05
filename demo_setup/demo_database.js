module.exports = function(User, Course, returnValue) {
  var student = new User({
    email: 'student@sample.com',
    password: 'password',
    account_type: 'Student',
    grades: ['Assignment1:89.9','Assignment2:92.5','Midterm1:88.9'],
    courses: [] // this needs to be set after the course is created
  })

  var teacher = new User({
    email: 'teacher@sample.com',
    password: 'password',
    account_type: 'Teacher',
    grades: [],
    courses: [] // this needs to be set after the course is created
  })

  var course = new Course({
    owner: '', // needs to be set!
    name: 'Demo Course',
    content: [
      {file_name:"Deliverable1_Template", file_location:"Deliverable3_Template.pdf"},
      {file_name:"Deliverable2_Template", file_location:"Deliverable3_Template.pdf"},
      {file_name:"Deliverable3_Template", file_location:"Deliverable3_Template.pdf"}
    ],
  })

  var teacherPromise = createIfNotExists(User, {email: teacher.email}, teacher)

  teacherPromise.then(function(teacher) {
    course.owner = teacher._id
    var coursePromise = createIfNotExists(Course, {owner: teacher._id, name: course.name}, course)

    coursePromise.then(function(course) {
      teacher.courses = [course._id]
      student.courses = [course._id]

      var studentPromise = createIfNotExists(User, {email: student.email}, student)
      studentPromise.then(function(student){}, accountCreationError)

      teacher.save(function(error) {
        if(error) return console.log('Could not set teacher\'s courses.')
      })

      return returnValue(course._id)
    }, courseCreationError)
  }, accountCreationError)


  function accountCreationError(error) {
    console.log('An error occurred while creating sample accounts.\n', error)
    returnValue(null)
  }

  function courseCreationError(error) {
    console.log('An error occurred while creating sample course.\n', error)
    returnValue(null)
  }
}


function createIfNotExists(Model, query, objectToSave) {
  return new Promise(function(resolve, reject) {
    Model.findOne(query, function(error, existingObject) {
      if(error) return reject(erorr)
      if(existingObject) return resolve(existingObject)

      // Object does not exist - let's create it!
      objectToSave.save(function(error, savedObject) {
        if(error) return reject(error)
        if(!savedObject) return reject('Could not save the object.')

        return resolve(savedObject)
      })
    })
  })
}
