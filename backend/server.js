//immportation des bibliothèques nécessaires
const express = require("express");
const path = require("path");
const cors = require("cors");

const userRoute = require("./routes/user");
const postRoute = require("./routes/post");
const favRoute = require("./routes/fav");
const commentRoute = require("./routes/comment");
const profilRoute = require("./routes/profil");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use("/images", express.static("images"));

app.use("/api/auth", userRoute);
app.use("/api/post", postRoute);
app.use("/api/fav", favRoute);
app.use("/api/comment", commentRoute);
app.use("/api/profil", profilRoute);

//Route principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});
