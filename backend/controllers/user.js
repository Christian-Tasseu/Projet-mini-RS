// controllers/user.js
const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { secret_key } = require("../middleware/auth");

exports.inscription = async (req, res) => {
  const { username, email, mot_de_passe } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
    const [result] = await db.query(
      "INSERT INTO users (username, email, mot_de_passe) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );
    res.status(201).json({ id: result.insertId, username, email });
  } catch (error) {
    console.error("Erreur inscription :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

exports.connexion = async (req, res) => {
  const { username, mot_de_passe } = req.body;
  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [username, username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Utilisateur non trouvé." });
    }

    const user = rows[0];
    const passwordIsValid = bcrypt.compareSync(mot_de_passe, user.mot_de_passe);

    if (!passwordIsValid) {
      return res.status(401).json({ message: "Mot de passe incorrect." });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      secret_key,
      { expiresIn: 86400 } // 24 heures
    );

    res.status(200).json({ message: "Connexion réussie.", token });
  } catch (error) {
    console.error("Erreur connexion :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// Récupérer tous les utilisateurs sauf l'utilisateur connecté pour le chat 
exports.getAllUsers = async (req, res) => {
    try {
        // On récupère tout le monde sauf l'utilisateur connecté
        const [users] = await db.query(
            "SELECT id, username, url_photo FROM users WHERE id != ?", 
            [req.user.id]
        );
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Erreur récupération utilisateurs" });
    }
};