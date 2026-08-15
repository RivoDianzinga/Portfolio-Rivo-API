const express = require("express"); // on charge Express
const cors = require("cors"); // on charge le middleware CORS permettant d'activer le partage
// des ressources entre différents origines, notamment entre le front-end et le back-end
const publications = require("./data/publications.json"); // chargement des données publications depuis son fichier
//console.log(publications); // affiche dans le terminal
const app = express(); // on créé l'application serveur
app.use(cors()); // function CORS qui autorise toutes les origines
//const port = 3000;     // définition du port pour le localhost c-à-d mon pc
const port = process.env.PORT || 3000; // localement, on continue à avoir localhost : 3000
// mais sur Render, c'est l'hébergeur qui fournit le port à utiliser via la variable PORT, 
// et l'application devient compatible avec les 2 environnements (local+github)
/* Un route de test avec une simple phrase
// app.get("/", function (requete, reponse) {   // quand le navigateur fait une requète HTTP
// GET/, Express exécute cette fonction et renvoie une réponse --> principe du routage Express
//  reponse.send("API Portfolio Rivo opérationnelle"); // ici, l'api renvoie une page html avec une phrase
//});
*/

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
