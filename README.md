# Projet Mini Réseau Social

## Description
Ce projet est une application web de réseau social minimaliste développée avec une architecture full-stack. Le backend est construit avec Node.js et Express, utilisant MySQL comme base de données, tandis que le frontend utilise Vue.js 3 avec Vite pour le développement rapide.

L'application permet aux utilisateurs de s'inscrire, se connecter, publier des messages et des images, liker les publications, et consulter leur profil.

## Fonctionnalités
- **Authentification** : Inscription et connexion avec hashage des mots de passe (bcrypt) et tokens JWT
- **Publication** : Création de posts textuels avec possibilité d'ajouter des images
- **Interactions** : Système de likes (favoris) sur les publications
- **Gestion des posts** : Suppression de ses propres publications (avec suppression automatique des images associées)
- **Profil utilisateur** : Affichage des informations de profil
- **Feed** : Affichage chronologique des publications de tous les utilisateurs
- **Upload d'images** : Gestion des fichiers images avec Multer

## Technologies utilisées
### Backend
- **Node.js** avec **Express.js** pour le serveur
- **MySQL** pour la base de données
- **bcrypt** pour le hashage des mots de passe
- **jsonwebtoken** pour l'authentification JWT
- **multer** pour l'upload de fichiers
- **cors** pour la gestion des requêtes cross-origin
- **dayjs** pour la manipulation des dates

### Frontend
- **Vue.js 3** avec Composition API
- **Vue Router** pour la navigation
- **Vite** pour le bundling et le développement
- **FontAwesome** pour les icônes
- **dayjs** pour les dates

## Structure du projet
```
Projet_mini_RS/
├── backend/
│   ├── config/
│   │   └── db.js                 # Configuration de la base de données MySQL
│   ├── middleware/
│   │   └── multer-config.js      # Configuration de Multer pour l'upload
│   ├── images/                   # Dossier pour stocker les images uploadées
│   ├── package.json
│   └── server.js                 # Serveur Express principal
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── views/
│   │   │   ├── Accueil.vue       # Page d'accueil avec feed et publication
│   │   │   ├── Connexion.vue     # Page de connexion
│   │   │   ├── Inscription.vue   # Page d'inscription
│   │   │   └── Profil.vue        # Page de profil utilisateur
│   │   ├── App.vue
│   │   ├── main.js
│   │   ├── router.js             # Configuration du router Vue
│   │   └── style.css
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
└── README.md
```

## Installation et configuration

### Prérequis
- Node.js (version 14 ou supérieure)
- MySQL Server
- npm ou yarn

### 1. Clonage du projet
```bash
git clone <url-du-repo>
cd Projet_mini_RS
```

### 2. Configuration de la base de données
- Créez une base de données MySQL nommée `RS`
- Créez les tables suivantes :

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    imageUrl VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE favs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_fav (user_id, post_id)
);
```

### 3. Installation des dépendances

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd ../frontend
npm install
```

### 4. Configuration des variables d'environnement (optionnel)
Créez un fichier `.env` dans le dossier `backend` pour configurer la base de données :
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=RS
```

## Lancement de l'application

### Démarrage du backend
```bash
cd backend
npx nodemon server.js
```
Le serveur sera accessible sur `http://localhost:3000`

### Démarrage du frontend
```bash
cd frontend
npm run dev
```
L'application frontend sera accessible sur `http://localhost:5173` (port par défaut de Vite)

## Utilisation
1. Accédez à l'application via le frontend
2. Inscrivez-vous avec un nom d'utilisateur, email et mot de passe
3. Connectez-vous avec vos identifiants
4. Sur la page d'accueil, publiez des messages et images
5. Likez les publications des autres utilisateurs
6. Consultez votre profil via l'icône utilisateur en haut

## API Endpoints
- `POST /api/inscription` : Inscription d'un nouvel utilisateur
- `POST /api/connexion` : Connexion utilisateur
- `GET /api/profil` : Récupération des données du profil
- `GET /api/users` : Liste des utilisateurs
- `GET /api/listUsers` : Liste des noms d'utilisateurs
- `POST /api/publier` : Publication d'un post (avec image optionnelle)
- `GET /api/posts` : Récupération de tous les posts
- `POST /api/addFav/:postId` : Ajouter un like à un post
- `DELETE /api/removeFav/:postId` : Retirer un like d'un post
- `DELETE /api/post/:postId` : Supprimer un post

## Développement
- Le backend utilise des tokens JWT pour l'authentification
- Les images sont stockées localement dans le dossier `backend/images/`
- Le frontend communique avec le backend via des requêtes fetch
- La base de données utilise des relations foreign key pour maintenir l'intégrité

## Améliorations possibles
- Ajout de commentaires sur les posts
- Système de suivi d'utilisateurs
- Notifications en temps réel
- Pagination du feed
- Validation plus poussée des données
- Tests unitaires et d'intégration