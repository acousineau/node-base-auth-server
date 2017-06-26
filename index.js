const dotenv = require('dotenv');
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();
const router = require('./router');
const mongoose = require('mongoose');

// Environment Setup
dotenv.config();

// DB Setup
mongoose.connect(process.env.MONGO_DB);

// App Setup
app.use(morgan('combined')); // Logging
app.use(bodyParser.json({ type: '*/*'})); // Parse incoming requests into JSON (no matter what the request type is)
router(app);

// Server Setup
const port = process.env.PORT || 3090;
const server = http.createServer(app);
server.listen(port);
console.log(`Server listening on port: ${port}`);
