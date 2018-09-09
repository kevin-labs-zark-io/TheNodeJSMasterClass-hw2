# TheNodeJSMasterClass-hw1
Homework assignment #1 for The Node.js Master Class, hosted @pirple.thinkific.com.

## Description
This application returns a "Hello" message, with an optional name parameter. When it's running try the following (commands for staging environment):
```
curl -X GET \
  'http://localhost:3000/hello' \
  -H 'Content-Type: application/json'

curl -X GET \
  'http://localhost:3000/hello?name=Herbert' \
  -H 'Content-Type: application/json'
```

## Running
This web application runs HTTP/HTTPS on ports 3000/3001 in *staging* and ports 80/443 in *production*. To start it up, run
```
$ node index.js
```
which defaults to the staging environment. To configure the environment explicitly, use the NODE_ENV parameter, e.g.
```
$ NODE_ENV=production node index.js
```

## License
No license, no warranty.

