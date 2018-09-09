const fs = require('fs');
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');

const httpServer = http.createServer((req, res) => {
    unifiedServer(req,res);
}).listen(config.httpPort, () => {
    console.log(`Listening on port ${config.httpPort} in ${config.envName} mode.`);
});

const httpsServerOptions = {
    'key' : fs.readFileSync('./https/key.pem'),
    'cert' : fs.readFileSync('./https/cert.pem')
};

const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
    unifiedServer(req,res);
}).listen(config.httpsPort, () => {
    console.log(`Listening on port ${config.httpsPort} in ${config.envName} mode.`);
});

const handlers = {};
handlers.health = (data, callback) => callback(200, { 'status': 'up' });
handlers.notFound = (data, callback) => callback(404);

// Define the request router
const router = {
    'health': handlers.health
};

const unifiedServer = (req, res) => {

    const ip = res.socket.remoteAddress;
    const port = res.socket.remotePort;
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname.replace(/^\/+|\/+$/g, '');
    const method = req.method.toLowerCase();
    const query = parsedUrl.query;
    const headers = req.headers;

    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    // when 'data' event emitted by the request object, callback to append to buffer
    req.on('data', (data) => buffer += decoder.write(data));

    // when 'end' event emitted by the request object, callback to finsih off response
    req.on('end', () => {

        buffer += decoder.end(data);

        const handler = typeof (router[path]) !== 'undefined' ? router[path] : handlers.notFound;

        const data = {
            'path': path,
            'query': query,
            'method': method,
            'headers': headers,
            'payload': buffer
        };

        handler(data, function (statusCode, payload) {

            statusCode = typeof (statusCode) === 'number' ? statusCode : 400;
            payload = typeof (payload) === 'object' ? payload : {};
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(JSON.stringify(payload));
            console.log(`Requester IP address is ${ip} and your source port is ${port}.`);
            console.log(`Request received: ${method} ${path}`);
            console.log(`Query: `, query);
            console.log(`Headers: `, headers);
            console.log('Returning', statusCode, JSON.stringify(payload));
        });
    });
};