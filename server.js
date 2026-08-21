require("dotenv").config(); // charge explicitement .env pour utiliser directement 
// les variables de postgresql (db.js) et les variables d'administration (.env)
const express = require("express"); // on charge Express
const cors = require("cors"); // on charge le middleware CORS permettant d'activer le partage
// des ressources entre différents origines, notamment entre le front-end et le back-end
//const publications = require("./data/publications.json"); // chargement des données publications depuis son fichier
//console.log(publications); // affiche dans le terminal
const pool = require("./db");
const app = express(); // on créé l'application serveur
const bcrypt = require("bcryptjs"); // permet de hasher et vérifier le mpd sans les stocker en clair
const jwt = require("jsonwebtoken"); // permet de créer une preuve temporaire d'authentification
app.use(cors()); // function CORS qui autorise toutes les origines
app.use(express.json()); // utilisé pour l'interface d'administration séparée que les 
// recruteurs ne voient pas. cette interface aura besoin de l'email et du mot de passe
// dans un fichier json
//const port = 3000;     // définition du port pour le localhost c-à-d mon pc
const port = process.env.PORT || 3000; // localement, on continue à avoir localhost : 3000
// mais sur Render, c'est l'hébergeur qui fournit le port à utiliser via la variable PORT, 
// et l'application devient compatible avec les 2 environnements (local+github)
/* Un route de test avec une simple phrase
//app.get("/", function (requete, reponse) {   // quand le navigateur fait une requète HTTP
// GET/, Express exécute cette fonction et renvoie une réponse --> principe du routage Express
//  reponse.send("API Portfolio Rivo opérationnelle"); // ici, l'api renvoie une page html avec une phrase
//});
*/

// par défaut, on garde cette API test pour montrer que le route "/" existe bien et contient
// les données, mais ensuite il faut utiliser la vraie route "api/publications"
// cette API test n'est nécessaire, mais reste propre pour nous dissuader à chaque 
// fois si on voit une page vide pour les données du projet et nous persuader que 
// le serveur est bel et bien actif ---> indicateur de santé
app.get("/", function (requete, reponse) {   // quand le navigateur fait une requète HTTP
// GET/, Express exécute cette fonction et renvoie une réponse --> principe du routage Express
  reponse.send("API Portfolio Rivo opérationnelle"); // ici, l'api renvoie une page html avec une phrase
});

/*
Ici on définit la 1è route d'authentification POST /api/admin/login, l'API qui permet
de poster, d'ajouter, d'insérer de nouvelles données de publications. Cette API est
sécurisée, contrairement à l'API GET ci-dessous qui permet de lire publiquement 
les données de publications.
*/
app.post("/api/admin/login", async function(requete, reponse) { 
// async signie que cette function va effectuer des opérations asynchrones
    const email = requete.body.email;
    const password = requete.body.password;
    // Vérification que les deux informations ont bien été envoyées
//    console.log("ADMIN_EMAIL chargé :",Boolean(process.env.ADMIN_EMAIL));
//    console.log("ADMIN_PASSWORD_HASH chargé :",Boolean(process.env.ADMIN_PASSWORD_HASH));
//    console.log("Email correspondant :",email === process.env.ADMIN_EMAIL);    
    if (!email || !password) {
        return reponse.status(400).json({
            error: "Email et mot de passe requis"
        });
    }
    // Vérification de l'identifiant administrateur
    if (email !== process.env.ADMIN_EMAIL) {
        return reponse.status(401).json({
            error: "Identifiants incorrects"
        });
    }
    try {
        // Comparaison du mot de passe saisi avec le hash stocké dans .env
        const motDePasseValide = await bcrypt.compare(
// await signifie attendre le résultat de cette opération avant de poursuivre la fonction
            password,
            process.env.ADMIN_PASSWORD_HASH
        );
        if (!motDePasseValide) {
            return reponse.status(401).json({
                error: "Identifiants incorrects"
            });
        }
        // L'identité est correcte : création d'un JWT
        const token = jwt.sign(
            {
                role: "admin"
            },
            process.env.JWT_SECRET, // le token expire 1j après
            {
                expiresIn: "1h"
            }
        );
        reponse.json({
            message: "Authentification réussie",
            token: token
        });
    } catch (erreur) {
        console.error(
            "Erreur lors de l'authentification :",
            erreur
        );
        reponse.status(500).json({
            error: "Erreur interne du serveur"
        });
    }
});

//app.get("/api/publications", function(requete,reponse){
// Ici, on définit maintenant une route test de publications
/*  
  const publications = [
    {
      id: "test-1",
      title: "Première publication test",
      year: 2016
    },
    {
      id: "test-2",
      title: "Deuxième publication test",
      year: 2020
    }
  ];
*/
// Ici, on utilise maintenant les vraies données des publications
//  reponse.json(publications); // ici, l'api renvoie des données json (après les avoir chargées depuis le fichier des données json)
//});
/* Après la route test de publications, on la remplace par une route provenant de la 
base de doonées PostgreSQL, ci-dessous. Si tout marche bien, on devrait retrouver 
la base de données sur une page de lien htttp://localhost:3000/api/publications en 
ouvrant justement ce lien
*/
app.get("/api/publications", function(requete, reponse) {
    pool.query("SELECT id, authors, title, journal, volume, number, pages, year, doi FROM publications ORDER BY year ASC")
    .then(function(resultat) {
        reponse.json(resultat.rows);
    })
    .catch(function(erreur) {
        console.error(
            "Erreur lors de la lecture des publications PostgreSQL :",
            erreur
        );
        reponse.status(500).json({
            error: "Impossible de charger les publications"
        });
    });
});
//
app.listen(port, function () { // le serveur reste à l'écoute du port
  console.log("Serveur démarré sur http://localhost:" + port);
  console.log("Publications : http://localhost:" + port + "/api/publications");
});

/* Ajout temporaire d'une route pour tester la communication entre le back-end et PostgreSQL */
/*
app.get("/api/test-db", function(requete, reponse) {
    pool.query("SELECT current_database() AS database, NOW() AS server_time")
    .then(function(resultat) {
        reponse.json(resultat.rows[0]);
    })
    .catch(function(erreur) {
        console.error("Erreur PostgreSQL :", erreur);
        reponse.status(500).json({
            error: "Connexion à PostgreSQL impossible"
        });
    });
});
*/
/* Ajout temporaire d'une route pour tester la comm entre le backend et PostgreSQL, 
les données reposent sur la base de publications dans PostgreSQL */

//app.get("/api/publications-db", function(requete, reponse){
//  pool.query("SELECT id, authors, title, journal, volume, number, pages, year, doi FROM publications ORDER BY year ASC")
  /* Ici, pool.query() envoie réellement le SELECT à PostgreSQL. 
Quand la requête réussit, node-postgres place les lignes retournées dans resultat.rows, 
et chaque ligne devient par défaut un objet JavaScript avec les noms de colonnes comme propriétés.
*/
/*
  .then(function(resultat){
    reponse.json(resultat.rows);
  })
  .catch(function(erreur){
    console.error("Erreur lors de la lecture des publications PostgreSQL :", erreur);
    reponse.status(500).json({
      error: "Impossible de charger les publications depuis PostgreSQL"});
  });
});
*/
