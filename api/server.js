const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const server = express();

const habitsRouter = require('../routes/habitsRouter');
const usersRouter = require('../routes/usersRouter');

server.use(helmet());
server.use(express.json());
server.use(cors());

server.use('/api/habits', habitsRouter);
server.use('/api/users', usersRouter);

module.exports = server;