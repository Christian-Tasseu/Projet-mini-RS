//immportation des bibliothèques nécessaires
const express = require("express");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./config/db");
const fs = require("fs");

//Fonction de vérification du token JWT
const secret_key = "secret_key_1313";
const verifyToken = (req, res, next) => {
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

const app = express();
const port = 3000;
const multer = require("./middleware/multer-config");
app.use(cors());
app.use(express.json());
app.use("/images", express.static("images"));

//Route principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

//route d'inscription
app.post("/api/inscription", async (req, res) => {
  const { username, email, mot_de_passe } = req.body;
  //Hachage du mot de passe
  const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
  //Insertion de l'utilisateur dans la base de données
  try {
    const [result] = await db.query(
      "INSERT INTO users (username, email, mot_de_passe) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );
    res
      .status(201)
      .json({ id: result.insertId, username: username, email: email });
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

//route de connexion
app.post("/api/connexion", async (req, res) => {
  const { username, mot_de_passe } = req.body;
  //Vérification des informations d'identification de l'utilisateur
  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE username = ? or email = ?",
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
    //Génération du token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      secret_key,
      {
        expiresIn: 86400, // 24 heures
      }
    );
    res.status(200).json({ message: "Connexion réussie.", token });
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

//route de récupération des données de l'utilisateur
app.get("/api/profil", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [
      req.user.id,
    ]);
    res.send(rows);
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});
app.get("/api/users", verifyToken, (req, res) => {
  try {
    res.send(req.user.username);
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

//routes de mise à jour du profil
app.put(
  "/api/profil/:userId",
  verifyToken,
  multer,
  async (req, res) => {
    const userId = req.params.userId;
    const imageUrl = `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`;
    try {
      const result = await db.query(
        "UPDATE users SET url_photo = ? WHERE id = ?",
        [imageUrl, userId]
      );
      res
        .status(200)
        .json({ message: "Image de profil mise à jour", imageUrl: imageUrl });
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour de l'image de profil :",
        error
      );
      res.status(500).json({ message: "Erreur serveur" });
    }
  }
);

//route de récupération des usernames pour la page d'accueil-----------------------------------------------

app.get("/api/listUsers", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT username FROM users");
    res.send(rows);
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// route de redirection vers la page de profil
app.post("/api/profilPage", verifyToken, (req, res) => {
  if (req.user.id) {
    res.status(200).send("Redirection accordée");
  } else {
    console.error("Erreur lors de la rédirection :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

//route de publication
// app.post("/api/publier", verifyToken, multer, async (req, res) => {
//   try {
//     const [results] = await db.query(
//       "INSERT INTO posts (user_id, content) VALUES (?, ?)",
//       [req.user.id, req.body.message]
//     );
//     res.status(201).json({ id: results.insertId, message: "post créé"});
//   } catch (error) {
//     console.error("Erreur lors de la publication :", error);
//     res.status(500).json({ message: "Erreur serveur" });
//   }
// });
app.post("/api/publier", verifyToken, multer, async (req, res) => {
  const message = req.body.message;
  const userId = req.user.id; // Récupéré via ton verifyToken
  let imageUrl = null;

  if (req.file) {
    imageUrl = `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`;
  }

  try {
    const [results] = await db.query(
      "INSERT INTO posts (user_id, content, imageUrl) VALUES (?, ?, ?)",
      [userId, message, imageUrl]
    );
    res
      .status(201)
      .json({
        id: results.insertId,
        message: "Post créé !",
        imageUrl: imageUrl,
      });
  } catch (error) {
    console.error("Erreur lors de la publication :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }

  // const sql = "INSERT INTO posts (content, user_id, imageUrl) VALUES (?, ?, ?)";

  // db.query(sql, [message, userId, imageUrl], (err, result) => {
  //     if (err) {
  //         return res.status(500).json({ error: "Erreur SQL" });
  //     }
  //     res.status(201).json({ message: "Post créé !", postId: result.insertId, imageUrl: imageUrl });
  // });
});

//route d'affichage des publications---------------------------------------------------------------------------------
app.get("/api/posts", verifyToken, async (req, res) => {
  try {
    const listPosts = [];
    const [rows] = await db.query(
      "SELECT posts.*, favs.post_id AS isLiked FROM posts LEFT JOIN favs ON posts.id = favs.post_id AND favs.user_id = ? ORDER BY posts.created_at DESC",
      req.user.id
    );
    for (const i in rows) {
      try {
        const user = await db.query(
          "SELECT username, url_photo FROM users WHERE id = ?",
          rows[i].user_id
        );
        const nbLikes = await db.query(
          "SELECT COUNT(*) AS likeCount FROM favs WHERE post_id = ?",
          rows[i].id
        );
        listPosts.push({
          id: rows[i].id,
          username: user[0][0].username,
          url_photo: user[0][0].url_photo,
          message: rows[i].content,
          imageUrl: rows[i].imageUrl,
          created_at: rows[i].created_at,
          nbLikes: nbLikes[0][0].likeCount,
          isLiked: rows[i].isLiked ? true : false,
        });
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des publications :",
          error
        );
        res.status(500).json({ message: "Erreur serveur" });
      }
    }
    res.send(listPosts);
  } catch (error) {
    console.error("Erreur lors de la récupération des publications :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// routes d'ajout à favoris
app.post("/api/addFav/:postId", verifyToken, async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user.id;
  try {
    const [results] = await db.query(
      "INSERT INTO favs (post_id, user_id) VALUES (?, ?)",
      [postId, userId]
    );
    const nbLikes = await db.query(
      "SELECT COUNT(*) AS likeCount FROM favs WHERE post_id = ?",
      postId
    );
    res
      .status(201)
      .json({
        id: results.insertId,
        nbLikes: nbLikes[0][0].likeCount,
        message: "Ajouté aux favoris",
      });
  } catch (error) {
    console.error("Erreur lors de l'ajout en favoris :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

//routes de suppression de favoris
app.delete("/api/removeFav/:postId", verifyToken, async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user.id;
  try {
    const result = await db.query(
      "DELETE FROM favs WHERE post_id = ? AND user_id = ?",
      [postId, userId]
    );
    const nbLikes = await db.query(
      "SELECT COUNT(*) AS likeCount FROM favs WHERE post_id = ?",
      postId
    );
    res
      .status(200)
      .json({
        message: "Retiré des favoris",
        nbLikes: nbLikes[0][0].likeCount,
      });
  } catch (error) {
    console.error("Erreur lors de la suppression des favoris :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

//route de supression des publications
app.delete("/api/post/:postId", verifyToken, async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user.id;
  try {
    const [rows] = await db.query(
      "SELECT imageUrl FROM posts WHERE id = ? AND user_id = ?",
      [postId, userId]
    );
    const imageUrl = rows[0].imageUrl;
    if (imageUrl) {
      const filename = imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, (err) => {
        if (err) {
          console.error("Erreur lors de la suppression de l'image :", err);
        }
      });
    }
    const result = await db.query(
      "DELETE FROM posts WHERE id = ? AND user_id = ?",
      [postId, userId]
    );
    res.status(200).json({ message: "Suppression réussie" });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});
