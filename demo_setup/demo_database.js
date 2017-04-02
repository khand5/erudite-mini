module.exports = function(User, Course, cb) {

  User.findOne({email: 'sample@teacher.ca'}, function(error, user) {
    if(error) {
      console.log(error)
      cb(null)
    }

    if(!user) {
      /** Sample Teacher Account */
      var sampleTeacher = new User({
        email: 'sample@teacher.ca',
        password: 'sample',
        account_type: 'Teacher',
        grades: ['Assignment1:89.9','Assignment2:92.5','Midterm1:88.9'],
      }).save(function(error, user) {
        if(!error) {
          /** Sample Course Configuration */
          var sampleCourse = new Course({
            owner: user._id,
            name: 'SampleCourse 3A04',
            content: [{file_name:"Deliverable3_Template", file_location:"Deliverable3_Template.pdf"}],
          }).save(function(error, course) {
            if(!error) {
              cb(course._id)
            } else {
              cb(null)
            }
          })
        } else {
          cb(null)
        }
      })
    } else {
      Course.findOne({owner: user._id, name: 'SampleCourse 3A04'}, function(error, course) {
        if(error) { console.log(error); cb(null) }
        if(!course) { console.log('Could not find default course.'); cb(null) }
        if(course) cb(course._id)
      })
    }
  })
}
