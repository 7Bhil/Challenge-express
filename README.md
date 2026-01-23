# Challenge Platform - Backend

C'est le serveur API pour la plateforme de challenges, construit avec Node.js, Express et MongoDB.

## 🚀 Technologies utilisées

- **Node.js** & **Express** : Framework backend.
- **MongoDB** & **Mongoose** : Base de données NoSQL et ODM.
- **JWT (JSON Web Token)** : Authentification sécurisée.
- **Bcryptjs** : Hachage des mots de passe.
- **Cors** : Gestion du Cross-Origin Resource Sharing.
- **Dotenv** : Gestion des variables d'environnement.

## 📁 Structure du projet

```text
server/
├── controllers/    # Logique métier pour chaque route
├── models/         # Modèles Mongoose (User, Challenge, Submission)
├── routes/         # Définition des points de terminaison API
├── middleware/     # Middlewares (Auth, validation)
├── .env            # Variables d'environnement (non inclus au repo)
└── server.js      # Point d'entrée de l'application
```

## ⚙️ Installation

1. Accédez au dossier server :
   ```bash
   cd server
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Créez un fichier `.env` basé sur l'exemple :
   ```env
   PORT=5000
   MONGO_URI=votre_mongodb_uri
   JWT_SECRET=votre_secret_jwt
   REACT_APP_API_URL=http://localhost:5173
   ```
4. Démarrez le serveur en mode développement :
   ```bash
   npm run dev
   ```

## 🛠️ API Routes

- `/api/auth` : Login, Register, Logout.
- `/api/users` : Profil, Leaderboard.
- `/api/challenges` : CRUD des challenges, filtrage par deadline.
- `/api/submissions` : Soumissions des utilisateurs, notation par le jury.
- `/api/admin` : Gestion des utilisateurs et validation des challenges.
