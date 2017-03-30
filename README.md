# Erudite-mini
Call the following `POST` requestsw with either curl, postman, etc.

Register with `email`, `password`, and `account_type`. This will return a `token` object that you will have to send in the body of all of your future `POST` requests.

```
    POST /register
        Headers:
            Content-Type = 'application/x-www-form-urlencoded'
        Body:
            email
            password
            account_type
```
Login with `email` and `password`. This will return a `token` object that you will have to send in the body of all of your future `POST` requests.
```
    POST /login
        Headers:
            Content-Type = 'application/x-www-form-urlencoded'
        Body:
            email
            password
```

Access  all courses available to the user by including a header with `Authentication = 'token'` and `Content-Type = 'application/x-www-form-urlencoded'`. You will have to include this this header in every request from now on.
```
    POST /course-list
        Headers:
            Authentication
            Content-Type = 'application/x-www-form-urlencoded'
```

Access all available content in a course by providing a `course_id`. Remember to also include the header from above.
```
    POST /course-content
        Headers:
            Authentication
            Content-Type = 'application/x-www-form-urlencoded'
        Body:
            course_id
```

Access a specific file within a course with the following. You can acquire the `file_id` from `/course-content`
```
    POST /course-content-file
        Headers:
            Authentication
            Content-Type = 'application/x-www-form-urlencoded'
        Body:
            course_id
            file_id
```

Upload a student `assignment` in response to a specific file. Here, remember to include `course_id` and `file_id` in the url itself. Example: `/course-content-submit/AZ8987B/71SF23423` where the first parameter is the `course_id`.
```
    /course-content-submit/:course_id/:file_id
        Headers:
            Authentication
            Content-Type = 'application/x-www-form-urlencoded'
        Body:
            assignment
```
Access all files that a student has submitted in response to a piece of content with `file_id`.
```
    /course-student-submissions
        Headers:
            Authentication
            Content-Type = 'application/x-www-form-urlencoded'
        Body:
            file_id
```

Returns a three question sample quiz and their answers for client side marks calculation.
```
    /course-quiz-demo
        Headers:
            Authentication
            Content-Type = 'application/x-www-form-urlencoded'
```

Push the resulting grades. Both `grades` and `quiz_name` must be specified. Choose anything you want.
```
    `/course-quiz-submit`
        Headers:
            Authentication
            Content-Type = 'application/x-www-form-urlencoded'
        Body:
            grades
            quiz_name
```

Check grades.
```
    /dash
        Headers:
            Authentication
            Content-Type = 'application/x-www-form-urlencoded'
```

Emergency API call that will delete the database and initialize a new one with a sample course and sample content. Note: The server must be manually restarted to create a new sample database.
```
    /clean
        Headers:
            Authentication
            Content-Type = 'application/x-www-form-urlencoded'
```
