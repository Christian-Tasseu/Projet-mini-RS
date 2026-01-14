
const mysql = require('mysql2');
 
// Créer une pool de connexions à la base de données MySQL
 
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost', //L'hôte de la base de données
    user: process.env.DB_USER || 'root', //Le nom d'utilisateur de la base de données
    password: process.env.DB_PASSWORD || '', //Le mot de passe de la base de données
    database: process.env.DB_NAME || 'RS', //Le nom de la base de données
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
 
module.exports = pool.promise(); //Exporter le pool de connexions