# Erudite-mini
Erudite is a backend server supporting the Erudite-CMS android application. Link: https://github.com/Plan6/erudite-android. The server makes use of Mongoose, a javascript wrapper for MongoDB.

## Usage
Call the following `POST` requests with either curl, postman, etc.

1. Register with `email`, `password`, and `account_type`. This will return a `token` object that you will have to send in the body of all of your future `POST` requests.

```
    POST /register
        Headers:
            Content-Type = 'application/x-www-form-urlencoded'
        Body:
            email
            password
            account_type
```
2. Login with `email` and `password`. This will return a `token` object that you will have to send in the body of all of your future `POST` requests.
```
    POST /login
        Headers:
            Content-Type = 'application/x-www-form-urlencoded'
        Body:
            email
            password
```

3. Access  all courses available to the user by including a header with `Authentication = 'token'` and `Content-Type = 'application/x-www-form-urlencoded'`. You will have to include this this header in every request from now on.
```
    POST /course-list
        Headers:
            Authentication
            Content-Type = 'application/x-www-form-urlencoded'
```

4. Access all available content in a course by providing a `course_id`. Remember to also include the header from above.
```
    POST /course-content
        Headers:
            Authentication
            Content-Type = 'application/x-www-form-urlencoded'
        Body:
            course_id
```

5. Access a specific file within a course with the following. You can acquire the `file_id` from `/course-content`
```
    POST /course-content-file
        Headers:
            Authentication
            Content-Type = 'application/x-www-form-urlencoded'
        Body:
            course_id
            file_id
```

6. Upload a student `assignment` in response to a specific file. **Remember!** The `file_id` is the id of the file you want to upload in response to. This file is uploaded by the teacher.* Include `course_id` and `file_id` in the url itself. Example: `/course-content-submit/AZ8987B/71SF23423` where the first parameter is the `course_id`.
```
    POST /course-content-submit/:course_id/:file_id
        Headers:
            Authentication
            Content-Type = 'multipart/form-encoded'
        Body:
            assignment
```
7. Access all files that a student has submitted in response to a piece of content with `file_id`.
```
    POST /course-student-submissions
        Headers:
            Authentication
            Content-Type = 'application/x-www-form-urlencoded'
        Body:
            file_id
```

8. Returns a three question sample quiz and their answers for client side marks calculation.
```
    POST /course-quiz-demo
        Headers:
            Authentication
            Content-Type = 'application/x-www-form-urlencoded'
```

9. Push the resulting grades. Both `grades` and `quiz_name` must be specified. Choose anything you want.
```
    POST /course-quiz-submit
        Headers:
            Authentication
            Content-Type = 'application/x-www-form-urlencoded'
        Body:
            grades
            quiz_name
```

10. Check grades.
```
    POST /dash
        Headers:
            Authentication
            Content-Type = 'application/x-www-form-urlencoded'
```

11. Check student grades. Teachers only. Students and administrators will not have access to this endpoint.
```
    POST /dash-teacher
        Headers:
            Authentication
            Content-Type = 'application/x-www-form-urlencoded
```

12. Emergency API call that will delete the database and initialize a new one with a sample course and sample content. Note: The server must be manually restarted to create a new sample database.
```
    POST /clean
        Headers:
            Authentication
            Content-Type = 'application/x-www-form-urlencoded'
```
