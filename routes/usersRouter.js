const express = require('express');
const router = express.Router();
const usersDb = require('./usersHelper');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../auth/authenticate');

router.post('/register', (req, res) => {
    let user = req.body
    const hash = bcrypt.hashSync(user.password, 10)
    user.password = hash;

    if (!user.username || !user.password) {
      res.status(400).json({ error: 'Please Provide a Username'})
    } else {
      usersDb
        .addUser(req.body)
        .then(user => {
            const token = generateToken(user);
            res.status(201).json({user, token})
        })
        .catch(err => {
            res.status(500).json(err)
        })
    }
})

router.post('/login', (req, res) => {
    let { username, password } = req.body;
  
    usersDb.findBy({ username })
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