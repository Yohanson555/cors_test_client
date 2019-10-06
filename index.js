const express = require('express');
const app = express();
const http = require('http').Server(app);

app.use(express.static('build'));

var port = 5000;

if (process.env.PORT) port = process.env.PORT;

http.listen(port);