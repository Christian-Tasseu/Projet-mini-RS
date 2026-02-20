const db = require("../config/db");
const fs = require("fs");

// Création d'un post -----------------------------

exports.createPost = async (req, res) => {
  const message = req.body.message;
  const userId = req.user.id;
  let imageUrl = null;

  // Si Multer a bien enregistré un fichier, on construit son URL
  if (req.file) {
    imageUrl = `${req.protocol}://${req.get("host")}/images/${req.file.filename}`;
  }

  try {
    const [results] = await db.query(
      "INSERT INTO posts (user_id, content, imageUrl) VALUES (?, ?, ?)",
      [userId, message, imageUrl],
    );

    res.status(201).json({
      id: results.insertId,
      message: "Post créé !",
      imageUrl: imageUrl,
    });
  } catch (error) {
    console.error("Erreur lors de la publication :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Affichage des posts ------------------------

exports.getAllPosts = async (req, res) => {
  try {
    const userId = req.user.id;

    // UNE SEULE REQUÊTE au lieu d'une boucle
    const sql = `
      SELECT 
        p.*, 
        u.username, 
        u.url_photo,
        (SELECT COUNT(*) FROM favs WHERE post_id = p.id) AS nbLikes,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS nbComments,
        EXISTS(SELECT 1 FROM favs WHERE post_id = p.id AND user_id = ?) AS isLiked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `;

    const [rows] = await db.query(sql, [userId]);

    // On formate légèrement pour correspondre à ce que ton Frontend attend
    const listPosts = rows.map((row) => ({
      id: row.id,
      username: row.username,
      url_photo: row.url_photo,
      message: row.content,
      imageUrl: row.imageUrl,
      created_at: row.created_at,
      nbLikes: row.nbLikes,
      nbComments: row.nbComments,
      isLiked: !!row.isLiked, // Transforme 1 ou 0 en true/false
    }));

    res.status(200).json(listPosts);
  } catch (error) {
    console.error("Erreur lors de la récupération des publications :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Route de suppression de post ------------------------

exports.deletePost = async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user.id;
  try {
    const [rows] = await db.query(
      "SELECT imageUrl FROM posts WHERE id = ? AND user_id = ?",
      [postId, userId],
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
      [postId, userId],
    );
    res.status(200).json({ message: "Suppression réussie" });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
