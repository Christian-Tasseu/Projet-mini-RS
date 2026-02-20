//Fonction de vérification du token JWT
const jwt = require("jsonwebtoken");

const secret_key = "MaCléSuperSecrète_12345";
module.exports = (req, res, next) => {
  const token =
    req.headers["authorization"] && req.headers["authorization"].split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Accès refusé. Token manquant." });
  }
  jwt.verify(token, secret_key, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token invalide." });
    }
    req.user = decoded;
    next();
  });
};

module.exports.secret_key = secret_key ;