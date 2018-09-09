# TheNodeJSMasterClass-hw2
Homework assignment #2 for The Node.js Master Class, hosted @pirple.thinkific.com.

## Description
This application returns a "Hello" message, with an optional name parameter. When it's running try the following cURL commands (port 3000 implies that this is the staging environment):

Input (no parameters)
```
curl -X GET \
  'http://localhost:3000/hello' \
  -H 'Content-Type: application/json'
```
Output (default)
```javascript
{
    "message": "Hello, World"
}
```
Input (name parameter)
```
curl -X GET \
  'http://localhost:3000/hello?name=Herbert' \
  -H 'Content-Type: application/json'
```
Output
```javascript
{
    "message": "Hello, Herbert"
}
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

