const express = require("express"); // on charge Express
const cors = require("cors"); // on charge le middleware CORS permettant d'activer le partage
// des ressources entre différents origines, notamment entre le front-end et le back-end
const publications = require("./data/publications.json"); // chargement des données publications depuis son fichier
//console.log(publications); // affiche dans le terminal
const pool = require("./db");
const app = express(); // on créé l'application serveur
app.use(cors()); // function CORS qui autorise toutes les origines
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

// par défaut, garde cette API test pour montrer que le route "/" existe bien et contient
// les données, mais ensuite il faut utiliser la vraie route "api/publications"
// cette API test n'est nécessaire, mais reste propre pour nous dissuader à chaque 
// fois si on voit une page vide pour les données du projet et nous persuader que 
// le serveur est bel et bien actif ---> indicateur de santé
app.get("/", function (requete, reponse) {   // quand le navigateur fait une requète HTTP
// GET/, Express exécute cette fonction et renvoie une réponse --> principe du routage Express
  reponse.send("API Portfolio Rivo opérationnelle"); // ici, l'api renvoie une page html avec une phrase
});

app.get("/api/publications", function(requete,reponse){
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
  reponse.json(publications); // ici, l'api renvoie des données json (après les avoir chargées depuis le fichier des données json)
});
app.listen(port, function () { // le serveur reste à l'écoute du port
  console.log("Serveur démarré sur http://localhost:" + port);
  console.log("Publications : http://localhost:" + port + "/api/publications");
});
/* Ajout temporaire d'une route pour tester la communication entre le back-end et PostgreSQL */
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
/* Ajout temporaire d'une route pour tester la comm entre le backend et PostgreSQL, 
les données reposent sur la base de publications dans PostgreSQL */
app.get("/api/publications-db", function(requete, reponse){
  pool.query("SELECT id, authors, title, journal, volume, number, pages, year, doi FROM publications ORDER BY year ASC")
/* Ici, pool.query() envoie réellement le SELECT à PostgreSQL. 
Quand la requête réussit, node-postgres place les lignes retournées dans resultat.rows, 
et chaque ligne devient par défaut un objet JavaScript avec les noms de colonnes comme propriétés.
*/
  .then(function(resultat){
    reponse.json(resultat.rows);
  })
  .catch(function(erreur){
    console.error("Erreur lors de la lecture des publications PostgreSQL :", erreur);
    reponse.status(500).json({
      error: "Impossible de charger les publications depuis PostgreSQL"});
  });
});