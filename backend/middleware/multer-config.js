const multer = require('multer');
const path = require('path');

// 1. On définit où on stocke l'image et comment on la nomme
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images'); // On les met dans un dossier nommé 'images'
  },
  filename: (req, file, callback) => {
    // On crée un nom unique : NomDOrigine + Date + Extension
    const name = file.originalname.split(' ').join('_');
    const extension = path.extname(file.originalname);
    callback(null, name + Date.now() + extension);
  }
});

// 2. On exporte la configuration
module.exports = multer({ storage: storage }).single('image');