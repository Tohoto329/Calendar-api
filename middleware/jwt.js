const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    let jwtToken;

    if (token) {
        jwtToken = token.split(' ')[1];
    } else {
        console.log("Authorization header is missing.");
        return res.status(401).json({ message: 'Authorization token is missing.' });
    }

  try {
    const decodedToken = jwt.verify(jwtToken, process.env.SECRET_KEY);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(400).json({ message: 'Invalid token.' });
  }
};

module.exports = verifyToken;
