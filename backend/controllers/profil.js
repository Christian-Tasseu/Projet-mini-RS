const db = require("../config/db");

exports.getProfil = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [
      req.user.id,
    ]);
    res.send(rows);
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

exports.getProfilPage = (req, res) => {
  if (req.user.id) {
    res.status(200).send("Redirection accordée");
  } else {
    console.error("Erreur lors de la rédirection :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.getProfilData = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [
      req.user.id,
    ]);
    res.send(rows);
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

exports.updateImage = async (req, res) => {
  const userId = req.params.userId;
  const imageUrl = `${req.protocol}://${req.get("host")}/images/${
    req.file.filename
  }`;
  try {
    const result = await db.query(
      "UPDATE users SET url_photo = ? WHERE id = ?",
      [imageUrl, userId],
    );
    res
      .status(200)
      .json({ message: "Image de profil mise à jour", imageUrl: imageUrl });
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour de l'image de profil :",
      error,
    );
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.updateName = async (req, res) => {
  const userId = req.params.userId;
  const { newName } = req.body;
  try {
    const result = await db.query(
      "UPDATE users SET username = ? WHERE id = ?",
      [newName, userId],
    );
    res.status(200).json({ message: "Nom d'utilisateur mis à jour" });
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour du nom d'utilisateur :",
      error,
    );
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.updateBio = async (req, res) => {
  const userdId = req.params.userId;
  const { newBio } = req.body;
  try {
    const result = await db.query("UPDATE users SET bio = ? WHERE id = ?", [
      newBio,
      userdId,
    ]);
    res.status(200).json({ message: "Bio mise à jour" });
  } catch (err) {
    console.error("Erreur lors de la mise à jour de la bio : ", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.updateEmail = async (req, res) => {
  const userId = req.params.userId;
  const { newEmail } = req.body;
  try {
    const result = await db.query("UPDATE users SET email = ? WHERE id = ?", [
      newEmail,
      userId,
    ]);
    res.status(200).json({ message: "E-mail mis à jour" });
  } catch (err) {
    console.error("Erreur lors de la mise à jour de l'email : ", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
