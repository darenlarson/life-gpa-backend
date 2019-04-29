const express = require('express');
const router = express.Router();

const Users = require('../models/users-model')
const db = require('../database/dbConfig')
const bcrypt = require('bcryptjs');


const { authenticate, generateToken } = require('../auth/authenticate');

router.post('/register', (req, res) => {
    console.log(req.body)
    let user = req.body
    const hash = bcrypt.hashSync(user.password, 10)
    user.password = hash;

    !user.username || !user.password
    ? res.status(400).json({ error: 'Please Provide a Username'})
    : 
    Users
        .addUser(req.body)
        .then(user => {
            const token = generateToken(user);
            res.status(201).json({user, token})
        })
        .catch(err => {
            res.status(500).json(err)
        })
})

router.post('/login', (req, res) => {
    let { username, password } = req.body;
  
    Users.findBy({ username })
      .first()
      .then(user => {
        if (user && bcrypt.compareSync(password, user.password)) {
        const token = generateToken(user);
  
          res.status(200).json({
            message: `Welcome ${user.username}!`,
            token,
            id: user.id
          });
        } else {
          res.status(401).json({ message: 'Invalid Credentials' });
        }
      })
      .catch(error => {
        res.status(500).json(error);
      });
  
  })


module.exports = router;