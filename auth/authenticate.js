const jwt = require('jsonwebtoken');

const jwtKey = process.env.JWT_SECRET || 'keepitsecretkeepitsafeyooooo'

module.exports = {
  authenticate,
  generateToken,
  jwtKey
};

function authenticate(req, res, next) {
  const token = req.get('Authorization');

  if (token) {
    jwt.verify(token, jwtKey, (err, decoded) => {
      if (err) return res.status(401).json(err);

      req.decoded = decoded;

      next();
    });
    
  } else {
    return res.status(401).json({ error: 'Access denied' });
  }
}

function generateToken(user) {
  const secret = jwtKey;
  
  const payload = {
    username: user.username,
  };
  
  const options = {
    expiresIn: '1d'
  }

  return jwt.sign(payload, secret, options);
}